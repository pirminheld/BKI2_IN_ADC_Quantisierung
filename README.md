# ADC verstehen · BKI2 IN

Interaktive Lernseite zur Doppelstunde am 29.09.2026: Quantisierung, Auflösung und Grundlagen der zeitlichen Abtastung.

Veröffentlicht: https://pirminheld.github.io/BKI2_IN_ADC_Quantisierung/

## Verwendung

`index.html` direkt öffnen oder den Ordner mit einem statischen Webserver bereitstellen. Keine Installation oder externen JavaScript-Bibliotheken erforderlich. Vier Lernbereiche: Quantisierung mit Vergleichsspeicher, Bitzahl/Referenzspannung, schrittweise Abtastung und Selbstcheck. Das Schülerarbeitsblatt ist als `Arbeitsblatt.pdf` verfügbar. `QR_Code.png` verlinkt auf die veröffentlichte Seite.

## Fachliches Modell

- N = 2^n Codes, Dmax = N − 1, ΔU = Uref / N.
- Untere Intervallgrenzen sind eingeschlossen, obere ausgeschlossen; genau Uref wird dem letzten Code zugeordnet.
- Außerhalb 0 ≤ Ue ≤ Uref gibt es keine Modellzuordnung. Die Endpunktskalierung mit N − 1 wird nicht verwendet.
- Zeitdiagramm: Ue(t) = 2 V + 1 V · sin(2πt/T), T = 4 oder 8 ms; Abtastintervalle 1, 0,5 oder 0,25 ms.
- Das Zeitdiagramm zeigt analoge Abtastwerte, keine quantisierten Werte. Die Animation ist verlangsamt.
- Berechnung des Quantisierungsfehlers, Aliasing und Abtasttheorem werden nicht vorweggenommen.

## Herkunft und Dateien

`style.css`, `FTS_logo.png` und `impressum.html` wurden unverändert aus `../BKI2_IN_Messkette` übernommen. `adc.css` ergänzt die Darstellung der neuen Lernbereiche. Eigene Aufgaben und SVG-Diagramme, abgestimmt auf das Arbeitsblatt 03.3 und BPE 5.1. Formelsammlung 2BKI IFT vom 25.01.2025, gedruckte S. 12.

## Prüfung

`node test.cjs` prüft das Fachmodell einschließlich Intervallgrenzen, Bitzahlen und Abtastwerten. 5430 Prüfungen bestanden. Zusätzlich wurden Eingaben, Vergleichsspeicher, Navigation, Abtastanimation, Quiz und Impressum mit Chromium geprüft; Layoutkontrolle bei 1440, 768 und 390 Pixel Breite sowie Offline-Aufruf per Datei. Diagramme und breite Tabellen lassen sich auf kleinen Bildschirmen seitlich verschieben.

Die QR-Codes in der vierseitigen Schüler-PDF und der separaten lokalen Lösung wurden aus gerenderten PDF-Seiten dekodiert; Ziel und anklickbarer Link stimmen mit der veröffentlichten Adresse überein. Die Lösung wird nicht auf dieser Seite veröffentlicht.

Nutzung und rechtliche Angaben: siehe `impressum.html`.
