# Startklar machen – Schritt für Schritt

## A. Zuerst lokal ansehen
1. ZIP entpacken.
2. Auf einem PC im entpackten Ordner einen kleinen lokalen Webserver starten.
3. Beispiel mit installiertem Python: `python -m http.server 8080`
4. `http://localhost:8080` öffnen.
5. Lernliste im Elternbereich anlegen und eine Lerneinheit testen.

## B. Supabase für verbundene Geräte
1. Auf supabase.com kostenlos registrieren.
2. `New project` wählen.
3. Projektname z. B. `magische-lernwelt`.
4. Starkes Datenbankpasswort vergeben und sicher aufbewahren.
5. Nach Erstellung links `SQL Editor` öffnen.
6. Inhalt von `supabase/schema.sql` vollständig einfügen und `Run` drücken.
7. Project Settings / API öffnen.
8. Project URL kopieren.
9. anon/publishable key kopieren. **Nicht** den service_role key verwenden.
10. `config.js` im Projektordner öffnen.
11. URL und Key zwischen die Anführungszeichen eintragen.
12. Datei speichern.

## C. Kostenlos veröffentlichen
### Variante GitHub Pages
1. GitHub-Konto anlegen/anmelden.
2. Neues Repository `magische-lernwelt` erstellen.
3. Alle Dateien aus dem Projektordner hochladen.
4. Repository `Settings` > `Pages`.
5. `Deploy from a branch`.
6. Branch `main`, Ordner `/root`, speichern.
7. GitHub zeigt danach die HTTPS-Adresse der App.

Hinweis: `config.js` enthält nur den öffentlichen anon/publishable key. Die Sicherheit muss über RLS erfolgen; genau dafür enthält das Projekt die Policies in `schema.sql`.

## D. Erstes Elternkonto
1. Veröffentlichte App öffnen.
2. `Eltern` öffnen.
3. Unter Cloud-Konto E-Mail und Passwort eingeben.
4. `Konto erstellen`.
5. Falls Supabase E-Mail-Bestätigung verlangt: Link in der E-Mail bestätigen.
6. Danach anmelden.
7. Kinderprofile anlegen.
8. Lernlisten eingeben.
9. Belohnungen festlegen.

## E. Fire Tablet
1. Im Erwachsenenprofil Silk öffnen.
2. HTTPS-Adresse der App öffnen.
3. Im Browser-Menü `Zum Startbildschirm hinzufügen` bzw. `Installieren` verwenden, sofern angeboten.
4. App öffnen und mit demselben Elternkonto anmelden.
5. Gewünschtes Kinderprofil auswählen.
6. Lernmodus starten.

## F. Zweites Gerät
1. Dieselbe HTTPS-Adresse öffnen.
2. Mit demselben Konto anmelden.
3. `Eltern` > `Jetzt synchronisieren`.
4. Danach stehen dieselben Daten zur Verfügung.

## G. Vor echter Nutzung
- Demo-Kinderprofile umbenennen oder entfernen.
- Demo-Lernliste ersetzen.
- Eltern-PIN in einer nächsten Version wirklich erzwingen; der aktuelle MVP speichert sie nur als Datenfeld.
- Prüfen, ob die Synchronisation auf allen Geräten wie gewünscht arbeitet.
- Erst dann größere Mengen Lerninhalte erfassen.

## H. Wenn später neue Fächer kommen
Nicht die bestehende App kopieren. Stattdessen:
- neues Fach registrieren
- passende Inhaltstypen definieren
- vorhandene universelle Übungsbausteine wiederverwenden
- nur fachspezifische Generatoren ergänzen

So bleiben Kinderprofile, Belohnungen, Historie und Zauberwelt erhalten.
