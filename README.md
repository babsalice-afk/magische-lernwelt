# Magische Lernwelt

Funktionsfähiger Prototyp einer installierbaren Lern-PWA.

## Enthalten

- mehrere Kinderprofile
- eigene Lernwortlisten
- fachunabhängige Datenstruktur
- adaptiver Lernalgorithmus pro Lerninhalt
- Übungen: Erkennen, Buchstabensalat, Lückenwort, Merken & Schreiben, freie Eingabe
- ruhiger farbcodierter Lernmodus ohne Figuren
- Sterne und Kristalle
- frei definierbare reale Belohnungen
- magische Lichtung, Zauberbaum/-haus, Gebiete und Sammelwesen
- lokale Offline-Speicherung
- Service Worker / PWA-Manifest
- optionale Gerätesynchronisation über Supabase
- RLS-Sicherheitsregeln für das Cloud-Konto

## Wichtiger Stand

Das ist ein belastbarer **MVP/Prototyp**, nicht eine fertig geprüfte App-Store-App.
Die Cloud-Synchronisation speichert aktuell den Familienzustand als JSON pro Elternkonto.
Für eine spätere öffentliche Veröffentlichung sollten Datenmodell, Backups, Datenschutz,
Eltern-PIN, Rollen/Rechte, Tests und Barrierefreiheit weiter gehärtet werden.

## Schnelltest ohne Cloud

Die Dateien müssen über einen Webserver laufen (nicht einfach index.html doppelklicken).

Mit Python auf einem PC:
`python -m http.server 8080`

Dann im Browser:
`http://localhost:8080`

Ohne Supabase läuft die App im lokalen Demo-Modus.

## Cloud-Synchronisation

1. Kostenloses Supabase-Projekt anlegen.
2. `supabase/schema.sql` im SQL Editor ausführen.
3. In Supabase unter Project Settings / API die Project URL und den anon/publishable key kopieren.
4. `config.js` öffnen und beide Werte eintragen.
5. App erneut veröffentlichen.
6. Im Elternbereich ein Konto anlegen.
7. Auf weiteren Geräten mit demselben Konto anmelden.

## Deployment

Am einfachsten: GitHub Pages, Netlify oder Vercel.
Für eine installierbare PWA ist HTTPS erforderlich. Die genannten Hoster liefern HTTPS.

### GitHub Pages
- neues Repository erstellen
- Inhalt dieses Ordners hochladen
- Settings > Pages
- Deploy from branch
- Branch `main`, Ordner `/root`
- veröffentlichte URL öffnen

## Fire Tablet

1. veröffentlichte HTTPS-Adresse im Silk Browser öffnen
2. Browser-Menü öffnen
3. je nach Fire-OS-Version `Zum Startbildschirm hinzufügen` / `Installieren` wählen
4. Wenn Fire OS keine vollwertige PWA-Installation anbietet, wird eine Startbildschirm-Verknüpfung angelegt; die App funktioniert trotzdem im Browser.

## Adaptive Logik

Priorität eines Lerninhalts steigt bei:
- niedriger Kompetenz
- längerer Zeit seit letzter Wiederholung
- bisherigen Fehlern

Schwierigkeitsprogression:
1. Erkennen
2. Rekonstruieren (Buchstabensalat)
3. Lücken
4. Merken und aktiv abrufen
5. freie Eingabe

Richtige Antworten erhöhen, falsche Antworten senken den Kompetenzwert.
Die Architektur kann später um Spaced-Repetition-Intervalle, Fehlerkategorien,
Silben, Audio/Diktat und fachbezogene Kompetenzmodelle erweitert werden.

## Empfohlene nächste Ausbaustufe

- echte Eltern-PIN und Rollen
- getrennte Familien-/Kinderkonten statt einem JSON-Dokument
- Audio/TTS
- Silbenpuzzle, Drag & Drop, Wortgitter, Memory, Fehlerdetektiv
- Prüfungstermin-Modus
- Wochenziel
- Bild-/Arbeitsblattimport
- Mathemodul
- Gestaltungsshop für Zauberhaus/Lichtung
- mehrstufiges Sammel-/Entwicklungssystem
- Export/Backup
