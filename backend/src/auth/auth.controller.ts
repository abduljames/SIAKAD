import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUser } from './admin-user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(AdminUser) private adminRepo: Repository<AdminUser>,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const admin = await this.adminRepo.findOne({ where: { username: (body.username || '').toLowerCase() } });
    if (!admin) throw new BadRequestException('Username atau password salah');

    const cocok = await bcrypt.compare(body.password || '', admin.password);
    if (!cocok) throw new BadRequestException('Username atau password salah');

    const access_token = this.jwtService.sign(
      { userId: admin.id, nama: admin.nama },
      { secret: process.env.JWT_SECRET || 'siakad-dev-secret', expiresIn: '8h' },
    );
    return { access_token, nama: admin.nama };
  }
}
