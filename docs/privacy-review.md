# Datenschutz: redaktioneller Entwurf und Freigabe

Die Besucherfassung ist auf sieben kurze Abschnitte begrenzt. Vertragsdiskussionen und interne Prüfanmerkungen bleiben in dieser Datei, nicht im Seitentext. Die Messdienste sind weiterhin eingebunden und werden deshalb weiterhin genannt; die Kürzung ist keine datenschutzrechtliche Freigabe.

## Rollen – nicht nach dem Hosting-Konto entscheiden

Verantwortlicher ist, wer über Zwecke und wesentliche Mittel der Verarbeitung entscheidet (Art. 4 Nr. 7 DSGVO). Eine Agentur kann technische Entscheidungen übernehmen und trotzdem Auftragsverarbeiter bleiben. Weisungsgebundener Betrieb/Wartung mit Zugriff auf personenbezogene Daten fällt regelmäßig unter Art. 28 DSGVO. Eigene oder gemeinsam bestimmte Zwecke können dagegen eigene bzw. gemeinsame Verantwortlichkeit begründen; der Vertrag allein ersetzt die tatsächliche Rollenprüfung nicht.

Für dieses Projekt ist folgende Einordnung **zu bestätigen**, nicht als bereits vertraglich geklärt zu behaupten:

- Stall Eichenbruch / tatsächlicher Rechtsträger: Verantwortlicher für das Website-Angebot und eingehende Anfragen.
- Spitzli Development: technischer Betreiber im Auftrag, soweit ausschließlich weisungsgebundene Verarbeitung; eigene Pflichten insbesondere nach Art. 28 und 32 DSGVO bleiben bestehen.
- Vercel, Neon und gegebenenfalls Mail-Anbieter: je nach Vertragskette unmittelbar beauftragte Dienstleister oder weitere Auftragsverarbeiter. Anbieter können für einzelne eigene Verarbeitungen selbst Verantwortliche sein; nicht alle Tätigkeiten pauschal gleich einordnen.
- Spitzlis eigene Kundenabrechnung ist ein anderer Verarbeitungszweck und separat zu beurteilen.

Das BayLDA unterscheidet zudem rein statisches Hosting ohne Datenauswertung und ohne Datenrückfluss. Das hiesige Projekt enthält jedoch CMS-Zugriff, gespeicherte Kontaktanfragen und eingebundene Messdienste; eine pauschale Ausnahme für eine rein statische Selbstdarstellung passt deshalb nicht ohne Weiteres.

## Technisch festgestellt

- Frontend mit Next.js/Payload; Speicherung von Formularangaben im CMS, Datenbank bei Neon.
- Vercel Hosting und Blob-Dateispeicher; darüber IP-/Verbindungsdaten für die Auslieferung.
- `Analytics` und `SpeedInsights` werden in `src/app/(frontend)/layout.tsx` auch im Wartungsmodus eingebunden. Bei der Browserprüfung wurden beide ausgelieferten Messskripte geladen. Aus dem Code allein folgen weder die vollständige Dashboard-Konfiguration noch eine rechtliche Zulässigkeit.
- Formularfelder: Name, E-Mail, Nachricht; Telefon freiwillig. Mail-Benachrichtigung hängt von Formularkonfiguration und SMTP-Umgebung ab. Keine bestehende automatische Löschroutine für Formularanfragen gefunden.
- Schriftarten werden mit `next/font` lokal ausgeliefert. Google Maps ist ein Link, kein eingebettetes Karten-Widget.
- Technische Cookies für CMS-Anmeldung und freigeschaltete Vorschau.

## Vor Veröffentlichung bestätigen

