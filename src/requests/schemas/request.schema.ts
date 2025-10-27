import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HelpCategory, Importance, RequestStatus } from 'src/common/enums';

@Schema({ timestamps: true })
export class RequestModel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ enum: HelpCategory, required: true })
  category: HelpCategory;

  @Prop({ enum: Importance, default: Importance.MEDIUM })
  importance: Importance;

  @Prop({ type: Number, default: 0 })
  costPoints: number;

  @Prop({ enum: RequestStatus, default: RequestStatus.OPEN })
  status: RequestStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  helper?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat' })
  chat?: Types.ObjectId;

  // GeoJSON Point: coordinates [lng, lat]
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: { type: 'Point'; coordinates: [number, number] };
}

export const RequestSchema = SchemaFactory.createForClass(RequestModel);
RequestSchema.index({ location: '2dsphere' });
RequestSchema.index({ status: 1, category: 1, importance: 1 });

export type RequestDocument = RequestModel & Document;
