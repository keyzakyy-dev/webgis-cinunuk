<?php
/**
 * Controller Layer — API endpoint /api/layers
 */

require_once __DIR__ . '/../models/Layer.php';
require_once __DIR__ . '/../models/Auth.php';

class LayerController
{
    private Layer $model;

    public function __construct()
    {
        $this->model = new Layer();
    }

    /** GET /api/layers */
    public function index(): void
    {
        $activeOnly = !isset($_GET['all']);
        echo json_encode([
            'success' => true,
            'data'    => $this->model->all($activeOnly),
        ]);
    }

    /** GET /api/layers/:id */
    public function show(int $id): void
    {
        $layer = $this->model->findWithFeatures($id);
        if (!$layer) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Layer tidak ditemukan']);
            return;
        }
        echo json_encode(['success' => true, 'data' => $layer]);
    }

    /** POST /api/layers (admin) */
    public function store(): void
    {
        Auth::required();
        $body   = $this->getJsonBody();
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

    /** PUT /api/layers/:id (admin) */
    public function update(int $id): void
    {
        Auth::required();
        $body = $this->getJsonBody();
        $body['id'] = $id;
        $errors = $this->validate($body);
        if ($errors) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }
        $ok = $this->model->update($id, $body);
        echo json_encode(['success' => $ok]);
    }

    /** DELETE /api/layers/:id (admin) */
    public function destroy(int $id): void
    {
        Auth::required();
        $ok = $this->model->delete($id);
        echo json_encode(['success' => $ok]);
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
        if (empty($d['nama_layer']))  $errors['nama_layer'] = 'Nama layer wajib diisi';
        if (empty($d['tipe']) || !in_array($d['tipe'], ['polygon', 'line', 'point'])) {
            $errors['tipe'] = 'Tipe harus polygon, line, atau point';
        }
        return $errors;
    }
}