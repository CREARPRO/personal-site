<?php
require_once __DIR__ . '/db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$id = intval($data['id'] ?? 0);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? null;

if (!$id || !$name || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fields']);
    exit;
}

try {
    $pdo = get_db();
    if ($password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?');
        $stmt->execute([$name, $email, $hash, $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
        $stmt->execute([$name, $email, $id]);
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Update failed', 'detail' => $e->getMessage()]);
}

?>
