#!/bin/sh
# Spouštět pouze z kořene repozitáře skolni-github po rozbalení opravy.
set -eu
[ -f sw.js ] || { echo 'Chybí sw.js – nejsi v kořeni repozitáře.'; exit 1; }
[ -f assets/js/app-version.js ] || { echo 'Chybí assets/js/app-version.js'; exit 1; }
[ -f martin/index.html ] || { echo 'Chybí Martinův index'; exit 1; }
[ -f martin/abc-bank-50-8-88.js ] || { echo 'Chybí testová databáze'; exit 1; }
# Při nové verzi nevynulovat žádný profil, přihlašovací PIN ani data.
if grep -q "version:'50.8.87'" assets/js/app-version.js; then
 sed -i "s/version:'50.8.87'/version:'50.8.88'/g; s/build:'2026-11-27.87'/build:'2026-11-27.88'/g" assets/js/app-version.js
elif ! grep -q "version:'50.8.88'" assets/js/app-version.js; then
 echo 'Neočekávaná verze – nesahám na PWA. Nejprve zkontroluj stav GitHubu.'; exit 1
fi
if grep -q "const VERSION='50.8.87'" sw.js; then
 sed -i 's/50\.8\.87/50.8.88/g; s/50-8-87/50-8-88/g' sw.js
elif ! grep -q "const VERSION='50.8.88'" sw.js; then
 echo 'Neočekávaná verze sw.js – přerušuji.';exit 1
fi
if [ -f index.html ]; then
 sed -i 's@assets/js/app-version.js?v=50887@assets/js/app-version.js?v=50888@g' index.html
fi
# Přidej banku a výukové rozhraní do základní PWA cache, je-li použita.
# Bezpečné opakované spuštění: nezdvojuj soubory v seznamu.
if ! grep -q 'abc-bank-50-8-88.js' sw.js; then
 sed -i "/const TOTAL=ASSETS.length;/i ASSETS.push('./martin/abc-bank-50-8-88.js','./martin/exam-center-50-8-88.js','./martin/exam-center-50-8-88.css');" sw.js
fi
echo 'Příprava 50.8.88 je nainstalována. Nyní git add, commit a push.'
