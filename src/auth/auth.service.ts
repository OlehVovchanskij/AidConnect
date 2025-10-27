import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  BCRYPT_SALT_ROUNDS,
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  START_POINTS,
} from './constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,

    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  private async hashData(data: string) {
    return bcrypt.hash(data, BCRYPT_SALT_ROUNDS);
  }

  private async compareHash(data: string, hash: string) {
    return bcrypt.compare(data, hash);
  }

  private signAccessToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
  }

  private async signRefreshToken(payload: any) {
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
    return refreshToken;
  }

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const created = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      publicKey: dto.publicKey,
      points: START_POINTS,
      roles: ['user'],
    });

    const payload = {
      userId: String(created._id),
      email: created.email,
      roles: created.roles,
    };
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    created.refreshTokenHash = await this.hashData(refreshToken);
    await created.save();

    return {
      user: this.sanitizeUser(created),
      accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.compareHash(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      userId: String(user._id),
      email: user.email,
      roles: user.roles,
    };
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);

    user.refreshTokenHash = await this.hashData(refreshToken);
    await user.save();

    return { user: this.sanitizeUser(user), accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken)
      throw new BadRequestException('No refresh token provided');
    // verify token signature and extract payload
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userModel.findById(payload.userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.refreshTokenHash)
      throw new UnauthorizedException('No refresh token stored');

    const matches = await this.compareHash(refreshToken, user.refreshTokenHash);
    if (!matches)
      throw new UnauthorizedException('Refresh token does not match');

    // rotate refresh token: issue new refresh token and replace hash
    const newPayload = {
      userId: String(user._id),
      email: user.email,
      roles: user.roles,
    };
    const accessToken = await this.signAccessToken(newPayload);
    const newRefreshToken = await this.signRefreshToken(newPayload);

    user.refreshTokenHash = await this.hashData(newRefreshToken);
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    user.refreshTokenHash = undefined;
    await user.save();
    return { ok: true };
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user as any);
  }

  async getUserFromToken(token: string) {
    if (!token) throw new UnauthorizedException('No token provided');

    const tokenWithoutBearer = token.replace('Bearer ', '').trim();

    // Спроба перевірити access token
    try {
      const decoded = this.jwtService.verify(tokenWithoutBearer, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
      return await this.getUserById(decoded.sub);
    } catch {
      // Спроба перевірити refresh token
      try {
        const decoded = this.jwtService.verify(tokenWithoutBearer, {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
        return await this.getUserById(decoded.sub);
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
  }

  private async getUserById(id: string) {
    const user = await this.usersService.getById(id);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  sanitizeUser(user: any) {
    // remove sensitive fields
    const { passwordHash, refreshTokenHash, __v, ...rest } = user.toObject
      ? user.toObject()
      : user;
    return rest;
  }
}
