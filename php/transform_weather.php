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
$rawData = require 'extract_weather.php';

// -----------------------------------------------------------------------------
// 2. DATENTRANSFORMATION (Umrechnung in Stunden)
// -----------------------------------------------------------------------------

// Sicherheitsprüfung, ob die erwartete Datenstruktur existiert
if (!isset($rawData['daily']['sunshine_duration'][0]) || !isset($rawData['daily']['daylight_duration'][0])) {
    // Hier können Sie das Skript abbrechen oder mit Standardwerten fortfahren
    die("❌ Fehler: Die Rohdaten konnten nicht geladen werden oder die 'daily'-Werte fehlen.");
}

// Holen der Sekunden-Werte für den ersten Tag im Array [0]
$sunshineSeconds = $rawData['daily']['sunshine_duration'][0];
$daylightSeconds = $rawData['daily']['daylight_duration'][0];

// Anweisung: Umrechnung von Sekunden in aufgerundete Stunden
// 1 Stunde = 3600 Sekunden. Verwende ceil() zum Aufrunden.
$sunshineHours = (int)ceil($sunshineSeconds / 3600);
$daylightHours = (int)ceil($daylightSeconds / 3600);


// Erstellen des assoziativen Arrays "transformedData" für den Datenbank-INSERT
// Die Schlüsselnamen entsprechen den Spaltennamen der Tabelle 'Weather'
$transformedData = [
    'totalData' => [
        'sunshine_duration' => $sunshineHours,
        'daylight_duration' => $daylightHours,
    ]
];

// echo "✅ Transformation abgeschlossen. Aggregierte Daten (klar für DB-Insert):\n";
// print_r($transformedData);

// Das $transformedData Array ist nun bereit für den Load-Schritt.
?>