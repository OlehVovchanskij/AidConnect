import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chat: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ required: true })
  payload: string; // encrypted blob (base64)

  @Prop({ type: Object })
  meta?: any; // iv, nonce, type: 'TEXT'|'OFFER'|'OFFER_CONFIRM' etc.
}
export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ chat: 1, createdAt: -1 });
export type MessageDocument = Message & Document;
