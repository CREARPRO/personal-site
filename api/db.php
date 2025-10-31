<?php
// api/db.php - Conexión a la base de datos usando PDO y variables de entorno
header('Content-Type: application/json; charset=utf-8');
// Allow same-origin requests (AJAX from same site). Adjust CORS if using different domain.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function get_db() {
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $dbname = getenv('DB_NAME') ?: 'personal_site';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $port = getenv('DB_PORT') ?: '3306';

    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'DB connection failed', 'detail' => $e->getMessage()]);
        exit;
    }
}

?>
