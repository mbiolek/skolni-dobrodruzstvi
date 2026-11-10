# Školní dobrodružství 50.8.19 — revize ZIP a obrazovek

## Kontrolovaný základ
Kompletní ZIP 50.8.18 (1050 položek); kontrolovány také ZIPy 50.8.11–50.8.18.

## Nalezené a opravené konflikty
1. `assets/js/ui-cards.js`: původní selektor `#czechScreen .v29-panel > .v29-actions` bez rozlišení zahrnoval také `#czChoices` (slova pro odpovědi). Vykreslovač měnil drobné odpovědi na obrovské fantasy karty. Selektor je nově omezen pouze na úvodní nabídku češtiny bez `id`.
2. `assets/js/revize-obrazovek-50-8-19.js`: režimy Výuka / Procvičování / Test / Čísla slovních druhů / Diktáty v češtině nyní skrývají ostatní výukové panely. Původní odpovědi a vyhodnocení zůstávají beze změny.
3. `assets/css/revize-obrazovek-50-8-19.css`: odpovědi jsou malá slovní tlačítka, ne grafické karty. Zachována je zelená/červená indikace správné a chybné odpovědi. Anglická témata zobrazují hradní pozadí a nepřekrývá je jednolitý bílý list.
4. `sw.js`: zvýšena verze a upravena cache nových souborů.

## Rozsah a omezení
Zachovány všechny dosavadní předměty, grafické motivy, Merlin, profily, PINy, výsledky, matematika Fulnek i offline logika. Automatické čištění dat není součástí aktualizace. Součástí je kompletní balíček i inkrementální oprava.
Plnohodnotné vizuální ověření v uživatelově Samsung PWA není v tomto prostředí dostupné; doporučena následná kontrola na zařízení.

## Provedené automatizované kontroly
- 10 balíčků 50.8.11–50.8.18: všechny mají nepoškozenou strukturu ZIP (ZIP `testzip`).
- 70 skriptů JavaScript v aktuální aplikaci: kontrola syntaxe `node --check` bez chyby.
- 137 odkazů na soubory z hlavního HTML: žádné chybějící.
- 262 URL v CSS: žádné chybějící místní soubory.
- 200 položek `ASSETS` pro Service Worker: všechny existují, žádná duplicita.
- Simulovaný mobilní DOM test při šířce 360 px: úvodní navigační tlačítka češtiny mají fantasy styl, odpovědi nikoliv; funguje pět režimů a anglický přehled má dva sloupce.

## Historie verzí a riziko kumulace oprav
Verze 50.8.15 byla částečná aktualizace bez `sw.js`, což mohlo způsobit, že se PWA nepřihlásila k nové verzi. Od 50.8.16 Service Worker součástí aktualizačních balíčků je. Starší soubory grafických motivů zůstávají v kompletním ZIP zachovány kvůli kompatibilitě; tento patch neupravuje původní pravidla přihlašování, aktualizační potvrzování ani data v lokálním úložišti.

## Ověření po instalaci
1. Po zobrazení nové verze 50.8.19 otevři Čeština → Procvičování. Slova a volby 1–10 mají být malá tlačítka bez obrázkových rámů.
2. V češtině přepínej Výuka, Procvičování, Test, Čísla, Diktáty. Zobrazen má být jeden výukový panel najednou (kromě vysvětlení otevřeného na vyžádání).
3. Angličtina → Výuka/Procvičování/Test: témata mají být před tapetou hradu, nikoliv na jednolitém bílém pozadí.
4. Zkontroluj matematiku Fulnek, volbu prostředí, návrat gestem a uložení profilu. Z aplikace nemaž data.
