/* FILE: src/chats/schemas/offer.schema.ts */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OfferStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chat: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Request', required: true })
  request: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  helper: Types.ObjectId;

  @Prop({ enum: OfferStatus, default: OfferStatus.PENDING })
  status: OfferStatus;

  @Prop({ type: Object })
  meta?: any; // optional extra data
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
export type OfferDocument = Offer & Document;
