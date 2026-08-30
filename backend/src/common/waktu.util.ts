// Tanggal "hari ini" SELALU dalam WIB (GMT+7), bukan timezone server -- supaya
// perbandingan jatuh tempo (mis. status "menunggak") konsisten di mesin manapun
// backend ini jalan.
export function tanggalWibHariIni(): string {
  const sekarang = new Date();
  const wib = new Date(sekarang.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}
