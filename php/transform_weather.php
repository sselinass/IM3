<?php
/**
 * TRANSFORM-Skript für Wetterdaten (sunshine/daylight duration).
 * Führt die Umrechnung von Sekunden in aufgerundete Stunden durch.
 *
 * PHP-Version: 7.4.33
 */

// -----------------------------------------------------------------------------
// 1. KONFIGURATION UND ROHDATEN LADEN
// -----------------------------------------------------------------------------

// Lade die Datenbank-Zugangsdaten (wird im Load-Schritt benötigt)
$config = require 'config.php';

// Laden der Rohdaten (Integration mit extract.php).
// extract.php muss die API-Daten abrufen und das assoziative PHP-Array zurückgeben.
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
    'sunshine_duration' => $sunshineHours,
    'daylight_duration' => $daylightHours,
];

echo "✅ Transformation abgeschlossen. Aggregierte Daten (klar für DB-Insert):\n";
print_r($transformedData);

// Das $transformedData Array ist nun bereit für den Load-Schritt.
?>