<?php
/**
 * Controller Feature — API endpoint /api/features
 */

require_once __DIR__ . '/../models/Feature.php';
require_once __DIR__ . '/../models/Auth.php';

class FeatureController
{
    private Feature $model;

    public function __construct()
    {
        $this->model = new Feature();
    }

    /** GET /api/features?layer_id=X */
    public function index(): void
    {
        $layerId = isset($_GET['layer_id']) ? (int) $_GET['layer_id'] : null;
        echo json_encode([
            'success' => true,
            'data'    => $this->model->all($layerId),
        ]);
    }

    /** GET /api/features/:id */
    public function show(int $id): void
    {
        $feature = $this->model->find($id);
        if (!$feature) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Fitur tidak ditemukan']);
            return;
        }
        echo json_encode(['success' => true, 'data' => $feature]);
    }

    /** POST /api/features (admin) */
    public function store(): void
    {
        Auth::required();
        $body = $this->getJsonBody();
        $errors = $this->validate($body);
        if ($errors) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }
        $id = $this->model->create($body);
        http_response_code(201);
        echo json_encode(['success' => true, 'data' => ['id' => $id]]);
    }

    /** PUT /api/features/:id (admin) */
    public function update(int $id): void
    {
        Auth::required();
        $body = $this->getJsonBody();
        $errors = $this->validate($body);
        if ($errors) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }
        $ok = $this->model->update($id, $body);
        echo json_encode(['success' => $ok]);
    }

    /** DELETE /api/features/:id (admin) */
    public function destroy(int $id): void
    {
        Auth::required();
        $ok = $this->model->delete($id);
        echo json_encode(['success' => $ok]);
    }

    /** POST /api/features/import (admin) — upload GeoJSON */
    public function import(): void
    {
        Auth::required();
        if (empty($_FILES['geojson']['tmp_name'])) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'File GeoJSON wajib diisi']);
            return;
        }
        $layerId = isset($_POST['layer_id']) ? (int) $_POST['layer_id'] : 0;
        if ($layerId <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'layer_id wajib diisi']);
            return;
        }

        $content = file_get_contents($_FILES['geojson']['tmp_name']);
        $geojson = json_decode($content, true);
        if (!isset($geojson['features'])) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Format GeoJSON tidak valid']);
            return;
        }

        $count = $this->model->importFromGeoJson($layerId, $geojson);
        echo json_encode(['success' => true, 'data' => ['imported' => $count]]);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private function getJsonBody(): array
    {
        $raw  = file_get_contents('php://input');
        $json = json_decode($raw, true);
        return is_array($json) ? $json : [];
    }

    private function validate(array $d): array
    {
        $errors = [];
        if (empty($d['layer_id'])) $errors['layer_id'] = 'layer_id wajib diisi';
        if (empty($d['nama']))     $errors['nama'] = 'Nama wajib diisi';
        return $errors;
    }
}