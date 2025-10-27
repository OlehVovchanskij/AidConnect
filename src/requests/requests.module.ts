import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { RequestModel, RequestSchema } from './schemas/request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestModel.name, schema: RequestSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [RequestsService],
  controllers: [RequestsController],
  exports: [RequestsService],
})
export class RequestsModule {}
