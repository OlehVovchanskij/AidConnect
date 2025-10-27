import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: Types.ObjectId[];

  // encrypted symmetric key for each participant (RSA-encrypted by the client)
  @Prop([{ user: { type: Types.ObjectId, ref: 'User' }, encryptedKey: String }])
  encryptedKeys: { user: Types.ObjectId; encryptedKey: string }[];

  @Prop({ type: Types.ObjectId, ref: 'Request' })
  request?: Types.ObjectId;

  @Prop({ default: false })
  closed: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.index({ participants: 1 });

export type ChatDocument = Chat & Document;
