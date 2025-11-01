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
    // Optional SSL/TLS settings (useful for managed MySQL like Aiven)
    // Set DB_SSL_MODE=REQUIRED to enable encrypted connections without CA verification
    // Optionally provide DB_SSL_CA_B64 (base64 PEM) to verify with a CA cert
    $sslMode = getenv('DB_SSL_MODE') ?: '';
    $sslCaB64 = getenv('DB_SSL_CA_B64') ?: '';
    $sslCaPath = '';

    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    try {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];

        // If SSL is requested, prepare SSL options
        if ($sslMode && strtoupper($sslMode) !== 'DISABLED') {
            // If a base64 CA is provided, write it to a temp file
            if (!empty($sslCaB64)) {
                $pem = base64_decode($sslCaB64);
                if ($pem) {
                    $sslCaPath = '/tmp/db-ca.pem';
                    @file_put_contents($sslCaPath, $pem);
                }
            }

            // Enable SSL with optional CA; disable server cert verification by default for broader compatibility
            // Note: For stronger security, set DB_SSL_CA_B64 and remove VERIFY_SERVER_CERT=false.
            if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }
            if (!empty($sslCaPath) && defined('PDO::MYSQL_ATTR_SSL_CA')) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCaPath;
            }
        }

        $pdo = new PDO($dsn, $user, $pass, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'DB connection failed', 'detail' => $e->getMessage()]);
        exit;
    }
}

?>
