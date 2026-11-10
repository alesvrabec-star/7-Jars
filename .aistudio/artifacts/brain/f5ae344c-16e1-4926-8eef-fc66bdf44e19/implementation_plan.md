# Plánovač 10leté finanční nezávislosti a pasivního příjmu (Smart Life & 7 džbánů)

Interaktivní kalkulačka a simulační plánovač finanční nezávislosti postavený na principech portálu Smart Life (Tomáš Pieružek), pravidlu 4 % (FIRE), složeném úročení a automatickém propojení s vklady do Džbánu finanční svobody.

## Uživatelská rozhodnutí a potvrzená volba

> [!IMPORTANT]
> Na základě vašich odpovědí v 1. fázi plánování implementujeme konkrétní směr:

- **Potvrzený hlavní nástroj**: Interaktivní kalkulačka a plánovač 10leté finanční nezávislosti s vizualizací trajektorie růstu majetku a milníků pasivního příjmu.
- **Potvrzená metodika Smart Life**: Pravidlo 4 % (kapitál = 25× roční výdaje), investice do širokých nízkonákladových ETF fondů a exponenciální křivka složeného úročení s volitelným očekávaným ročním výnosem (např. 7–9 % p.a.).
- **Potvrzené propojení se džbány**: Automatické načítání měsíčního investičního tempa a aktuálního zůstatku přímo ze **Džbánu finanční svobody (FFA)**, s možností přepínat mezi reálným stavem a volnou simulací.

---

## 1. Přehled a hlavní koncept

### Co modul přináší
Spojuje každodenní rozpočtovou disciplínu metody Sedmi džbánů s dlouhodobou vizí finanční svobody do 10 let:
1. **Výpočet čísla finanční svobody (Financial Independence Number)**: Na základě měsíčních výdajů z Džbánu nutností (nebo zadaných životních nákladů) spočítá cílový majetek podle pravidla 4 % (např. výdaje 30 000 Kč měsíčně = 360 000 Kč ročně = cílové portfolio 9 000 000 Kč, které generuje bezpečný pasivní příjem 30 000 Kč měsíčně navždy).
2. **10letá trajektorie složeného úročení (ETF Compound Growth)**: Interaktivní graf a tabulka vývoje portfolia po jednotlivých letech (1 až 10+ let), rozdělující kapitál na vlastní vklady a zhodnocení úrokem z úroků.
3. **Míra úspor (Savings Rate)**: Klíčová metrika Smart Life ukazující, kolik procent z celkového příjmu směřuje do Džbánu finanční svobody. Při míře úspor ~50 % je finanční nezávislost dosažitelná přibližně za 10 let.
4. **Milníky svobody (Freedom Milestones)**:
   - *Milník 1: Částečná nezávislost (Lean FIRE)* – pasivní příjem pokrývá základní jídlo a energie.
   - *Milník 2: Poloviční svoboda (Barista FIRE)* – pasivní příjem pokrývá 50 % životních nákladů (stačí pracovat na půl úvazku).
   - *Milník 3: Úplná finanční svoboda (Full FIRE)* – pasivní příjem 100% pokrývá všechny výdaje.

---

## 2. Uživatelské rozhraní a vizuální design

### Uživatelské toky (User Flows)
1. **Otevření modulu**:
   - V horní liště i v přehledu Džbánu finanční svobody přibude tlačítko **„10 let k nezávislosti“** s ikonou grafu a růstu.
2. **Přehledová karta & Parametry**:
   - Uživatel vidí své **Číslo finanční svobody**, **Aktuální tempo (Kč/měs)** načtené ze džbánu FFA, **Predikovaný rok dosažení** a **Měsíční pasivní příjem za 10 let**.
   - Posuvníky a číselné vstupy umožňují okamžitě měnit:
     - Měsíční investici (výchozí: hodnota ze džbánu FFA).
     - Počáteční investovaný kapitál (výchozí: zůstatek džbánu FFA).
     - Očekávaný roční výnos ETF (výchozí: 8 % p.a. v souladu s historickým průměrem S&P 500 / MSCI World).
     - Cílový měsíční pasivní příjem pro život bez práce.
3. **Interaktivní 10letý graf a milníky**:
   - Přehledný SVG graf s křivkou složeného úročení zobrazující poměr vložených peněz vs. zisk z investic.
   - Indikátory dosažených a budoucích milníků.
4. **Smart Life akční doporučení**:
   - Praktické tipy na zkrácení doby k nezávislosti (např. *"Při navýšení investice do Džbánu svobody o 3 000 Kč měsíčně dosáhnete cíle o 2,5 roku dříve"*).

### Vizuální identita a styl
- V souladu s dosavadním luxusním temným tématem (černé pozadí `#0a0a0b`, strukturální karty `#121214` a `#161618`, zlaté akcenty `#d4af37` a smaragdová zelená `#10b981` pro investiční růst).
- Striktní **tabular-nums** u všech finančních čísel pro dokonalé zarovnání.
- Žádné zbytečné animace nebo dekorativní prvky; čisté karty s jednoznačnými hodnotami a interaktivními posuvníky.

---

## 3. Klíčová rozhodnutí a architektura

- **Architektura komponenty**: Samostatný, vysoce optimalizovaný modul `FinancialIndependenceModal.tsx` + kompaktní widget / zkratka `FinancialIndependenceWidget.tsx`, který lze otevřít z přehledu nebo detailu Džbánu svobody.
- **Žádné externí těžké knihovny grafů**: Není potřeba instalovat Chart.js ani Recharts; vizualizace 10leté křivky bude vytvořena pomocí čistého, lehkého a responzivního SVG přímo v Reactu s interaktivním hover tooltipem.
- **Ukládání parametrů**: Uživatelem přizpůsobené parametry (např. očekávaný výnos p.a., cílový pasivní příjem) se ukládají do `localStorage` i synchronizují do Firestore profilu uživatele.

---

## 4. Technická architektura a datový model

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│  - Jars state (FFA balance, FFA allocation %, income)  │
│  - Transactions & recurring expenses                   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌───────────────────────────────────┐
│     Header / StatsBar   │ │   FinancialIndependenceModal      │
│  - Tlačítko 10 let      │ │   - Výpočet pravidla 4 % (FIRE)   │
│    k nezávislosti       │ │   - Simulátor složeného úročení   │
│                         │ │   - 10letá SVG křivka růstu       │
│                         │ │   - Tři milníky pasivního příjmu  │
│                         │ │   - Doporučení Smart Life         │
└─────────────────────────┘ └───────────────────────────────────┘
```

### Matematický model složeného úročení (Smart Life formula)
Pro každý měsíc $m \in [1, 120]$:
$$FV_m = FV_{m-1} \times \left(1 + \frac{r}{12}\right) + PMT$$
kde $r$ je roční výnos ETF (např. $0.08$) a $PMT$ je měsíční vklad do Džbánu finanční svobody.
Kalkulace pasivního příjmu při 4% bezpečném výběru:
$$\text{Měsíční pasivní příjem} = \frac{FV \times 0.04}{12}$$
