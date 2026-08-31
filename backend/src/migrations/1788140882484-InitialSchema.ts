import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1788140882484 implements MigrationInterface {
    name = 'InitialSchema1788140882484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "nama" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4d0392574f49340bb75a102b041" UNIQUE ("username"), CONSTRAINT "PK_a28028ba709cd7e5053a86857b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "kelas" ("id" SERIAL NOT NULL, "nama" character varying NOT NULL, "tingkat" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_88815639c6806e754620b9cad17" UNIQUE ("nama"), CONSTRAINT "PK_55bb4fb74bbbd202d55118b0417" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "santri" ("id" SERIAL NOT NULL, "nis" character varying NOT NULL, "nama" character varying NOT NULL, "jenisKelamin" character varying, "tanggalLahir" date, "namaWali" character varying, "noHpWali" character varying, "alamat" text, "status" character varying NOT NULL DEFAULT 'Aktif', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "kelasId" integer, CONSTRAINT "UQ_7f4cdfb0dc54849505a4da50938" UNIQUE ("nis"), CONSTRAINT "PK_c17f800762562bc60cb1e242831" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jenis_tagihan" ("id" SERIAL NOT NULL, "nama" character varying NOT NULL, "kode" character varying NOT NULL, "deskripsi" text, "sifat" character varying NOT NULL, "nominalDefault" numeric(14,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'Aktif', "urutan" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_db7ebdfef9e2453c042b0bd4b7d" UNIQUE ("kode"), CONSTRAINT "PK_9b31126e3ee820bebf69d55ce96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tagihan_detail" ("id" SERIAL NOT NULL, "keterangan" character varying, "jumlah" numeric(14,2) NOT NULL, "diskon" numeric(14,2) NOT NULL DEFAULT '0', "denda" numeric(14,2) NOT NULL DEFAULT '0', "total" numeric(14,2) NOT NULL, "tagihanId" integer, "jenisTagihanId" integer, CONSTRAINT "PK_b7718983f12da471189bf1d4bc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tagihan" ("id" SERIAL NOT NULL, "noTagihan" character varying NOT NULL, "periode" character varying NOT NULL, "jatuhTempo" date NOT NULL, "referensi" text, "totalTagihan" numeric(14,2) NOT NULL DEFAULT '0', "totalTerbayar" numeric(14,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'Belum Bayar', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "santriId" integer, CONSTRAINT "UQ_43a3b73676750a062ccb6128a20" UNIQUE ("noTagihan"), CONSTRAINT "PK_d55bfdfef9288aadb8552e83b9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pembayaran" ("id" SERIAL NOT NULL, "noPembayaran" character varying NOT NULL, "tanggalBayar" date NOT NULL, "jumlahBayar" numeric(14,2) NOT NULL, "metode" character varying NOT NULL, "jenisPengirim" character varying, "penyediaPengirim" character varying, "atasNamaPengirim" character varying, "jenisPenerima" character varying, "penyediaPenerima" character varying, "atasNamaPenerima" character varying, "catatan" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "tagihanId" integer, CONSTRAINT "UQ_d7181fcc1429fccbf3d967092ab" UNIQUE ("noPembayaran"), CONSTRAINT "PK_95db0e6865638afc787f5eff480" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "santri" ADD CONSTRAINT "FK_1be6c86f661ff9147d25882dba3" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tagihan_detail" ADD CONSTRAINT "FK_b5818c1fde117d291f1ccf05456" FOREIGN KEY ("tagihanId") REFERENCES "tagihan"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tagihan_detail" ADD CONSTRAINT "FK_8cc330b9e94dc8f62b4caf5d16c" FOREIGN KEY ("jenisTagihanId") REFERENCES "jenis_tagihan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tagihan" ADD CONSTRAINT "FK_22a8719d74116abaa0454b2b1a2" FOREIGN KEY ("santriId") REFERENCES "santri"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pembayaran" ADD CONSTRAINT "FK_2041963b614765ba549a30f70de" FOREIGN KEY ("tagihanId") REFERENCES "tagihan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pembayaran" DROP CONSTRAINT "FK_2041963b614765ba549a30f70de"`);
        await queryRunner.query(`ALTER TABLE "tagihan" DROP CONSTRAINT "FK_22a8719d74116abaa0454b2b1a2"`);
        await queryRunner.query(`ALTER TABLE "tagihan_detail" DROP CONSTRAINT "FK_8cc330b9e94dc8f62b4caf5d16c"`);
        await queryRunner.query(`ALTER TABLE "tagihan_detail" DROP CONSTRAINT "FK_b5818c1fde117d291f1ccf05456"`);
        await queryRunner.query(`ALTER TABLE "santri" DROP CONSTRAINT "FK_1be6c86f661ff9147d25882dba3"`);
        await queryRunner.query(`DROP TABLE "pembayaran"`);
        await queryRunner.query(`DROP TABLE "tagihan"`);
        await queryRunner.query(`DROP TABLE "tagihan_detail"`);
        await queryRunner.query(`DROP TABLE "jenis_tagihan"`);
        await queryRunner.query(`DROP TABLE "santri"`);
        await queryRunner.query(`DROP TABLE "kelas"`);
        await queryRunner.query(`DROP TABLE "admin_user"`);
    }

}
