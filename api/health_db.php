<?php
// api/health_db.php - Healthcheck de base de datos (usa get_db())
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $pdo = get_db();
    $pdo->query('SELECT 1');
    echo json_encode(['status' => 'ok']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'detail' => $e->getMessage()]);
}
