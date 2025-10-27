import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ChatsService } from './chats.service';
import { ConfirmOfferDto } from './dto/confirm-offer.dto';
import { InitChatDto } from './dto/init-chat.dto';
import { OfferDto } from './dto/offer.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async init(@CurrentUser() user: any, @Body() dto: InitChatDto) {
    return this.chatsService.initChat(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chatsService.getChat(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  async sendMessage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatsService.sendMessage(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessages(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.chatsService.getMessages(
      id,
      user.userId,
      limit ? Number(limit) : undefined,
      skip ? Number(skip) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/offer')
  async offer(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: OfferDto,
  ) {
    // dto.chatId is expected, but we also pass param id for safety
    return this.chatsService.createOffer(id, user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('offers/confirm')
  async confirmOffer(@CurrentUser() user: any, @Body() dto: ConfirmOfferDto) {
    return this.chatsService.confirmOffer(dto.offerId, user.userId);
  }
}
