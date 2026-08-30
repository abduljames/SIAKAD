import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kelas } from './kelas.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('kelas')
@UseGuards(JwtAuthGuard)
export class KelasController {
  constructor(@InjectRepository(Kelas) private kelasRepo: Repository<Kelas>) {}

  @Get()
  findAll() {
    return this.kelasRepo.find({ order: { nama: 'ASC' } });
  }

  @Post()
  create(@Body() body: { nama: string; tingkat?: string }) {
    return this.kelasRepo.save(this.kelasRepo.create(body));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: { nama: string; tingkat?: string }) {
    await this.kelasRepo.update(id, body);
    return this.kelasRepo.findOneBy({ id });
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.kelasRepo.delete(id);
    return { status: true };
  }
}
