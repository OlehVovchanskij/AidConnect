import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    // user contains payload from JWT strategy; return sanitized user object
    return this.authService.getMe(user.userId);
  }

  @Get()
  getProfile(@Req() req) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    return this.authService.getUserFromToken(token);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }
}
