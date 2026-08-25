# SEO – Stall Eichenbruch

Kurz-Recherche (Aug 2026) und was davon in der Website steckt.

## Erkenntnisse

- **Local SEO zählt.** Für einen Pensions-/Ausbildungsstall entscheidet die Kombination *Leistung + Ort*: «Pensionsstall Rastede», «Reitunterricht Rastede», «Beritt Ammerland», «Boxen mit Paddock Oldenburg». Allgemeine Begriffe («Reitstall») sind zu breit.
- **Google Business Profile** liefert ca. 40–50 % der lokalen Ranking-Signale und erscheint vor den organischen Treffern. Ohne verifiziertes, vollständig gepflegtes Profil (Fotos, Beschreibung, Öffnungszeiten, Bewertungen beantworten) bringt die beste Website wenig.
- **NAP-Konsistenz:** Name, Adresse, Telefon überall identisch (Website, Google, Verzeichnisse wie stall-frei.de, pferde-service.com, reiten.de – dort ist der Stall bereits gelistet).
- **Lokale Signale auf der Seite:** Ortsname in Title, Description, H1/Text – aber natürlich, kein Keyword-Stuffing.
- **Leistungsseiten mit Details** (Ausstattung, Zielgruppe, Ablauf, Preise) ranken besser als Allgemeinplätze; die alte Seite hatte diese Zahlen bereits (45 × 25 m, 40 Boxen, 15 Paddocks, 5 ha) – sie stehen jetzt strukturiert im «Anlage»-Block.
- **Technik:** HTTPS, Mobile first, Ladezeit < 3 s, strukturierte Daten (LocalBusiness), Sitemap, saubere Titles/Descriptions, ein H1 pro Seite, Alt-Texte.

Wettbewerb im Umkreis (gefunden): Stop & Turn (Rastede, Western), Reit- und Fahrschule Oldenburg, Reitstall Gerdes, Zucht- und Pensionsstall Ammerland, Ferienhof Mariannenhof. Eichenbruch hebt sich mit Dressur bis Klasse S, Beritt/Korrektur und der Anlage ab – das sollte in Titles und Texten vorne stehen.

## Umgesetzt

| Was | Wo |
|---|---|
| Title-Template `Seite \| Stall Eichenbruch`, Description aus SEO-Tab oder Hero-Text, Canonical, Robots | `src/utilities/generateMeta.ts`, `app/(frontend)/layout.tsx` |
| Dynamisches OG-Bild pro Seite (Hero-Foto + Titel im Boxenschild-Look, 1200 × 630) | `app/(frontend)/og/[slug]/route.tsx` |
| Twitter Card `summary_large_image` | `generateMeta.ts` |
| JSON-LD `LocalBusiness` + `SportsActivityLocation` + `WebSite` aus dem Global «Betrieb» | `layout.tsx` |
| SEO-Tab: «Generieren» füllt Title, Description (Hero-Text) und Bild (Hero-Foto) | `src/plugins/index.ts` |
| Sitemap + robots.txt (nur veröffentlichte Seiten, `/admin` gesperrt) | `pages-sitemap.xml`, `next-sitemap.config.cjs` |
| Lokale Keywords in Titles/Descriptions/Texten des Seeds | `src/seed/index.ts` |
| `lang="de"`, ein H1 pro Seite, Alt-Texte, next/font, Bildqualität 85 | Layout/Blocks |

## URL-Map (alte WordPress-Site → neu)

| Alt | Neu | Status |
|---|---|---|
| `/` | `/` | gleich |
| `/wir-uber-uns/` | `/wir-ueber-uns` | 301 (`redirects.ts`) |
| `/ausbildung/` | `/ausbildung` | gleich |
| `/pension/` | `/pension` | gleich |
| `/impressum/` | `/impressum` | gleich |
| `/impressum/datenschutzerklaerung/` | `/datenschutz` | 301 |
| `/index.html`, `/index.php`, `/home` | `/` | 301 |
| – | `/kontakt` | neu |

Trailing Slashes leitet Next.js automatisch um. Weitere Redirects: Admin → Redirects (braucht Rebuild).

## Wartungsmodus und SEO

Bei aktivem Wartungsmodus antwortet `src/proxy.ts` für alle Seiten mit **503 + Retry-After: 3600** – Suchmaschinen behalten den Index und kommen später wieder. `robots.txt`, `sitemap.xml`, `pages-sitemap.xml`, OG-Bilder, Admin und API sind ausgenommen. Kein `noindex` im Wartungsmodus (würde Seiten aus dem Index werfen).

## Search Console

Sitemap-URL zum Einreichen: `https://stall-eichenbruch.vercel.app/sitemap.xml` (Index, verweist auf `pages-sitemap.xml`). Nach Domainwechsel dieselbe Pfadangabe unter der neuen Domain einreichen.

## Offen (nicht im Code lösbar)

1. **Google Business Profile** anlegen/übernehmen und verifizieren – Kategorie «Reitstall»/«Pferdepension», Fotos, Öffnungszeiten, Website-Link. Wichtigster Einzelschritt.
2. **Bewertungen** aktiv einholen (Einsteller, Reitschüler) und beantworten.
3. **Einträge prüfen** auf stall-frei.de, pferde-service.com, reiten.de, Bing Places, Apple Maps – gleiche Adresse/Telefon wie hier.
4. **Öffnungszeiten** im Global «Betrieb» pflegen – erscheinen dann auch für Google.
5. **Preise** auf der Pensionsseite ergänzen (Preisangaben ziehen kaufbereite Suchende).
6. **Neue Fotos** in hoher Auflösung – die archivierten 1200 × 400-Banner sind für Hero und OG-Bild zu klein.
7. Domain: alte URLs (`stall-eichenbruch.de/wir-ueber-uns` etc.) sind identisch übernommen; falls sich Pfade ändern → Redirects im Admin anlegen.

Quellen: [SEO für Pferdebetriebe (Sascha Rupp)](https://sascharupp.de/seo-fuer-pferdebetriebe/), [Local SEO 2026 (Dr. Web)](https://www.drweb.de/local-seo/), [Local SEO Checklist 2026 (stoneampseo)](https://stoneampseo.com/local-seo-checklist-small-business-2026/), [Lokale SEO (ahrefs)](https://ahrefs.com/blog/de/lokale-seo-losungen), [Mittelstand-Digital Zentrum Berlin](https://digitalzentrum-berlin.de/local-seo-tipps-um-besser-gefunden-zu-werden).
