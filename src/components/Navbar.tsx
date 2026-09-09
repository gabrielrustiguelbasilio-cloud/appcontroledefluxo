import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Layers, 
  PlusCircle, 
  Zap, 
  Printer, 
  BookOpen, 
  Database, 
  Clock, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { StorageStateMeta } from '../types/logistics';

interface NavbarProps {
  onOpenNewVehicle: () => void;
  onAutoDispatchAll: () => void;
  onOpenPrintReport: () => void;
  onOpenArchitecture: () => void;
  queueCount: number;
  availableDocksCount: number;
  meta: StorageStateMeta;
  activeTab: 'docas' | 'fila' | 'kpis' | 'historico';
  setActiveTab: (tab: 'docas' | 'fila' | 'kpis' | 'historico') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewVehicle,
  onAutoDispatchAll,
  onOpenPrintReport,
  onOpenArchitecture,
  queueCount,
  availableDocksCount,
  meta,
  activeTab,
  setActiveTab
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  const formattedDate = currentTime.toLocaleDateString('pt-BR', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short' 
  });

  // Determinação de turno operacional
  const hour = currentTime.getHours();
  const shiftName = hour >= 6 && hour < 14 ? 'Turno 1 (Manhã)' : hour >= 14 && hour < 22 ? 'Turno 2 (Tarde)' : 'Turno 3 (Noturno)';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
      {/* Top Bar: Identidade, Relógio e Ações Rápidas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 text-white font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">DocaFlow</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  YMS 14 DOCAS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestão Integrada de Pátio & Fluxo Logístico
              </p>
            </div>
          </div>

          {/* Relógio em Tempo Real & Indicador de Turno */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-medium">{formattedTime}</span>
              <span className="text-slate-500">|</span>
              <span className="capitalize">{formattedDate}</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-700 font-medium text-blue-300 border border-slate-600">
              {shiftName}
            </span>
            <div className="flex items-center gap-1.5 text-slate-300 pl-2 border-l border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-medium">Docas: {14 - availableDocksCount}/14</span>
            </div>
          </div>

          {/* Botões de Ação Principal */}
          <div className="flex items-center gap-2">
            {/* Auto Alocar Inteligente */}
            <button
              id="btn-auto-dispatch"
              onClick={onAutoDispatchAll}
              disabled={queueCount === 0 || availableDocksCount === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                queueCount > 0 && availableDocksCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              }`}
              title="Aloca automaticamente o próximo caminhão da fila na melhor doca disponível"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-Alocar Fila</span>
              {queueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-900/30 text-xs font-mono">
                  {queueCount}
                </span>
              )}
            </button>

            {/* Novo Veículo na Portaria */}
            <button
              id="btn-novo-veiculo"
              onClick={onOpenNewVehicle}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Entrada Veículo</span>
            </button>

            {/* Relatório Impressão */}
            <button
              id="btn-relatorio"
              onClick={onOpenPrintReport}
              className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Gerar Relatório Estruturado com Impressão / PDF"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span className="hidden md:inline">Relatório</span>
            </button>

            {/* Dossiê Arquitetura Técnica */}
            <button
              id="btn-arquitetura"
              onClick={onOpenArchitecture}
              className="p-2 sm:px-3 sm:py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-lg text-xs font-semibold border border-indigo-700/60 transition-colors flex items-center gap-1.5"
              title="Ver Arquitetura Técnica, Schemas, Trade-offs e Roadmap"
            >
              <BookOpen className="w-4 h-4 text-indigo-300" />
              <span className="hidden lg:inline">Arquitetura</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar: Abas de visualização e status de persistência */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-1.5">
          <nav className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            <button
              id="tab-docas"
              onClick={() => setActiveTab('docas')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'docas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              14 Docas em Tempo Real
            </button>

            <button
              id="tab-fila"
              onClick={() => setActiveTab('fila')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'fila'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Fila do Pátio
              {queueCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'fila' ? 'bg-blue-800 text-white' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {queueCount}
                </span>
              )}
            </button>

            <button
              id="tab-kpis"
              onClick={() => setActiveTab('kpis')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'kpis'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              KPIs & Gargalos
            </button>

            <button
              id="tab-historico"
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === 'historico'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Logs & Histórico
            </button>
          </nav>

          {/* Indicador de Persistência Ativa */}
          <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-end">
            <div 
              onClick={onOpenArchitecture}
              className="cursor-pointer hover:text-slate-200 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px]"
              title="Clique para gerenciar persistência e backups"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Persistência:</span>
              <span className="text-emerald-300 font-semibold uppercase">
                {meta.provider === 'vercel_blob' ? 'Vercel Blob' : meta.provider === 'google_drive' ? 'Google Drive' : 'Local + Backup'}
              </span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
