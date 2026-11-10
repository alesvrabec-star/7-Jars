export interface FinancialTip {
  id: number;
  category: 'Citát & Moudrost' | 'Finanční psychologie' | 'Praktický tip' | 'Pravidlo džbánů' | 'Investování';
  quote: string;
  author: string;
}

export const FINANCIAL_TIPS: FinancialTip[] = [
  {
    id: 1,
    category: 'Citát & Moudrost',
    quote: 'Neutrácejte to, co vám zbude po ušetření. Ušetřete to, co vám zbude po zaplacení sobě samému.',
    author: 'Warren Buffett',
  },
  {
    id: 2,
    category: 'Praktický tip',
    quote: 'Pravidlo 24 hodin: Než si koupíte věc, která není nezbytná, počkejte jeden den. V 70 % případů zjistíte, že ji vlastně vůbec nepotřebujete.',
    author: 'Pravidlo vědomého nakupování',
  },
  {
    id: 3,
    category: 'Finanční psychologie',
    quote: 'Skutečné bohatství je to, co nevidíte. Jsou to auta, která jste si nekoupili, hodinky, které nenosíte, a peníze, které pracují pro vaši svobodu.',
    author: 'Morgan Housel, Psychologie peněz',
  },
  {
    id: 4,
    category: 'Pravidlo džbánů',
    quote: 'Džbán na radost není zbytečnost. Pokud si nedopřejete zaslouženou odměnu bez výčitek, vaše vůle šetřit dříve nebo později selže.',
    author: 'Metoda 7 džbánů',
  },
  {
    id: 5,
    category: 'Investování',
    quote: 'Složené úročení je osmý div světa. Kdo mu rozumí, ten na něm vydělává; kdo ne, ten ho platí.',
    author: 'Albert Einstein',
  },
  {
    id: 6,
    category: 'Citát & Moudrost',
    quote: 'Část z každého výdělku, který získáte, patří vám a musíte si ji ponechat. Nejméně jedna desetina z každého příjmu.',
    author: 'George S. Clason, Nejbohatší muž v Babylóně',
  },
  {
    id: 7,
    category: 'Finanční psychologie',
    quote: 'Utrácet peníze, abyste ukázali lidem, kolik máte peněz, je nejrychlejší způsob, jak mít méně peněz.',
    author: 'Morgan Housel',
  },
  {
    id: 8,
    category: 'Praktický tip',
    quote: 'Pravidlo 3 až 6 měsíců: Váš džbán Rezerva by měl pokrýt nezbytné životní náklady na půl roku. Teprve pak máte skutečný klid v duši a nezávislost.',
    author: 'Finanční jistota',
  },
  {
    id: 9,
    category: 'Investování',
    quote: 'Nejlepší doba, kdy zasadit strom, byla před dvaceti lety. Druhá nejlepší doba je právě teď.',
    author: 'Čínské přísloví o investování',
  },
  {
    id: 10,
    category: 'Citát & Moudrost',
    quote: 'Cena je to, co zaplatíte. Hodnota je to, co získáte.',
    author: 'Warren Buffett',
  },
  {
    id: 11,
    category: 'Pravidlo džbánů',
    quote: 'Finanční svoboda není cíl pro důchod v šedesáti. Je to schopnost říct „ne“ práci nebo lidem, kteří vám berou energii, protože vás nedrží peníze v šachu.',
    author: 'Metoda 7 džbánů',
  },
  {
    id: 12,
    category: 'Praktický tip',
    quote: 'Přepočítejte si nákupy na hodiny práce. Když tričko stojí 1 500 Kč a vy vyděláváte 250 Kč čistého na hodinu, opravdu vám stojí za 6 hodin vašeho života?',
    author: 'Vědomé utrácení',
  },
  {
    id: 13,
    category: 'Citát & Moudrost',
    quote: 'Chudoba nespočívá v nedostatku majetku, ale v nenasytnosti přání.',
    author: 'Platón',
  },
  {
    id: 14,
    category: 'Finanční psychologie',
    quote: 'Finanční úspěch není věda o raketách. Je to měkká dovednost, kde vaše chování a emoce hrají větší roli než to, jak jste chytří.',
    author: 'Morgan Housel',
  },
  {
    id: 15,
    category: 'Investování',
    quote: 'Investice do vzdělání nese ty nejvyšší úroky. Váš Džbán na vzdělání je palivem pro budoucí růst všech ostatních džbánů.',
    author: 'Benjamin Franklin',
  },
  {
    id: 16,
    category: 'Pravidlo džbánů',
    quote: 'Džbán na dárky a charitu vás učí štědrosti a odstraňuje strach z nedostatku. Když dokážete peníze darovat, dáváte mozku signál, že máte dostatek.',
    author: 'Psychologie hojnosti',
  },
  {
    id: 17,
    category: 'Praktický tip',
    quote: 'Automatizujte své úspory hned v den výplaty. Co nevidíte na běžném účtu mezi běžnými výdaji, to neutrácíte.',
    author: 'Automatizace rozpočtu',
  },
  {
    id: 18,
    category: 'Citát & Moudrost',
    quote: 'Bohatý není ten, kdo má hodně, ale ten, kdo málo potřebuje a dokáže se těšit z toho, co má.',
    author: 'Seneca',
  },
  {
    id: 19,
    category: 'Investování',
    quote: 'Trh je nástroj, který přesouvá peníze od netrpělivých k trpělivým.',
    author: 'Warren Buffett',
  },
  {
    id: 20,
    category: 'Finanční psychologie',
    quote: 'Rozpočet vám nebere svobodu utrácet. Naopak vám dává svobodu utrácet přesně za to, co pro vás má skutečný smysl, a to bez černého svědomí.',
    author: 'Principy zdravého rozpočtu',
  },
  {
    id: 21,
    category: 'Citát & Moudrost',
    quote: 'Kdo kupuje to, co nepotřebuje, bude brzy muset prodávat to, co potřebuje.',
    author: 'Benjamin Franklin',
  },
  {
    id: 22,
    category: 'Praktický tip',
    quote: 'Pozor na malé netěsnosti: i malá díra potopí velkou loď. Předplatná za 99 Kč měsíčně, která nevyužíváte, dělají za pár let tisíce.',
    author: 'Osobní finance v praxi',
  },
  {
    id: 23,
    category: 'Investování',
    quote: 'Nesnažte se časovat trh. Doba strávená na trhu (Time in the market) téměř vždy poráží snahu vystihnout správný okamžik (Timing the market).',
    author: 'Investiční pravidlo',
  },
  {
    id: 24,
    category: 'Pravidlo džbánů',
    quote: 'Nikdy nepůjčujte peníze z Džbánu na nutnosti nebo Rezervy do Džbánu na radost. Hranice mezi džbány jsou vaší ochranou před impulzivností.',
    author: 'Zlaté pravidlo rozpočtování',
  },
  {
    id: 25,
    category: 'Finanční psychologie',
    quote: 'Být bohatý znamená mít peníze. Být finančně svobodný znamená mít čas a kontrolu nad svým dnem.',
    author: 'Moderní bohatství',
  },
  {
    id: 26,
    category: 'Citát & Moudrost',
    quote: 'Rozdíl mezi úspěšnými lidmi a těmi opravdu úspěšnými je v tom, že ti opravdu úspěšní říkají „ne“ téměř na všechno.',
    author: 'Warren Buffett',
  },
  {
    id: 27,
    category: 'Praktický tip',
    quote: 'Inflace životního stylu je tichý zabiják bohatství. Až vám zvednou plat, pošlete alespoň 50 % z navýšení rovnou do Finanční svobody.',
    author: 'Boj s inflací životního stylu',
  },
  {
    id: 28,
    category: 'Citát & Moudrost',
    quote: 'Neříkejte mi, jaké jsou vaše priority. Ukažte mi, za co utrácíte peníze, a já vám řeknu, co je pro vás skutečně důležité.',
    author: 'James W. Frick',
  },
  {
    id: 29,
    category: 'Investování',
    quote: 'Až 80 % úspěchu při budování bohatství tvoří řízení osobních financí, rozpočet a míra úspor. Teprve na tomto základě dokáže investování do ETF fondů přinést skutečnou finanční svobodu do 10 let.',
    author: 'Tomáš Pieružek, Smart Life (smart-life.sk)',
  },
  {
    id: 30,
    category: 'Investování',
    quote: 'Pravidlo 4 %: Finanční svoboda nastává ve chvíli, kdy váš kapitál ve Džbánu svobody dosáhne 25násobku vašich ročních výdajů. Z nízkonákladových ETF fondů pak bezpečně čerpáte pasivní příjem.',
    author: 'Pravidlo 4 % (FIRE & Trinity Study)',
  },
];
