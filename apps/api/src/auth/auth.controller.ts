import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private prisma: PrismaService, private jwt: JwtService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.register(dto);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto);
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'lax' });
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret' });
    return this.auth.refresh(payload.sub);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) {
      const all = await this.prisma.refreshToken.findMany();
      for (const row of all) {
        // simple rotating invalidation for MVP
        await this.prisma.refreshToken.update({ where: { id: row.id }, data: { revokedAt: new Date() } });
      }
    }
    res.clearCookie('refresh_token');
    return { ok: true };
  }

  @Post('verify-email')
  verifyEmail() {
    return { ok: true, message: 'Verification mocked for local environment' };
  }

  @Post('reset')
  resetPassword() {
    return { ok: true, message: 'Reset email mocked for local environment' };
  }
}
