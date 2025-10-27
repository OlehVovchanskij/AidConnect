import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SetPublicKeyDto } from './dto/set-public-key.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req) {
    return this.usersService.getById(req.user.userId);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@Req() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/public-key')
  async setPublicKey(@Req() req, @Body() dto: SetPublicKeyDto) {
    return this.usersService.setPublicKey(req.user.userId, dto.publicKey);
  }

  @Get(':id/public-key')
  async getPublicKey(@Param('id') id: string) {
    return this.usersService.getPublicKey(id);
  }
}
