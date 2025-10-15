<?php
/* ============================================================================
   HANDLUNGSANWEISUNG (unload_day.php)
   1) Setze Header: Content-Type: application/json; charset=utf-8.
   2) Binde 001_config.php (PDO-Config) ein.
   3) Lies optionale Request-Parameter (z. B. date, location, limit, from/to) und validiere.
   4) Baue SELECT mit PREPARED STATEMENT (WHERE/ORDER BY/LIMIT je nach Parametern).
   5) Binde Parameter sicher (execute([...]) oder bindValue()).
   6) Hole Datensätze (fetchAll) – optional gruppieren/umformen fürs Frontend.
   7) Antworte IMMER als JSON (json_encode) – auch bei leeren Treffern ([]) .
   8) Setze sinnvolle HTTP-Statuscodes (400 für Bad Request, 404 bei 0 Treffern (Detail), 200 ok).
   9) Fehlerfall: 500 + { "error": "..." } (keine internen Details leaken).
  10) Keine HTML-Ausgabe; keine var_dump in Prod.
   ============================================================================ */

require_once 'config.php';

header("Content-Type: application/json");

// Get date parameter, default to today
$date = $_GET['date'] ?? date('Y-m-d');

$sqls = [
    "publibike" => "SELECT * FROM `Publibike` WHERE DATE(`created_at`) = ?",
    "weather" => "SELECT * FROM `Weather` WHERE DATE(`created_at`) = ?"
];

try {
    // PDO-Verbindung aufbauen
    $pdo = new PDO($dsn, $username, $password, $options);
    
    $response = [];
    
    // Beide SQL-Queries ausführen
    foreach ($sqls as $table => $sql) {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$date]);
        $response[$table] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
   
    // JSON-Response senden
    http_response_code(200);
    echo json_encode($response);

} catch (PDOException $e) {
    // Fehlerbehandlung
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
    
} catch (Exception $e) {
    // Allgemeine Fehlerbehandlung
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}
?>