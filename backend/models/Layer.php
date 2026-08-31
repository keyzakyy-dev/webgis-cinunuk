<?php
require_once __DIR__ . '/../config/database.php';

class Layer
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Ambil semua layer
     */
    public function all(bool $activeOnly = true): array
    {
        $sql = 'SELECT l.*,
                  (SELECT COUNT(*) FROM features f WHERE f.layer_id = l.id) AS features_count
                FROM layers l';
        if ($activeOnly) {
            $sql .= ' WHERE l.is_active = 1';
        }
        $sql .= ' ORDER BY l.urutan ASC, l.id ASC';
        return $this->db->query($sql)->fetchAll();
    }

    /**
     * Ambil layer + semua fitur (GeoJSON FeatureCollection)
     */
    public function findWithFeatures(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM layers WHERE id = ?');
        $stmt->execute([$id]);
        $layer = $stmt->fetch();
        if (!$layer) return null;

        $stmt2 = $this->db->prepare(
            'SELECT id, nama, deskripsi, deskripsi_lengkap, alamat, jam_layanan, petunjuk_arah,
                    lat, lng, geometry, foto_1, foto_2, foto_3, is_active, created_at, updated_at
             FROM features WHERE layer_id = ? AND is_active = 1 ORDER BY id'
        );
        $stmt2->execute([$id]);
        $rows = $stmt2->fetchAll();

        $features = [];
        foreach ($rows as $row) {
            $feat = [
                'type'       => 'Feature',
                'id'         => $row['id'],
                'properties' => [
                    'Name'    => $row['nama'],
                    'id'      => $row['id'],
                ],
            ];

            // Sertakan deskripsi jika ada
            if ($row['deskripsi']) {
                $feat['properties']['description'] = $row['deskripsi'];
            }

            // Parse geometry JSON
            if ($row['geometry']) {
                $feat['geometry'] = json_decode($row['geometry'], true);
            } elseif ($row['lat'] && $row['lng']) {
                $feat['geometry'] = [
                    'type'        => 'Point',
                    'coordinates' => [(float) $row['lng'], (float) $row['lat']],
                ];
            }

            $features[] = $feat;
        }

        $layer['geojson'] = [
            'type'       => 'FeatureCollection',
            'name'       => $layer['nama_layer'],
            'features'   => $features,
        ];
        return $layer;
    }

    /**
     * Tambah layer baru
     */
    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO layers (nama_layer, tipe, warna, grup, urutan, is_active)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['nama_layer'],
            $data['tipe'],
            $data['warna']    ?? '#292524',
            $data['grup']     ?? 'Lainnya',
            $data['urutan']   ?? 0,
            $data['is_active'] ?? 1,
        ]);
        return (int) $this->db->lastInsertId();
    }

    /**
     * Update layer
     */
    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE layers SET nama_layer=?, tipe=?, warna=?, grup=?, urutan=?, is_active=?
             WHERE id=?'
        );
        $stmt->execute([
            $data['nama_layer'],
            $data['tipe'],
            $data['warna'],
            $data['grup'],
            $data['urutan'],
            $data['is_active'],
            $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    /**
     * Hapus layer + semua fiturnya
     */
    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM layers WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }
}
