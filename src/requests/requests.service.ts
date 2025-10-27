import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { RequestStatus } from 'src/common/enums';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestDocument, RequestModel } from './schemas/request.schema';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(RequestModel.name)
    private requestModel: Model<RequestDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  // Create request: deduct 1 point from author in transaction
  async createRequest(authorId: string, dto: CreateRequestDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const user = await this.userModel.findById(authorId).session(session);
      if (!user) throw new NotFoundException('User not found');
      if ((user.points ?? 0) < 1)
        throw new BadRequestException('Not enough points to create request');

      user.points = (user.points ?? 0) - 1;
      await user.save({ session });

      const request = await this.requestModel.create(
        [
          {
            author: new Types.ObjectId(authorId),
            title: dto.title,
            description: dto.description,
            category: dto.category,
            importance: dto.importance ?? undefined,
            costPoints: 1,
            status: RequestStatus.OPEN,
            location: { type: 'Point', coordinates: [dto.lng, dto.lat] },
          },
        ],
        { session },
      );

      await session.commitTransaction();
      return request[0];
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // Find nearby or by filters
  async findNearby(opts: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    importance?: string;
    limit?: number;
    skip?: number;
  }) {
    const {
      lat,
      lng,
      radius = 5000,
      category,
      importance,
      limit = 20,
      skip = 0,
    } = opts;
    const match: any = { status: RequestStatus.OPEN };
    if (category) match.category = category;
    if (importance) match.importance = importance;

    if (typeof lat === 'number' && typeof lng === 'number') {
      const agg: any[] = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [lng, lat] },
            distanceField: 'distanceMeters',
            spherical: true,
            maxDistance: radius,
            query: match,
          },
        },
        { $sort: { distanceMeters: 1 } },
        { $skip: skip },
        { $limit: limit },
        // Optionally populate author fields via $lookup
      ];
      return this.requestModel.aggregate(agg).exec();
    }

    return this.requestModel
      .find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getById(requestId: string) {
    if (!Types.ObjectId.isValid(requestId))
      throw new BadRequestException('Invalid id');
    const req = await this.requestModel
      .findById(requestId)
      .populate('author', '-passwordHash -refreshTokenHash')
      .exec();
    if (!req) throw new NotFoundException('Request not found');
    return req;
  }

  async updateRequest(requestId: string, userId: string, dto: any) {
    const req = await this.requestModel.findById(requestId);
    if (!req) throw new NotFoundException('Request not found');
    if (req.author.toString() !== userId)
      throw new ForbiddenException('Only author can update request');
    if (req.status !== RequestStatus.OPEN)
      throw new BadRequestException('Only OPEN requests can be updated');

    Object.assign(req, dto);
    await req.save();
    return req;
  }

  // Confirm offer: set helper and move to IN_PROGRESS (should be called when requester confirms helper's offer)
  async confirmOffer(requestId: string, confirmerId: string, helperId: string) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const req = await this.requestModel.findById(requestId).session(session);
      if (!req) throw new NotFoundException('Request not found');
      if (req.status !== RequestStatus.OPEN)
        throw new BadRequestException('Request is not open');
      if (req.author.toString() !== confirmerId)
        throw new ForbiddenException('Only requester can confirm offer');

      req.helper = new Types.ObjectId(helperId);
      req.status = RequestStatus.IN_PROGRESS;
      await req.save({ session });

      await session.commitTransaction();
      return req;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // Complete request: if success=true, award point to helper
  async completeRequest(
    requestId: string,
    completerId: string,
    success: boolean,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const req = await this.requestModel.findById(requestId).session(session);
      if (!req) throw new NotFoundException('Request not found');
      if (req.status !== RequestStatus.IN_PROGRESS)
        throw new BadRequestException('Request is not in progress');

      // Only participants can complete: helper or author can initiate complete, but confirmation flow should be enforced by caller
      const helperId = req.helper ? req.helper.toString() : null;
      if (!helperId) throw new BadRequestException('No helper assigned');

      if (success) {
        // award point to helper
        const helper = await this.userModel.findById(helperId).session(session);
        if (!helper) throw new NotFoundException('Helper not found');
        helper.points = (helper.points ?? 0) + 1;
        await helper.save({ session });

        req.status = RequestStatus.COMPLETED_SUCCESS;
      } else {
        req.status = RequestStatus.COMPLETED_FAILED;
      }

      await req.save({ session });
      await session.commitTransaction();
      return req;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // Attach chat id to request (used by ChatsService when creating chat)
  async attachChatToRequest(requestId: string, chatId: string) {
    if (!Types.ObjectId.isValid(requestId))
      throw new BadRequestException('Invalid request id');
    if (!Types.ObjectId.isValid(chatId))
      throw new BadRequestException('Invalid chat id');
    const req = await this.requestModel.findById(requestId);
    if (!req) throw new NotFoundException('Request not found');
    req.chat = new Types.ObjectId(chatId);
    await req.save();
    return req;
  }
}
