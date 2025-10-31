<?php
require_once __DIR__ . '/db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$id = intval($data['id'] ?? 0);

// Require auth for delete
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

try {
    $pdo = get_db();
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Delete failed', 'detail' => $e->getMessage()]);
}

?>
