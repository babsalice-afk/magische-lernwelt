# Magische Lernwelt V2

Diese Version ersetzt `index.html`, `app.js`, `styles.css`, `manifest.webmanifest` und den `icons`-Ordner der bisherigen GitHub-Version.

**Wichtig:** `config.js` ist absichtlich NICHT im ZIP. Deine bereits funktionierende `config.js` mit Supabase-URL und Publishable Key bleibt dadurch unverändert.

## Neu in V2
- keine fest eingebauten Demo-Kinder mehr bei einer frischen Installation
- Kinderprofile anlegen und löschen
- Lernlisten anlegen und löschen
- automatische Cloud-Synchronisierung nach Änderungen
- ruhiger Lernmodus
- adaptives Üben
- stark ausgebaute Zauberwelt
- Gestaltungskatalog: Wohnraum, Haus, Garten, Außen, saisonal
- größere Sammlung: Drachen, Elfen, Feen, Geister, Kürbiswesen und Fantasietiere
- responsive Darstellung für PC, Handy und Tablet

## Update auf GitHub
1. ZIP entpacken.
2. GitHub Repository `magische-lernwelt` öffnen.
3. Add file > Upload files.
4. Den gesamten Inhalt dieses V2-Ordners hochladen.
5. `config.js` NICHT löschen oder ersetzen.
6. Commit changes.
7. GitHub Pages baut automatisch neu.
8. Nach 1–3 Minuten App neu laden, am besten einmal mit Strg+F5.

## Hinweis zu bestehenden Daten
V2 verwendet einen neuen lokalen Browser-Schlüssel (`mlw-v2`). Cloud-Daten aus dem bisherigen `app_state.payload` werden nach Anmeldung weiterhin geladen. Dadurch bleiben bestehende Cloud-Daten grundsätzlich kompatibel.

## Technischer Hinweis
Die Cloud nutzt weiterhin den bereits funktionierenden `app_state`-Datensatz. Die vollständige Normalisierung in getrennte Tabellen ist bewusst noch nicht in dieses UI-Update gemischt worden. Das sollte als eigene Migration erfolgen, damit die bereits funktionierende Familien-Synchronisation nicht unnötig gefährdet wird.
