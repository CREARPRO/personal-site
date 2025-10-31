<?php
require_once __DIR__ . '/db.php';
session_start();

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
