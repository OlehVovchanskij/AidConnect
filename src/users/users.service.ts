import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;

    if (dto.location) {
      updateData.location = {
        type: 'Point',
        coordinates: [dto.location.longitude, dto.location.latitude],
      };
    }

    const updated = await this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async setPublicKey(userId: string, publicKey: string): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { publicKey }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async getPublicKey(userId: string): Promise<string> {
    const user = await this.getById(userId);
    if (!user.publicKey) throw new NotFoundException('Public key not found');
    return user.publicKey;
  }

  async addPoints(userId: string, points: number): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $inc: { points } }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async subtractPoints(userId: string, points: number): Promise<User> {
    const updated = await this.userModel
      .findByIdAndUpdate(userId, { $inc: { points: -points } }, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }
}
