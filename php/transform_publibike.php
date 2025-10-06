<?php
/**
 * TRANSFORM-Skript für PubliBike Bern Daten.
 * Führt die Aggregation der Gesamtwerte (free bikes, free slots, slots)
 * aus den Rohdaten durch.
 *
 * PHP-Version: 7.4.33
 */

// -----------------------------------------------------------------------------
// 1. ROHDATEN LADEN (Integration mit extract.php)
// -----------------------------------------------------------------------------

// Wir gehen davon aus, dass 'extract.php' die API-Daten abruft und als
// assoziatives PHP-Array zurückgibt.
// Speichern Sie den Rückgabewert in der Variablen $rawData.
$rawData = require 'extract_publibike.php';


// Sicherheitsprüfung, ob die erwartete Datenstruktur existiert
if (!isset($rawData['network']['stations']) || !is_array($rawData['network']['stations'])) {
    die("❌ Fehler: Die Rohdaten konnten nicht geladen werden oder das 'stations'-Array fehlt.");
}

$stations = $rawData['network']['stations'];

// -----------------------------------------------------------------------------
// 2. DATENTRANSFORMATION (Aggregation)
//    - Zählt alle free bikes, free slots und total slots der gesamten API zusammen.
// -----------------------------------------------------------------------------

$totalFreeBikes = 0;
$totalEmptySlots = 0;
$totalSlots = 0;

foreach ($stations as $station) {
    // Aggregiere 'free_bikes'
    // Verwenden Sie (int) cast und Null Coalescing Operator (?? 0) für Robustheit
    $totalFreeBikes += (int) ($station['free_bikes'] ?? 0);
    
    // Aggregiere 'empty_slots' (entspricht 'emptyslots')
    $totalEmptySlots += (int) ($station['empty_slots'] ?? 0);
    
    // Aggregiere 'slots' (Gesamtanzahl der Stellplätze pro Station)
    // Die Slots sind im 'extra'-Array verschachtelt
    $totalSlots += (int) ($station['extra']['slots'] ?? 0);
}

// Erstellen des assoziativen Arrays "transformedData" für den Datenbank-INSERT
// Die Schlüsselnamen entsprechen den Spaltennamen der Tabelle 'Publibike'
$transformedData = [
    'freebikes' => $totalFreeBikes,
    'emptyslots' => $totalEmptySlots,
    'slots' => $totalSlots,
];

// echo "✅ Transformation abgeschlossen. Aggregierte Daten (klar für DB-Insert):\n";
// print_r($transformedData);

// Am Ende des Skripts können Sie $transformedData für das nachfolgende Load-Skript
// (oder den nächsten Abschnitt im selben Skript, wenn Sie alles zusammenführen)
// bereitstellen. Zum Beispiel könnten Sie es für ein separates Load-Skript zurückgeben.
// return $transformedData;
// Wenn Sie diesen Teil in einem Gesamt-Skript ausführen, können Sie einfach fortfahren.