<?php
require_once __DIR__ . '/db.php';
session_start();

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing credentials']);
    exit;
}

try {
    $pdo = get_db();
    $stmt = $pdo->prepare('SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }

    // set session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];

    echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']]]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Login failed', 'detail' => $e->getMessage()]);
}

?>
