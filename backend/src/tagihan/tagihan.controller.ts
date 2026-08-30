import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Tagihan } from './tagihan.entity';
import { TagihanDetail } from './tagihan-detail.entity';
import { JenisTagihan } from './jenis-tagihan.entity';
import { Santri } from '../santri/santri.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RincianInput {
  jenisTagihanId: number;
  keterangan?: string;
  jumlah: number;
  diskon?: number;
  denda?: number;
}

@Controller('tagihan')
@UseGuards(JwtAuthGuard)
export class TagihanController {
  constructor(
    @InjectRepository(Tagihan) private tagihanRepo: Repository<Tagihan>,
    @InjectRepository(Santri) private santriRepo: Repository<Santri>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('periode') periode?: string,
    @Query('kelasId') kelasId?: number,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (periode) where.periode = periode;
    if (kelasId) where.santri = { kelas: { id: kelasId } };
    if (search) where.santri = { ...(where.santri || {}), nama: ILike(`%${search}%`) };
    return this.tagihanRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tagihanRepo.findOneBy({ id });
  }

  @Post()
  async create(
    @Body()
    body: {
      santriId: number;
      periode: string;
      jatuhTempo: string;
      referensi?: string;
      rincian: RincianInput[];
    },
  ) {
    if (!body.santriId) throw new BadRequestException('Pilih santri terlebih dahulu.');
    if (!body.rincian || body.rincian.length === 0) {
      throw new BadRequestException('Rincian tagihan minimal 1 baris.');
    }

    const santri = await this.santriRepo.findOneBy({ id: body.santriId });
    if (!santri) throw new BadRequestException('Santri tidak ditemukan.');

    return this.dataSource.transaction(async (manager) => {
      const count = await manager.count(Tagihan);
      const tanggalKode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const noTagihan = `TAG-${tanggalKode}-${String(count + 1).padStart(4, '0')}`;

      const rincianEntities: TagihanDetail[] = [];
      let totalTagihan = 0;
      for (const r of body.rincian) {
        const jenisTagihan = await manager.findOneBy(JenisTagihan, { id: r.jenisTagihanId });
        if (!jenisTagihan) throw new BadRequestException('Jenis tagihan tidak valid.');
        const diskon = r.diskon || 0;
        const denda = r.denda || 0;
        const total = Number(r.jumlah) - diskon + denda;
        totalTagihan += total;
        rincianEntities.push(
          manager.create(TagihanDetail, {
            jenisTagihan,
            keterangan: r.keterangan,
            jumlah: r.jumlah,
            diskon,
            denda,
            total,
          }),
        );
      }

      const tagihan = manager.create(Tagihan, {
        noTagihan,
        santri,
        periode: body.periode,
        jatuhTempo: body.jatuhTempo,
        referensi: body.referensi,
        rincian: rincianEntities,
        totalTagihan,
        totalTerbayar: 0,
        status: 'Belum Bayar',
      });
      await manager.save(tagihan);
      return tagihan;
    });
  }
}
