# Revize 49.8 – Školní dobrodružství

Zdroj: verze 49.7. Původní složky a výukové soubory zachovány.

- Rozděleno 46 vložených bloků CSS do assets/css a 32 vložených bloků JavaScriptu do assets/js. Pořadí načítání zůstalo zachováno.
- Odstraněn historický štítek „Verze 31“ a druhý plovoucí štítek; ponecháno označení verze na přihlašovací obrazovce.
- Aktualizováno označení na 49.8 a cache service workeru včetně nových souborů.
- Navigace a funkce z verze 49.7 zůstaly beze změn, aby se neztratila logika úloh ani výsledky.
- Statická kontrola syntaxe: 0 chyb.

**Pozor:** Jde o bezpečný první krok modularizace. Historické CSS a JS bloky byly odděleny, nikoli automaticky mazány. Úplné odstranění nefunkčního kódu vyžaduje funkční regresní testy v prohlížeči.
