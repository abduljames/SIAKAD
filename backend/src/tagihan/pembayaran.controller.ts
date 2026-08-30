import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Pembayaran } from './pembayaran.entity';
import { Tagihan } from './tagihan.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pembayaran')
@UseGuards(JwtAuthGuard)
export class PembayaranController {
  constructor(
    @InjectRepository(Pembayaran) private pembayaranRepo: Repository<Pembayaran>,
    @InjectRepository(Tagihan) private tagihanRepo: Repository<Tagihan>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('periode') periode?: string,
    @Query('kelasId') kelasId?: number,
  ) {
    const where: any = {};
    if (periode) where.tagihan = { periode };
    if (kelasId) where.tagihan = { ...(where.tagihan || {}), santri: { kelas: { id: kelasId } } };
    if (search) {
      where.tagihan = { ...(where.tagihan || {}), santri: { nama: ILike(`%${search}%`) } };
    }
    const data = await this.pembayaranRepo.find({ where, order: { createdAt: 'DESC' } });

    const semuaTagihan = await this.tagihanRepo.find();
    const totalTagihan = semuaTagihan.reduce((t, x) => t + Number(x.totalTagihan), 0);
    const totalTerbayar = semuaTagihan.reduce((t, x) => t + Number(x.totalTerbayar), 0);
    const totalBelumTerbayar = totalTagihan - totalTerbayar;
    const jumlahTunggakan = semuaTagihan.filter((x) => x.status !== 'Lunas').length;

    return { data, stats: { totalTagihan, totalTerbayar, totalBelumTerbayar, jumlahTunggakan } };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const pembayaran = await this.pembayaranRepo.findOneBy({ id });
    if (!pembayaran) throw new NotFoundException('Pembayaran tidak ditemukan.');
    return pembayaran;
  }

  @Post()
  async create(
    @Body()
    body: {
      tagihanId: number;
      tanggalBayar: string;
      jumlahBayar: number;
      metode: 'Tunai' | 'Transfer Bank' | 'E-Wallet';
      penyedia?: string;
      catatan?: string;
    },
  ) {
    if (!body.tagihanId) throw new BadRequestException('Pilih tagihan terlebih dahulu.');
    if (!body.jumlahBayar || body.jumlahBayar <= 0) throw new BadRequestException('Jumlah bayar tidak valid.');

    return this.dataSource.transaction(async (manager) => {
      const tagihan = await manager.findOneBy(Tagihan, { id: body.tagihanId });
      if (!tagihan) throw new BadRequestException('Tagihan tidak ditemukan.');

      const count = await manager.count(Pembayaran);
      const tanggalKode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const noPembayaran = `PAY-${tanggalKode}-${String(count + 1).padStart(4, '0')}`;

      const pembayaran = manager.create(Pembayaran, {
        noPembayaran,
        tagihan,
        tanggalBayar: body.tanggalBayar,
        jumlahBayar: body.jumlahBayar,
        metode: body.metode,
        penyedia: body.penyedia,
        catatan: body.catatan,
      });
      await manager.save(pembayaran);

      const totalTerbayar = Number(tagihan.totalTerbayar) + Number(body.jumlahBayar);
      const status = totalTerbayar >= Number(tagihan.totalTagihan) ? 'Lunas' : totalTerbayar > 0 ? 'Sebagian' : 'Belum Bayar';
      await manager.update(Tagihan, tagihan.id, { totalTerbayar, status });

      return pembayaran;
    });
  }
}
