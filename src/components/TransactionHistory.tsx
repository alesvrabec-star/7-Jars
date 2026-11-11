import React, { useState } from 'react';
import { Transaction, Jar, JarId } from '../types';
import { formatCZK, formatDateCS } from '../utils/formatters';
import { JarIcon } from './JarIcon';
import {
  Search,
  Filter,
  Trash2,
  Download,
  Upload,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  FileSpreadsheet,
  Repeat,
} from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  jars: Jar[];
  onDeleteTransaction: (id: string) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleData: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  jars,
  onDeleteTransaction,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onResetSampleData,
}) => {
  const [filterJar, setFilterJar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = transactions.filter((tx) => {
    if (filterJar !== 'all') {
      if (tx.jarId !== filterJar && tx.toJarId !== filterJar) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNote = tx.note?.toLowerCase().includes(q);
      const matchCat = tx.category?.toLowerCase().includes(q);
      if (!matchNote && !matchCat) return false;
    }
    return true;
  });

  const getJar = (id: JarId) => jars.find((j) => j.id === id);

  return (
    <div id="transaction-history-section" className="bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-4 sm:p-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Historie transakcí a pohybů
          </h3>
          <p className="text-xs text-white/40 font-normal">
            Celkem zaznamenáno {transactions.length} finančních pohybů
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-csv"
            onClick={onExportCSV}
            title="Stáhnout jako tabulku CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-white/70 hover:text-white bg-[#161618] hover:bg-white/5 border border-white/10 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#d4af37]" />
            CSV
          </button>

          <button
            id="btn-export-json"
            onClick={onExportJSON}
            title="Zálohovat kompletní data do JSON"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-white/70 hover:text-white bg-[#161618] hover:bg-white/5 border border-white/10 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            Záloha (JSON)
          </button>

          <label
            htmlFor="input-import-json"
            title="Obnovit data ze souboru JSON"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider font-semibold text-white/70 hover:text-white bg-[#161618] hover:bg-white/5 border border-white/10 rounded-xl transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
            Nahrát
            <input
              id="input-import-json"
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>

          <button
            id="btn-reset-sample"
            onClick={onResetSampleData}
            title="Obnovit výchozí ukázková data"
            className="px-3 py-1.5 text-xs font-normal text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            Výchozí data
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 mb-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-transactions"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hledat v poznámkách nebo kategoriích..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#161618] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#d4af37]/60 focus:outline-none transition-colors"
          />
        </div>

        {/* Jar filter dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-white/40 shrink-0" />
          <select
            id="select-filter-jar"
            value={filterJar}
            onChange={(e) => setFilterJar(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs font-medium bg-[#161618] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d4af37]/60"
          >
            <option value="all">Všechny džbány</option>
            {jars.map((j) => (
              <option key={j.id} value={j.id} className="bg-[#121214] text-white">
                {j.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-white/40">
          <p className="text-sm font-medium">Nebyly nalezeny žádné záznamy.</p>
          <p className="text-xs mt-1">Zkuste upravit vyhledávání nebo filtr.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const jar = getJar(tx.jarId);
            const toJar = tx.toJarId ? getJar(tx.toJarId) : null;
            const isIncoming =
              tx.type === 'income_distribution' || tx.type === 'manual_deposit';
            const isTransfer = tx.type === 'transfer';

            return (
              <div
                key={tx.id}
                id={`tx-row-${tx.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#161618] hover:border-white/15 transition-all gap-3"
              >
                {/* Left side: icon and details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 border ${
                      isTransfer
                        ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                        : isIncoming
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isTransfer ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : isIncoming ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {tx.note || (isIncoming ? 'Příjem' : isTransfer ? 'Převod' : 'Výdaj')}
                      </p>
                      {tx.isRecurring && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 rounded-md shrink-0">
                          <Repeat className="w-2.5 h-2.5" />
                          <span>Trvalý příkaz</span>
                        </span>
                      )}
                      {tx.category && (
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium bg-white/5 text-white/60 border border-white/5 rounded-md truncate">
                          {tx.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/40 mt-0.5">
                      <span>{formatDateCS(tx.date)}</span>
                      <span>•</span>
                      {isTransfer ? (
                        <span>
                          {jar?.shortName} ➔ {toJar?.shortName}
                        </span>
                      ) : (
                        <span className="font-medium text-white/70">
                          {jar?.shortName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and Delete action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-sm font-bold ${
                      isTransfer
                        ? 'text-indigo-400'
                        : isIncoming
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isIncoming ? '+' : isTransfer ? '↔' : '-'}{formatCZK(tx.amount)}
                  </span>

                  <button
                    id={`btn-delete-tx-${tx.id}`}
                    onClick={() => onDeleteTransaction(tx.id)}
                    title="Smazat záznam a vrátit zůstatek"
                    className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
