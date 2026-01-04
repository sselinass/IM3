# IM 3 - Dokumentation Projektarbeit

## Ride&Shine

ein Projekt von Selina Schöpfer, mmp24b

Webseite: https://im3.selina-schoepfer.ch

# Kurzbeschreibung des Projekts

In meinem Projekt soll aufgezeigt werden, wie viele Publibikes durchschnittlich in den Publibike Station in Bern zur Verfügung stehen. Diese Zahl vergleiche ich mit der Sonnenscheindauer sowie der Tageslichtzeit. Dazu habe ich die OpenMeteo API und die Citybikes API verwendet.

Es wurden alle vorhanden Publibike Zahlen im Raum Bern zusammengenommen und die Meteo Daten in Bern verwendet. Damit lässt sich herauslesen, wie viele Bikes durchschnittlich bei sonnigen - oder eben sonnenlosen - Tagen zur Verfügung stehen. Diese Daten können für einzelne Tage eingesehen werden oder in einer Wochenansicht. Dies soll dazu dienen, herauszulesen, wie es um die Publibike-Verfügbarkeit in Bern steht. 

# Learnings und Schwierigkeiten

Mit den Durchschnittswerten der Publibikes sind die Zahlen nicht ganz so aussagekräftig wie in der Anfangs-Idee angedacht. Da ich dort aber zuerst von anderen Werten ausgegangen bin, hat sich die Aussagekraft deutlich verkleinert. Daraus lerne ich, dass ich die Anfangsidee mit den Daten besser durchdenke bevor ich mit der Datenvisualisierungsidee beginne. Die beiden API's konnte ich aber gut miteinander verknüpfen und die für mich relevanten Daten in die Datenbank laden. 

Beim php Code habe ich stark gelernt, alles Relevante bereits möglichst früh zu filtern und auch bereits einzubauen. Am besten gelernt/erkannt habe ich das mit dem "created_at", um bei der Datumsauswahl nur die gewünschten Daten angezeigt zu bekommen. Mit dem hatte ich Anfangs bis zum js gewartet, was dann zu Schwierigkeiten führte, weshalb ich dann nochmals die php's überarbeitete.  

Ebenfalls ein Learning bestand darin, dass ich zuerst mehrere gleiche Einträge in die Datenbank zu einer Abfrage erhalten habe. Dies konnte ich dann aber noch bereinigen, da ich Anfangs die Datenbank kontrollierte und es mir so zeitnah aufgefallen ist. 

Die meisten Schwierigkeiten hatte ich beim Erstellen der Funktionen, da ich unischer war, wie sie aufgebaut werden müssen und was genau alles rein muss. Da brauchte ich die grösste Unterstützung in den Coachings und durch die KI, am Schluss klappte aber alles so wie ich wollte und es ist mir nun verständlicher. 

# Fazit

Ich bin mit dem technischen Teil sehr zufrieden und konnte nachvollziehen, was die Schritte auslösen und wie sie funktionieren. Auch wenn ich viel mit ChatGPT und Copilot gearbeitet habe, verstehe ich die Schritte und weiss, wo ich eingreifen muss um gewünschte Änderungen vorzunehmen. 

Am Schluss des Projekts ist mir jedoch klargeworden, dass ich nach dem technischen Teil nur wenig Zeit in das Design investiert habe und das darunter etwas gelitten hat. Durchdas ich alleine am Projekt gearbeitet habe und es mir persönlich wichtiger war, den technischen Teil zu verstehen und sauber umzusetzen, habe ich die Zeit grösstenteils da investiert. Für ein weiteres Projekt werde ich darauf achten, dass ich am Schluss noch mehr Zeit in das Design investiere und mich da noch verbessern kann. 

# benutzte Ressourcen und Prompts

Für mein Projekt habe ich folgende Ressourcen als Unterstützung genutzt: 

- Coachingtage direkt vor Ort 
    - Unterstützung für: Datumsauswahl und created_at einzubauen | Datenbereinigung, da einige Datensätze mehrfach in die Datenbank geschrieben wurden
- ChatGPT/Gemini: Ich arbeitete viel mit der KI um meine Gedanken umzusetzen - vorallem bei den unterschiedlichen Funktionen und dem DatePicker nutzte ich die KI, da ich Anfangs noch sehr unsicher war und Unterstützung brauchte. Mit der Erklär-/Coachingrolle der KI konnte ich diese dann gut verstehen und meine eigenen Gedanken umsetzen. 
- VS Code Copilot: Der Copilot war sehr nützlich um einen strukturierten Code aufzubauen und den Code effizient aufzubauen
- Chart.js für Grafiken
- Ebenfalls haben mir Mitstudierende immer wieder geholfen, wenn ich auf Schwierigkeiten gestossen bin oder eine zweite Meinunge/zweiten Gedankengang brauchte.
- W3schools: https://www.w3schools.com/css/default.asp

API's: https://api.citybik.es/v2/ | https://open-meteo.com/en/docs?ref=freepublicapis.com