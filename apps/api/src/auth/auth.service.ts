import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already registered');
    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({ data: { ...dto, passwordHash } });
    // TODO integrate email sender provider
    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.lockedUntil && user.lockedUntil > new Date()) throw new UnauthorizedException('Account locked');

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: { increment: 1 } } });
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0 } });
    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.issueTokens(user.id, user.email, user.role);
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, email, role }, { expiresIn: '15m', secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret' });
    const refreshToken = await this.jwt.signAsync({ sub: userId, type: 'refresh' }, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret' });
    const tokenHash = await argon2.hash(refreshToken);
    await this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) } });
    return { accessToken, refreshToken };
  }
}
