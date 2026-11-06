# Školní dobrodružství 50.7.2 – jednotný modul karet

- `assets/js/ui-cards.js` je jediná definice ikon, HTML navigačních karet a jejich mřížky. Veřejné API `SDUICards.html()`, `SDUICards.grid()`, `SDUICards.button()`, `SDUICards.decorate()` a `SDUICards.scan()`.
- `assets/css/ui-cards.css` obsahuje jediný vzhled a breakpointy 2 / 3 / 4 sloupce.
- Školní plány (`school-plans-50-2.js`) a učivo (`ucivo-50-1.js`) volají přímo sdílenou továrnu karet.
- Starší statické karty (Matematika, Čeština, Angličtina, Vlastivěda) jsou připojeny ke stejnému modulu bez ztráty datových atributů nebo obsluhy kliknutí; jediný MutationObserver zpracuje nabídky vytvářené za běhu.
- Titulní ilustrované obaly předmětů mají variantu `sd-ui-cover` (zachovávají ilustrace). Odpovědi testů, formuláře a nápověda nejsou navigační karty a modul je neupravuje.
- Odstraněny dvě staré dekorovací implementace z verzí 50.7.0 / 50.7.1, duplicitní styly a rizikové vymazání localStorage při novém spuštění.
- Pro změnu vzhledu ikon/karet upravovat pouze `ui-cards.js` a `ui-cards.css`; nepřidávat další CSS override vrstvy.
