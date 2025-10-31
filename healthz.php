<?php
// Simple health check endpoint for Render
header('Content-Type: text/plain; charset=utf-8');
http_response_code(200);
echo "ok";
?>
