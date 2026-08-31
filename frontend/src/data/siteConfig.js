// URL backend API (PHP). Set via .env: VITE_API_URL
// Contoh production: https://domainanda.com/gis/backend
export const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost/gis/backend'

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

export const STATISTIK = [
  { label: 'Luas Wilayah', nilai: '1,87', satuan: 'km²' },
  { label: 'Wilayah RW', nilai: '8', satuan: 'RW' },
  { label: 'Jaringan Jalan', nilai: '7', satuan: 'Rute' },
  { label: 'Titik Lokasi', nilai: '31', satuan: 'POI' },
]

export const LAYERS = [
  {
    id: 'batas-desa',
    label: 'Batas Desa',
    file: '/data/batas-internal.geojson',
    type: 'polygon',
    group: 'Administrasi',
    style: {
      color: '#292524',
      weight: 3,
      fillColor: '#292524',
      fillOpacity: 0.05,
    },
    legendSymbol: 'polygon',
    legendColor: '#292524',
    defaultOn: true,
  },
  {
    id: 'wilayah-rw',
    label: 'Wilayah RW',
    file: '/data/wilayah-rw.geojson',
    type: 'polygon',
    group: 'Administrasi',
    style: {
      color: '#7c3aed',
      weight: 2,
      fillColor: '#7c3aed',
      fillOpacity: 0.08,
      dashArray: '6,4',
    },
    legendSymbol: 'polygon',
    legendColor: '#7c3aed',
    defaultOn: true,
  },
  {
    id: 'pemukiman',
    label: 'Pemukiman',
    file: '/data/pemukiman.geojson',
    type: 'polygon',
    group: 'Sosial',
    style: {
      color: '#ea580c',
      weight: 1.5,
      fillColor: '#ea580c',
      fillOpacity: 0.12,
    },
    legendSymbol: 'polygon',
    legendColor: '#ea580c',
    defaultOn: false,
  },
  {
    id: 'peralihan-hak-tanah',
    label: 'Peralihan Hak Tanah',
    file: '/data/peralihan-hak-tanah.geojson',
    type: 'polygon',
    group: 'Tanah',
    style: {
      color: '#b45309',
      weight: 1.5,
      fillColor: '#b45309',
      fillOpacity: 0.15,
      dashArray: '4,4',
    },
    legendSymbol: 'polygon',
    legendColor: '#b45309',
    defaultOn: false,
  },
  {
    id: 'jalan',
    label: 'Jalan',
    file: '/data/jalan.geojson',
    type: 'line',
    group: 'Infrastruktur',
    style: {
      color: '#ca8a04',
      weight: 3,
    },
    legendSymbol: 'line',
    legendColor: '#ca8a04',
    defaultOn: true,
  },
  {
    id: 'sungai',
    label: 'Sungai',
    file: '/data/sungai.geojson',
    type: 'line',
    group: 'Infrastruktur',
    style: {
      color: '#0284c7',
      weight: 3,
    },
    legendSymbol: 'line',
    legendColor: '#0284c7',
    defaultOn: true,
  },
  {
    id: 'irigasi',
    label: 'Irigasi',
    file: '/data/irigasi.geojson',
    type: 'line',
    group: 'Infrastruktur',
    style: {
      color: '#06b6d4',
      weight: 2,
      dashArray: '4,3',
    },
    legendSymbol: 'line',
    legendColor: '#06b6d4',
    defaultOn: false,
  },
  {
    id: 'sekolah',
    label: 'Sekolah Dasar',
    file: '/data/sekolah.geojson',
    type: 'point',
    group: 'Fasilitas',
    style: {
      color: '#16a34a',
      fillColor: '#16a34a',
      radius: 8,
    },
    legendSymbol: 'marker',
    legendColor: '#16a34a',
    defaultOn: true,
  },
  {
    id: 'tempat-ibadah',
    label: 'Tempat Ibadah',
    file: '/data/tempat-ibadah.geojson',
    type: 'point',
    group: 'Fasilitas',
    style: {
      color: '#8b5cf6',
      fillColor: '#8b5cf6',
      radius: 8,
    },
    legendSymbol: 'marker',
    legendColor: '#8b5cf6',
    defaultOn: true,
  },
  {
    id: 'titik-batas',
    label: 'Titik Batas & Landmark',
    file: '/data/titik-batas.geojson',
    type: 'point',
    group: 'Fasilitas',
    style: {
      color: '#dc2626',
      fillColor: '#dc2626',
      radius: 6,
    },
    legendSymbol: 'marker',
    legendColor: '#dc2626',
    defaultOn: false,
  },
]

