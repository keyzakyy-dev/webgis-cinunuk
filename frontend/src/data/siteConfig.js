export const API_URL =
  import.meta.env.VITE_API_URL ?? ''

export const SITE = {
  nama: 'Peta Wilayah Desa Cinunuk',
  desa: 'Cinunuk',
  kecamatan: 'Wanaraja',
  kabupaten: 'Garut',
  provinsi: 'Jawa Barat',
  tagline: 'Informasi Batas Desa & Lokasi Wilayah Cinunuk, Kec. Wanaraja, Kab. Garut',
  deskripsi:
    'Website Sistem Informasi Geografis (SIG) yang menyajikan peta interaktif batas wilayah dan lokasi penting di Desa Cinunuk secara digital, visual, dan mudah diakses publik.',
  sumberData: 'Survei internal desa & data BIG (Badan Informasi Geospasial)',
  tanggalUpdate: 'Agustus 2026',
  kontak: {
    email: 'pemdes@cinunuk.desa.id',
    telepon: '(022) 000-0000',
  },
}

export const MAP_CONFIG = {
  center: [-7.17364, 107.970141],
  zoom: 15,
  minZoom: 10,
  maxZoom: 19,
  bounds: [
    [-7.186574, 107.962209],
    [-7.160706, 107.978073],
  ],
}

export const KATEGORI = {
  pemerintahan: { warna: '#dc2626', label: 'Kantor Pemerintahan' },
  pendidikan: { warna: '#16a34a', label: 'Fasilitas Pendidikan' },
  kesehatan: { warna: '#f59e0b', label: 'Fasilitas Kesehatan' },
  ibadah: { warna: '#8b5cf6', label: 'Tempat Ibadah' },
  umum: { warna: '#0891b2', label: 'Fasilitas Umum' },
}