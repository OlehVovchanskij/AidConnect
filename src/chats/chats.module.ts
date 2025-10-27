import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestsModule } from '../requests/requests.module';
import { User, UserSchema } from '../users/schemas/user.schema';

import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Offer, OfferSchema } from './schemas/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => RequestsModule),
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
  exports: [ChatsService],
})
export class ChatsModule {}