export const LEGENDA = [
  { warna: '#292524', tipe: 'polygon', label: 'Batas Desa Cinunuk' },
  { warna: '#7c3aed', tipe: 'polygon', label: 'Wilayah RW' },
  { warna: '#ca8a04', tipe: 'line', label: 'Jalan' },
  { warna: '#0284c7', tipe: 'line', label: 'Sungai' },
  { warna: '#16a34a', tipe: 'marker', label: 'Sekolah Dasar' },
  { warna: '#8b5cf6', tipe: 'marker', label: 'Tempat Ibadah' },
  { warna: '#dc2626', tipe: 'marker', label: 'Titik Batas & Landmark' },
]

export const KATEGORI = {
  pemerintahan: { warna: '#dc2626', label: 'Kantor Pemerintahan' },
  pendidikan: { warna: '#16a34a', label: 'Fasilitas Pendidikan' },
  kesehatan: { warna: '#f59e0b', label: 'Fasilitas Kesehatan' },
  ibadah: { warna: '#8b5cf6', label: 'Tempat Ibadah' },
  umum: { warna: '#0891b2', label: 'Fasilitas Umum' },
}

export const LAYER_KATEGORI = {
  sekolah: 'pendidikan',
  'tempat-ibadah': 'ibadah',
  'titik-batas': 'umum',
}

let _geoPois = []

export function setGeoPois(list) {
  _geoPois = list
}

export function getGeoPois() {
  return _geoPois
}

export function findPoi(id) {
  const all = [...POI_CONTOH, ..._geoPois]
  return all.find((p) => String(p.id) === String(id)) ?? null
}

