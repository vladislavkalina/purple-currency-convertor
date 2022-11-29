Komentáře a problémy
====================

* Použil jsem funkci Fetch(), která je označena jako experimentální a v produkčním prostředí by
bylo zřejmě lepší se jí vyhnout. Ale já ji mám rád, ale věřím, že pro tento účel je stabilní
dostatečně.

* Ze tří nabídnutých zdrojů kurzovních lístků jsem vybral https://openexchangerates.org, protože
v bezplatné licenci nabízí 1,000 requestů, ostatní dva zdroje nabízí jen 100. Další rozdíly jsem
neporovnával.

* https://openexchangerates.org nabízí API metodu /api/convert/{value}/{from}/{to}, která by pro
náš účel byla jako stvořená, ale není v bezplatné verzi, takže jsem si musel vystačit s obecnou
/api/latest

* Pro frontend jsem prozatím použil zatím pouze jQuery, o čemž si nejsem jistý, jestli splňuje
větu ze zadání: _other __modern__ frameworks_. Můj původní záměr byl udělat rychle jednoduchou
funkční kostru všech komponent, a poté postupně jednotlivé komponenty vylepšit, frontend jsem
chtěl přepsat do Reactu. Ale backend mi zabral mnohem víc času, než jsem původně odhadoval, takže
frontend prozatím nechávám jednoduchý, a případně ještě přepíšu v příštích dnech.

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