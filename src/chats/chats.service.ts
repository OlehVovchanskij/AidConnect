import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestsService } from '../requests/requests.service';
import { UserDocument } from '../users/schemas/user.schema';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { Offer, OfferDocument, OfferStatus } from './schemas/offer.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => RequestsService))
    private requestsService: RequestsService,
  ) {}

  async initChat(initiatorId: string, dto: any) {
    // validate participants include initiator
    const { participants, encryptedKeys, requestId } = dto;
    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length < 2
    )
      throw new BadRequestException('participants required');
    if (!participants.includes(initiatorId)) participants.push(initiatorId);

    // create chat
    const chat = await this.chatModel.create({
      participants: participants.map((p: string) => new Types.ObjectId(p)),
      encryptedKeys,
      request: requestId ? new Types.ObjectId(requestId) : undefined,
    });

    // optionally, attach chat id to request (if requestId provided)
    if (requestId) {
      try {
        await this.requestsService.attachChatToRequest(
          requestId,
          String(chat._id),
        );
      } catch (e) {
        // non-fatal: proceed but log or rethrow depending on needs
      }
    }

    return chat;
  }

  async getChat(chatId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatId))
      throw new BadRequestException('Invalid chat id');
    const chat = await this.chatModel
      .findById(chatId)
      .populate('participants', '-passwordHash -refreshTokenHash')
      .exec();
    if (!chat) throw new NotFoundException('Chat not found');
    // ensure user is participant
    if (!chat.participants.map((p: any) => p._id.toString()).includes(userId))
      throw new ForbiddenException('Not a participant');
    return chat;
  }

  async sendMessage(chatId: string, senderId: string, dto: any) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.participants.map((p: any) => p.toString()).includes(senderId))
      throw new ForbiddenException('Not a participant');

    const message = await this.messageModel.create({
      chat: chat._id,
      sender: new Types.ObjectId(senderId),
      payload: dto.payload,
      meta: dto.meta,
    });
    return message;
  }

  async getMessages(chatId: string, userId: string, limit = 50, skip = 0) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.participants.map((p: any) => p.toString()).includes(userId))
      throw new ForbiddenException('Not a participant');

    return this.messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  // helper creates an offer through chat
  async createOffer(chatId: string, helperId: string, dto: any) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!chat.participants.map((p: any) => p.toString()).includes(helperId))
      throw new ForbiddenException('Not a participant');
    if (!chat.request)
      throw new BadRequestException('Chat is not linked to a request');

    const offer = await this.offerModel.create({
      chat: chat._id,
      request: chat.request,
      helper: new Types.ObjectId(helperId),
      status: OfferStatus.PENDING,
      meta: dto.meta,
    });

    // Also save an encrypted message to chat (clients should encrypt offer payload)
    if (dto.messagePayload) {
      await this.messageModel.create({
        chat: chat._id,
        sender: new Types.ObjectId(helperId),
        payload: dto.messagePayload,
        meta: { type: 'OFFER' },
      });
    }

    return offer;
  }

  // requester confirms an offer -> link helper to request via RequestsService
  async confirmOffer(offerId: string, confirmerId: string) {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) throw new NotFoundException('Offer not found');
    const chat = await this.chatModel.findById(offer.chat);
    if (!chat) throw new NotFoundException('Chat not found');

    // only request author can confirm (we'll fetch request to check author)
    const request = await this.requestsService.getById(
      offer.request.toString(),
    );
    if (request.author.toString() !== confirmerId)
      throw new ForbiddenException('Only requester can confirm offer');

    if (offer.status !== OfferStatus.PENDING)
      throw new BadRequestException('Offer not pending');

    // mark offer confirmed
    offer.status = OfferStatus.CONFIRMED;
    await offer.save();

    // update request to IN_PROGRESS via RequestsService (this is transactional in RequestsService)
    await this.requestsService.confirmOffer(
      offer.request.toString(),
      confirmerId,
      offer.helper.toString(),
    );

    // optionally push a message into chat indicating confirmation (encrypted by client)
    return offer;
  }
}
