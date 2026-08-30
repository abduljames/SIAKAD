import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { JenisTagihan } from './jenis-tagihan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jenis-tagihan')
@UseGuards(JwtAuthGuard)
export class JenisTagihanController {
  constructor(@InjectRepository(JenisTagihan) private repo: Repository<JenisTagihan>) {}

  @Get()
  async findAll(@Query('search') search?: string, @Query('status') status?: string) {
    const where: any = {};
    if (search) where.nama = ILike(`%${search}%`);
    if (status) where.status = status;
    const data = await this.repo.find({ where, order: { urutan: 'ASC', id: 'ASC' } });
    return { data, total: await this.repo.count() };
  }

  @Post()
  create(@Body() body: Partial<JenisTagihan>) {
    return this.repo.save(this.repo.create(body));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: Partial<JenisTagihan>) {
    await this.repo.update(id, body);
    return this.repo.findOneBy({ id });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.repo.delete(id);
    return { status: true };
  }
}
