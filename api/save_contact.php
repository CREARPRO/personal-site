<?php
require_once __DIR__ . '/db.php';

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$nombre = trim($data['nombre'] ?? '');
$email = trim($data['email'] ?? '');
$telefono = trim($data['telefono'] ?? '');
$genero = $data['genero'] ?? '';
$preferencias = isset($data['preferencia_contacto']) ? (is_array($data['preferencia_contacto']) ? implode(',', $data['preferencia_contacto']) : $data['preferencia_contacto']) : '';
$asunto = $data['asunto'] ?? '';
$mensaje = trim($data['mensaje'] ?? '');

if (!$nombre || !$email || !$mensaje) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

try {
    $pdo = get_db();
    $stmt = $pdo->prepare('INSERT INTO contactos (nombre, email, telefono, genero, preferencias, asunto, mensaje, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$nombre, $email, $telefono, $genero, $preferencias, $asunto, $mensaje]);
    
    echo json_encode(['success' => true, 'message' => 'Mensaje recibido correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message', 'detail' => $e->getMessage()]);
}

?>
