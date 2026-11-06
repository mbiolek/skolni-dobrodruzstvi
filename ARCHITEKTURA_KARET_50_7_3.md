# Školní dobrodružství 50.7.3

- Jediný společný modul pro navigační karty: `assets/js/ui-cards.js` + `assets/css/ui-cards.css`.
- Stejný světlý průsvitný vzhled a stejné ikony v Matematice, Angličtině, Češtině, Přírodovědě a Vlastivědě.
- Obrázkové titulní obaly jsou samostatná varianta téže knihovny.
- Staré duplicitní obsluhy avatarů odstraněny z `part-16.js`, `part-20.js` a `fix-50-0-2.js` (zbylá původní funkčnost a přihlašovací logika zachována).
- Rodič má 2 možnosti (fialový Merlin / animovaný modrý Merlin) ze souborů dodaných uživatelem. Dětské profily mají 40 původních avatarů.
- Version badge `fix-50-0-2.js`, dialog a `ui-cards.js` využívají jeden zdroj `assets/js/app-version.js`.
- Service worker cache má nový klíč 50.7.3 a registrace nepoužívá HTTP cache pro kontrolu update.
- Lokální data se nemažou; uživateli doporučujeme zálohovat výsledky před nasazením.