export const POI_CONTOH = [
  {
    id: 1,
    nama: 'Kantor Desa Cinunuk',
    kategori: 'pemerintahan',
    koordinat: [-7.1732, 107.9705],
    deskripsi: 'Pusat pemerintahan dan pelayanan administrasi Desa Cinunuk.',
    deskripsiLengkap:
      'Kantor Desa Cinunuk adalah pusat pelayanan administrasi dan pemerintahan desa. Warga dapat mengurus berbagai keperluan administrasi seperti surat pengantar, surat keterangan domisili, dan pelayanan kependudukan lainnya di sini. Kantor desa juga menjadi tempat berlangsungnya musyawarah desa dan kegiatan kemasyarakatan.',
    alamat: 'Jl. Raya Cinunuk, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Senin–Jumat, 08.00–14.00 WIB',
    foto: ['/images/poi/1-1.svg', '/images/poi/1-2.svg', '/images/poi/1-3.svg'],
    petunjukArah: [
      'Dari Kota Garut, ambil arah timur menuju Kecamatan Wanaraja (± 15 menit).',
      'Ikuti jalan utama hingga memasuki kawasan Desa Cinunuk.',
      'Kantor desa berada di sisi jalan utama, mudah dikenali dari papan nama desa.',
      'Tersedia area parkir untuk sepeda motor dan mobil di depan kantor.',
    ],
  },
  {
    id: 2,
    nama: 'SDN Cinunuk',
    kategori: 'pendidikan',
    koordinat: [-7.1745, 107.9692],
    deskripsi: 'Sekolah dasar negeri di wilayah Desa Cinunuk.',
    deskripsiLengkap:
      'SDN Cinunuk adalah sekolah dasar negeri yang melayani anak-anak usia sekolah di Desa Cinunuk dan sekitarnya. Sekolah ini memiliki fasilitas ruang kelas, lapangan olahraga, dan perpustakaan kecil. Kegiatan belajar mengajar berlangsung pagi hingga siang hari sesuai jadwal yang ditetapkan.',
    alamat: 'Jl. Pendidikan No. 1, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Senin–Sabtu, 07.00–13.00 WIB',
    foto: ['/images/poi/2-1.svg', '/images/poi/2-2.svg', '/images/poi/2-3.svg'],
    petunjukArah: [
      'Dari Kantor Desa Cinunuk, berjalan ke arah selatan ± 200 meter.',
      'Belok kanan di persimpangan pertama.',
      'Sekolah berada di sebelah kiri jalan, dengan halaman luas berpagar.',
    ],
  },
  {
    id: 3,
    nama: 'Puskesmas Pembantu Cinunuk',
    kategori: 'kesehatan',
    koordinat: [-7.1728, 107.9718],
    deskripsi: 'Fasilitas kesehatan tingkat pertama untuk warga desa.',
    deskripsiLengkap:
      'Puskesmas Pembantu (Pustu) Cinunuk memberikan layanan kesehatan tingkat pertama bagi warga desa, meliputi pemeriksaan umum, layanan ibu dan anak, imunisasi, dan konsultasi kesehatan. Untuk kasus yang lebih serius, pasien akan dirujuk ke Puskesmas Wanaraja atau RSUD di Kota Garut.',
    alamat: 'Jl. Sehat No. 3, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Senin–Jumat, 08.00–12.00 WIB',
    foto: ['/images/poi/3-1.svg', '/images/poi/3-2.svg', '/images/poi/3-3.svg'],
    petunjukArah: [
      'Dari Kantor Desa Cinunuk, berjalan ke arah timur ± 150 meter.',
      'Puskesmas berada tepat di sisi jalan, bertetangga dengan balai warga.',
    ],
  },
  {
    id: 4,
    nama: 'Masjid Desa Cinunuk',
    kategori: 'ibadah',
    koordinat: [-7.1738, 107.9712],
    deskripsi: 'Tempat ibadah utama masyarakat Desa Cinunuk.',
    deskripsiLengkap:
      'Masjid Desa Cinunuk merupakan tempat ibadah utama masyarakat desa. Selain salat lima waktu, masjid ini menjadi pusat kegiatan keagamaan seperti pengajian rutin, kajian remaja masjid, dan perayaan hari besar Islam. Fasilitas tempat wudhu dan tempat parkir tersedia.',
    alamat: 'Jl. Masjid No. 5, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Buka setiap hari, 24 jam',
    foto: ['/images/poi/4-1.svg', '/images/poi/4-2.svg', '/images/poi/4-3.svg'],
    petunjukArah: [
      'Dari Kantor Desa Cinunuk, berjalan ke arah tenggara ± 100 meter.',
      'Masjid berada di pertigaan utama desa, menara dan kubahnya mudah terlihat.',
    ],
  },
  {
    id: 5,
    nama: 'Lapangan Desa',
    kategori: 'umum',
    koordinat: [-7.1722, 107.9698],
    deskripsi: 'Ruang terbuka untuk kegiatan olahraga dan sosial masyarakat.',
    deskripsiLengkap:
      'Lapangan Desa Cinunuk adalah ruang terbuka publik yang digunakan untuk berbagai kegiatan: olahraga sepak bola dan voli, kegiatan karang taruna, upacara hari besar, hingga bazar pasar malam. Lapangan ini juga menjadi tempat berkumpulnya warga saat musyawarah besar atau perayaan desa.',
    alamat: 'Jl. Lapangan, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Buka setiap hari, 06.00–21.00 WIB',
    foto: ['/images/poi/5-1.svg', '/images/poi/5-2.svg', '/images/poi/5-3.svg'],
    petunjukArah: [
      'Dari Kantor Desa Cinunuk, berjalan ke arah barat daya ± 150 meter.',
      'Lapangan berada di tengah kawasan permukiman, dikelilingi warung makan.',
    ],
  },
  {
    id: 6,
    nama: 'Madrasah Cinunuk',
    kategori: 'pendidikan',
    koordinat: [-7.175, 107.9715],
    deskripsi: 'Fasilitas pendidikan keagamaan di Desa Cinunuk.',
    deskripsiLengkap:
      'Madrasah Cinunuk menyelenggarakan pendidikan dasar keagamaan Islam, meliputi pendidikan akhlak, baca tulis Al-Quran, dan pelajaran agama. Madrasah ini melayani siswa dari berbagai dusun di Desa Cinunuk dengan jadwal belajar pagi dan sore.',
    alamat: 'Jl. Madrasah No. 2, Desa Cinunuk, Kec. Wanaraja, Kab. Garut',
    jamLayanan: 'Senin–Sabtu, 07.00–15.00 WIB',
    foto: ['/images/poi/6-1.svg', '/images/poi/6-2.svg', '/images/poi/6-3.svg'],
    petunjukArah: [
      'Dari Kantor Desa Cinunuk, berjalan ke arah selatan ± 300 meter.',
      'Belok kiri di jalan kecil, madrasah berada ± 50 meter di sebelah kanan.',
    ],
  },
]
