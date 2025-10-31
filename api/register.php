<?php
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fields']);
    exit;
}

try {
    $pdo = get_db();
    // check exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already registered']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$name, $email, $hash]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Unable to create user', 'detail' => $e->getMessage()]);
}

?>
