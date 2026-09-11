# Fotos für die Website

## Bestand und Bearbeitung

18 Originalmotive aus `Photos/` und `src/seed/images/` sind für das Web aufbereitet. **17 Fotos wurden mit GPT Image über das integrierte Codex-Tool `image_gen` restauriert** und im direkten Vorher-/Nachher-Vergleich geprüft. Kein API-Key-Fallback.

Die KI-Variante des **Dressurgemäldes wurde verworfen**, weil sie Pinselstriche und Signatur verändert hat. Hier bleibt das originale Kunstwerk erhalten; die Web-Dateien sind lediglich komprimiert. Die entsprechenden Entscheidungen und Quellen stehen in `scripts/photos.json` und im Manifest.

- Unveränderte Originale: `Photos/`, `src/seed/images/`
- Geprüfte, verlustfrei gespeicherte Restaurierungen: `assets/photos-restored/`
- Web-Dateien: `public/images/stall/`
- Quellen, Alt-Texte, Verwendung und Bildfokus: `scripts/photos.json`
- Größen, Abmessungen, Verarbeitung und SHA-256: `docs/photos-manifest.json`

## Reproduzierbare Web-Aufbereitung

```bash
node scripts/prepare-photos.mjs
bun run payload run src/seed/update-photos.ts
```

Der erste Befehl verwendet ausschließlich explizit hinterlegte, geprüfte Restaurierungen; sonst das Original. Er erzeugt WebP in voller Web-Auflösung sowie kleinere Varianten mit 640, 960 und 1440 px Breite, soweit die Quelle groß genug ist. Zusätzlich gibt es AVIF in der vollen Web-Auflösung.

Die Ausgabe ist auf die Auflösung des Originals und maximal 1920 px begrenzt. Keine künstlich vergrößerten Web-Dateien, kein Beschnitt bei der Konvertierung. Orientierung und sRGB werden vereinheitlicht, EXIF/GPS entfernt. Die 18 vollen WebP-Dateien sind zusammen etwa 28 % kleiner als die ursprünglichen JPEGs.

Der zweite Befehl importiert die vollen WebP-Dateien nach Payload/Vercel Blob, nicht sämtliche Varianten: Payload erzeugt beim Upload eigene Bildgrößen, Next Image liefert sie responsiv aus. Dateinamen enthalten einen Inhaltshash; Wiederholungen verwenden bereits importierte Dateien. Master und Vorschaubilder werden zusätzlich per Blob-HEAD geprüft; fehlende Uploads werden am vorhandenen Datensatz repariert, bevor Seitenverweise geändert werden. Jede Payload-Operation erhält einen frischen Kontext, da Cloud-Storage-Hooks ihn verändern können. Alte Medien bleiben erhalten, CMS-Daten werden vorher unter `.backups/` gesichert. Unveröffentlichte Änderungen an Zielseiten blockieren den Import. Anschließend Next.js neu deployen, damit die gecachten Seiten erneuert werden. Der Wartungsmodus wird nicht verändert.

## Auswahl auf den Seiten

- **Startseite:** Stallgebäude als Hero; Reithalle, Reitplatz, Longierzelt, Stallgasse, Paddocks und Terrasse in der Galerie.
- **Pension:** neue Paddockaufnahme als Hero; Stallgasse, Boxenfenster, Paddocks und Hochformat-Ansicht.
- **Der Stall:** Reitplatz mit Terrasse als Hero; Halle, Reitplatz, Longierzelt und Paddocks.
- **Ausbildung:** Dressur auf dem Außenplatz als Hero; Dressur in der Halle, neue Hallenaufnahme und Außenplatz.

Porträts und Hofhund bleiben in der Mediathek, stehen aber nicht in den Anlagen-Galerien. Keine der neuen Aufnahmen zeigt eindeutig eine separate Führmaschine oder Weide; andere Motive werden nicht als solche beschriftet. Der Bildfokus des Stallgebäudes liegt rechts, damit der Schriftzug auch beim mobilen Hero-Beschnitt sichtbar bleibt.

## Restaurierungsauftrag und Grenzen

Je Original ein separates Edit mit dem integrierten `image_gen`, Quelle zuerst als Bild geladen. Die orchestrierende Codex-Version war 0.151.0 mit `gpt-5.6-sol`; das ist nicht die Modellbezeichnung des Bildgenerators. Ein Prompt allein garantiert keine Originaltreue: Ausgaben wurden vor Übernahme visuell gegen das jeweilige Original geprüft.

Gemeinsame Prompt-Grundlage:

> Restore this existing documentary photograph of a real riding stable, not a new illustration. Reduce JPEG artifacts and noise gently, correct white balance and exposure conservatively, recover only visible detail. Keep the original aspect ratio, camera viewpoint, composition, architecture, every beam, fence, door and sign, all people and animals, their faces, markings, poses and proportions. Preserve all text exactly. Do not add, remove, replace, beautify or redesign anything; no invented detail, new sky, HDR look, plastic textures, artificial blur, oversharpening, cropping or outpainting. If detail is uncertain, leave it soft rather than reconstructing it. Output one natural, faithful restoration.

Zusätzlich wurden bei Porträts Gesichter, Haut, Kleidung und Hundezeichnungen ausdrücklich geschützt; beim Longierzelt ein Pferd und zwei Personen; beim Gebäude der Schriftzug; bei vorhandenen Montagen deren Aufbau. Das kleine Archivporträt bleibt in kleiner Web-Auflösung. Die Restaurierungen sind Bildbearbeitungen, keine neu belegten Informationen über die Anlage.
