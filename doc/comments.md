Komentáře a problémy
====================

* Použil jsem funkci fetch(), která je označena jako experimentální a v produkčním prostředí by
bylo zřejmě lepší se jí vyhnout. Ale já ji mám rád, ale věřím, že pro tento účel je stabilní
dostatečně.

* Ze tří nabídnutých zdrojů kurzovních lístků jsem vybral https://openexchangerates.org, protože
v bezplatné licenci nabízí 1,000 requestů, ostatní dva zdroje nabízí jen 100. Další rozdíly jsem
neporovnával.

* https://openexchangerates.org nabízí API metodu /api/convert/{value}/{from}/{to}, která by pro
náš účel byla jako stvořená, ale není v bezplatné verzi, takže jsem si musel vystačit s obecnou
/api/latest

* V balíčku jsou dva frontendy: nejdřív jsem v adresáři **client-jQuery** udělal frontend
s použitím jQuery, protože s touto knihovnou mám mnohem víc zkušeností než s Reactem, chtěl jsem
mít rychle základní kostru celé aplikace, a (možná chybně) jsem předpokládal, že bez Reactu to
bude rychlejší.
Následně jsem v adresáři **client-React** udělal druhý, tentokrát Reactový frontend. Celý tandem
dvou Node.js (backend a reactový frontend) lze spustit jediným příkazem _npm start_ v hlavním
adresáři projektu. React poslouchá na portu 3000, backend na portu 3001. Původní frontend je stále
funkční na adrese http://localhost:3001/ Upřímně, nemám s takovým propojením a _proxováním_ dvou
Node.JS žádné zkušenosti, takže netuším, nakolik je to "production ready". Pro případné produkční
nasazení by samozřejmě bylo potřeba prohnat reactový frontend příkazem _npm run build_ a výsledný
adresář **build** nechat servírovat backendovému Nodu, na což ten zatím není připraven.

* Statistiky, ač na první pohled vypadaly jen jako "mimochodem", byly samozřejmě největší oříšek.
Zvažoval jsem, jestli by server měl držet aktuální hodnoty, anebo hodnoty vždy načíst z uložiště
a hned na uložišti aktualizovat. Obě varianty mají své výhody a nevýhody.

_Stavová varianta_, která udržuje stav v paměti, teoreticky urychluje vyřízení jednotlivých
transakcí tím, že není potřeba opakovaně číst z uložiště (databáze, disk, ...). Tím se tedy nabízí
obzvlášť pro případy, kdy je uložiště pomalé a klientům na rychlosti záleží. Budeme-li se ale držet
předpokladu, že uložiště je doopravdu pomalé a načtení statistických hodnot trvá doopravdy velmi
dlouho, musíme se zabývat i dobou prvotního načtení počátečních hodnot při startu serveru. Zřejmě
nemůžeme zablokovat zpracovávání požadavků po dobu inicializace statistik. Hodnoty z těchto
pořadavků zpracovaných před inicializací statistik na serveru není možné ignorovat a je nutné je
připočíst k hodnotám následně přečtených z uložiště. Zároveň je zřejmé, že dokud není inicializace
statistik dokončená, nemůže server poskytovat klientům statistické informace.

_Bezestavová varianta_ by byla jednodušší v tom, že by nemusela řešit výše popsané problémy. Na
druhou stranu by ale bylo nutno vyřešit problém atomické aktualizace hodnot, tzn. načtení hodnot
z uložiště a zapsání aktualizovaných hodnot zpět, a to souběžně pro paralelně přicházení požadavky.