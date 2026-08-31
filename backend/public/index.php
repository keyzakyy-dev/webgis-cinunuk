<?php
/**
 * Entry point API — semua request /api/* diarahkan ke sini
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/LayerController.php';
require_once __DIR__ . '/../controllers/FeatureController.php';
require_once __DIR__ . '/../controllers/UploadController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip semua prefix sampai /api (mis. /gis/backend/api → /api)
$apiPos = strpos($uri, '/api');
if ($apiPos !== false) {
    $uri = substr($uri, $apiPos);
}
if (str_starts_with($uri, '/api')) {
    $uri = substr($uri, 4);
}
$uri = trim($uri, '/');

// ── Routes ───────────────────────────────────────────────────────────

// GET /api/health
if ($uri === 'health') {
    echo json_encode(['success' => true, 'message' => 'API OK']);
    exit;
}

// ── Layers ───────────────────────────────────────────────────────────

if ($uri === 'layers') {
    $ctrl = new LayerController();
    match ($method) {
        'GET'  => $ctrl->index(),
        'POST' => $ctrl->store(),
        default => http_response_code(405),
    };
    exit;
}

if (preg_match('#^layers/(\d+)$#', $uri, $m)) {
    $ctrl = new LayerController();
    $id = (int) $m[1];
    match ($method) {
        'GET'    => $ctrl->show($id),
        'PUT'    => $ctrl->update($id),
        'DELETE' => $ctrl->destroy($id),
        default  => http_response_code(405),
    };
    exit;
}

// ── Features ─────────────────────────────────────────────────────────

if ($uri === 'features') {
    $ctrl = new FeatureController();
    match ($method) {
        'GET'  => $ctrl->index(),
        'POST' => $ctrl->store(),
        default => http_response_code(405),
    };
    exit;
}

if ($uri === 'features/import' && $method === 'POST') {
    $ctrl = new FeatureController();
    $ctrl->import();
    exit;
}

if (preg_match('#^features/(\d+)$#', $uri, $m)) {
    $ctrl = new FeatureController();
    $id = (int) $m[1];
    match ($method) {
        'GET'    => $ctrl->show($id),
        'PUT'    => $ctrl->update($id),
        'DELETE' => $ctrl->destroy($id),
        default  => http_response_code(405),
    };
    exit;
}

// ── Upload ───────────────────────────────────────────────────────────

if ($uri === 'upload' && $method === 'POST') {
    UploadController::handle();
    exit;
}

// ── 404 ──────────────────────────────────────────────────────────────

http_response_code(404);
echo json_encode(['success' => false, 'message' => 'Endpoint tidak ditemukan']);