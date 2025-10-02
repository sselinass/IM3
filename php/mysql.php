<!-- Grundlage für die Datenbankverbindung -->

<?php

require_once 'config.php';

try {
    // Erstellt eine neue PDO-Instanz
    // IMMER $pdo verwenden, wenn auf die DB zugegriffen wird (Prüfungsrelevant)
    $pdo = new PDO($dsn, $username, $password, $options);

    // Beispiel-SQL-Abfrage
    $sql = "SELECT * FROM `User`";

    $stmt = $pdo->query($sql);

    $users = $stmt->fetchAll();

    foreach ($users as $user) {
        echo $user['firstname'] . "<br>";
    }

} catch (PDOException $e) {
    // Behandelt Verbindungsfehler
    die("Datenbankverbindungsfehler: " . $e->getMessage());
}

?>