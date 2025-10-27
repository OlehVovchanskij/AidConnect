import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  name?: string;

  @Prop({ default: 0 })
  points: number;

  // RSA public key PEM string of the client (optional)
  @Prop()
  publicKey?: string;

  @Prop({ default: [] })
  roles: string[];

  // hashed refresh token (bcrypt) for refresh token rotation
  @Prop()
  refreshTokenHash?: string;

  // optional last known location if you want to store it
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  })
  location?: { type: 'Point'; coordinates: [number, number] };
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 });

export type UserDocument = User & Document;
