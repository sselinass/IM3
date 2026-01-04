# IM 3 - Dokumentation Projektarbeit

## Ride&Shine

ein Projekt von Selina Schöpfer, mmp24b

Webseite: https://im3.selina-schoepfer.ch

# Kurzbeschreibung des Projekts

In meinem Projekt soll aufgezeigt werden, wie viele Publibikes durchschnittlich in den Publibike Station in Bern zur Verfügung stehen. Diese Zahl vergleiche ich mit der Sonnenscheindauer sowie der Tageslichtzeit. Dazu habe ich die OpenMeteo API und die Citybikes API verwendet.

Es wurden alle vorhanden Publibike Zahlen im Raum Bern zusammengenommen und die Meteo Daten in Bern verwendet. Damit lässt sich herauslesen, wie viele Bikes durchschnittlich bei sonnigen - oder eben sonnenlosen - Tagen zur Verfügung stehen. Diese Daten können für einzelne Tage eingesehen werden oder in einer Wochenansicht. Dies soll dazu dienen, herauszulesen, wie es um die Publibike-Verfügbarkeit in Bern steht. 

# Learnings und Schwierigkeiten

Mit den Durchschnittswerten der Publibikes sind die Zahlen nicht ganz so aussagekräftig wie in der Anfangs-Idee gedacht. Da ich dort aber zuerst von anderen Werten ausgegangen bin, hat sich die Aussagekraft deutlich verkleinert. Daraus lerne ich, dass ich die Anfangsidee mit den Daten besser durchdenke bevor ich mit der Datenvisualisierungsidee beginne. Die beiden API's konnte ich aber gut miteinander verknüpfen und die für mich relevanten Daten in die Datenbank laden. 

Beim php Code habe ich stark gelernt, alles Relevante bereits möglichst früh zu filtern und auch bereits einzubauen. Am besten gelernt/erkannt habe ich das mit dem "created_at", um bei der Datumsauswahl nur die gewünschten Daten angezeigt zu bekommen. 

Ebenfalls ein Learning bestand darin, dass ich zuerst mehrere gleiche Einträge zu einer Abfrage erhalten habe. Dies konnte ich dann aber noch bereinigen, da ich Anfangs die Datenbank kontrollierte und es mir so zeitnah aufgefallen ist. 

Ebenfalls eine Schwierigkeit bestand darin


# benutzte Ressourcen und Prompts

Für mein Projekt habe ich folgende Ressourcen als Unterstützung genutzt: 

- Coachingtage direkt vor Ort 
    - Unterstützung für: Datumsauswahl und created_at einzubauen | Datenbereinigung, da einige Datensätze mehrfach in die Datenbank geschrieben wurden
- ChatGPT/Gemini: 
- GitHub Copilot: einfache Strukturaufgaben konnte ich so schneller und effizienter ausführen sowie gewisse Styling Vorschläge anwenden
- Mitstudierende haben mir immer wieder geholfen wenn ich auf Schwierigkeiten gestossen bin 
- W3schools: https://www.w3schools.com/css/default.asp

API's: https://api.citybik.es/v2/ | https://open-meteo.com/en/docs?ref=freepublicapis.com