<?php
require_once __DIR__ . '/db.php';
session_start();

// Require auth for listing users
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = get_db();
    $stmt = $pdo->query('SELECT id, name, email, created_at FROM users ORDER BY id DESC');
    $users = $stmt->fetchAll();
    echo json_encode(['users' => $users]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to fetch users', 'detail' => $e->getMessage()]);
}

?>
