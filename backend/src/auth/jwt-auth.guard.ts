import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Auth SIAKAD sengaja simpel -- cuma satu akun Admin (lihat AdminUser), tidak
// ada matrix permission per-modul seperti Koperasi Digital. Guard ini cukup
// verifikasi token valid, tidak perlu cek role/permission apa pun.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }
    const token = authHeader.slice(7);
    try {
      request.user = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'siakad-dev-secret' });
      return true;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kadaluarsa');
    }
  }
}
