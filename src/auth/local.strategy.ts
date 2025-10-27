import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // Not used directly in controller (we use login DTO), but available if desired
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService['userModel'].findOne({
      email: email.toLowerCase(),
    });
    if (!user) throw new UnauthorizedException();
    const valid = await this.authService['compareHash'](
      password,
      user.passwordHash,
    );
    if (!valid) throw new UnauthorizedException();
    return {
      userId: String(user._id),
      email: user.email,
      roles: user.roles,
    };
  }
}
