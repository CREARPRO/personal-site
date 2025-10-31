<?php
require_once __DIR__ . '/db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(200);
    echo json_encode(['logged' => false]);
    exit;
}

echo json_encode(['logged' => true, 'user' => ['id' => $_SESSION['user_id'], 'name' => $_SESSION['user_name'] ?? '']]);

?>