1. Exakter Rechtsträger des Stalls und seine Kontaktdaten; Cora und Günter Mann sind bisherige Angaben, keine neue rechtliche Prüfung der Unternehmensform.
2. Leistungsumfang und tatsächliche Entscheidungsbefugnisse von Spitzli Development; vollständige Vertragspartei, AV-Vertrag Stall ↔ Spitzli, genehmigte Unterauftragnehmer und passende Weiterverträge. Die Datenschutzerklärung ersetzt keinen AV-Vertrag.
3. Vercel-/Neon-Verträge, tatsächlich eingesetzte Rechtsträger, Regionen, mögliche Zugriffe außerhalb EU/EWR und wirksame Garantien nach Art. 44 ff. DSGVO. Keine abgeschlossenen SCC, DPF-Anwendbarkeit oder ausschließlich deutsche Speicherung ohne Beleg behaupten.
4. Mail-Anbieter und tatsächlicher Versandweg; Empfängerkreis/Zugriffe auf Formularanfragen und Protokolle.
5. Löschregeln und deren Umsetzung: Kontaktanfragen, Server-/Sicherheitsprotokolle, Backups und Messdaten. Keine frei erfundene Frist und keine Behauptung automatischer Löschung.
6. Analytics/Speed Insights bewusst entscheiden: für eine reine Repräsentationsseite ggf. entfernen. Sonst genaue Datenflüsse, URL-/Query-Redaktion, Speicherfristen und die einschlägige Rechtsgrundlage sowie mögliche Einwilligungspflicht prüfen. „Cookieless“ allein bedeutet nicht „einwilligungsfrei“.
7. Rechtliche Informationen auch während Wartung öffentlich erreichbar machen. Derzeit unterdrücken Proxy/Layout normale Inhaltsseiten; Messskripte sind davon nicht ausgenommen. Dies ist ein gesonderter offener Punkt, nicht durch den neuen Entwurf behoben.
8. Entwurf nach fachlicher Prüfung vervollständigen und erst dann im CMS veröffentlichen. Insbesondere fehlen noch die bestätigte Rechtsgrundlage/Speicherfrist der Messdienste und die tatsächlich anwendbaren Drittland-Garantien; diese dürfen nicht durch Vermutungen ersetzt werden. Löschregeln müssen zur tatsächlichen Praxis passen. Kein Anspruch auf abschließende Rechtsberatung oder bestätigte DSGVO-Konformität.

## Bearbeitungsablauf

`src/seed/privacy-content.ts` enthält ausdrücklich `_status: 'draft'`. `NODE_ENV=production bun run payload run src/seed/update-privacy.ts` sichert veröffentlichte Fassung und bisherigen Entwurf und kontrolliert nach dem Speichern, dass die veröffentlichte Fassung unverändert ist. Vorhandene Entwürfe werden standardmäßig nicht überschrieben. Für eine bewusste Überarbeitung erst den aktuellen CMS-Entwurf prüfen und dann dessen exakten `updatedAt`-Wert als `PRIVACY_EXPECTED_DRAFT_UPDATED_AT` übergeben; bei einer zwischenzeitlich geänderten Revision bricht das Skript ab. Keine Datenbank neu seeden.

Die Gestaltung in `src/components/LegalDocument/` leitet Abschnitte und Sprunglinks aus den h2-Überschriften der CMS-Texte ab. Kein zweiter, fest verdrahteter Rechtstext im Frontend; gemischte CMS-Layouts verwenden den bisherigen Blockrenderer. Texte bleiben im CMS editierbar.

## Quellen

- [DSK, Kurzpapier 13: Auftragsverarbeitung](https://www.datenschutzkonferenz-online.de/media/kp/dsk_kpnr_13.pdf), insbesondere Verantwortlichkeit, Wartung/Fernzugriff und Unterauftragnehmer.
- [DSGVO, amtlicher Text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu), Art. 4, 13, 21, 26, 28, 32, 44 ff. und 77.
- [BayLDA, Sonderfall rein statisches Hosting](https://www.lda.bayern.de/media/FAQ_Hosting_keine_Auftragsverarbeitung.pdf), FAQ vom 19.07.2018; keine pauschale Übertragung auf dieses CMS-Projekt.
- [Vercel Web Analytics – Privacy](https://vercel.com/docs/analytics/privacy-policy).
- [Vercel Speed Insights – Privacy](https://vercel.com/docs/speed-insights/privacy-policy).
- [Vercel DPA](https://vercel.com/legal/dpa) und [Neon DPA](https://neon.com/dpa): Anbieterunterlagen, kein Nachweis des konkreten Vertragsabschlusses.
- [LfD Niedersachsen – Kontakt](https://www.lfd.niedersachsen.de/startseite/wir_uber_uns/kontakt_und_anfahrt/kontakt-anfahrt-56182.html) und [Beschwerde](https://www.lfd.niedersachsen.de/beschwerde/beschwerdeformular-191364.html).
