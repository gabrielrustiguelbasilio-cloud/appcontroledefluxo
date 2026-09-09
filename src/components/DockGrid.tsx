import React, { useState } from 'react';
import { 
  Layers, 
  Snowflake, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Repeat, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Filter,
  Truck
} from 'lucide-react';
import { Dock, Vehicle } from '../types/logistics';
import { DockCard } from './DockCard';

interface DockGridProps {
  docks: Dock[];
  vehicles: Vehicle[];
  onOpenDetails: (dock: Dock) => void;
  onQuickAssign: (dock: Dock) => void;
  onQuickComplete: (dock: Dock) => void;
  onQuickStart: (dock: Dock) => void;
  onToggleMaintenance: (dock: Dock) => void;
}

export const DockGrid: React.FC<DockGridProps> = ({
  docks,
  vehicles,
  onOpenDetails,
  onQuickAssign,
  onQuickComplete,
  onQuickStart,
  onToggleMaintenance
}) => {
  const [filter, setFilter] = useState<'all' | 'disponivel' | 'ocupada' | 'manutencao' | 'frio'>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  // Mapeamento rápido de veículos por ID
  const vehicleMap = new Map<string, Vehicle>();
  vehicles.forEach(v => vehicleMap.set(v.id, v));

  // Filtragem
  const filteredDocks = docks.filter(dock => {
    if (filter === 'disponivel' && dock.status !== 'disponivel') return false;
    if (filter === 'ocupada' && dock.status !== 'ocupada') return false;
    if (filter === 'manutencao' && dock.status !== 'manutencao') return false;
    if (filter === 'frio' && !dock.isColdChain) return false;
    if (selectedSector !== 'all' && dock.sector !== selectedSector) return false;
    return true;
  });

  // Estatísticas rápidas de topo
  const totalCount = docks.length;
  const availableCount = docks.filter(d => d.status === 'disponivel').length;
  const occupiedCount = docks.filter(d => d.status === 'ocupada').length;
  const maintenanceCount = docks.filter(d => d.status === 'manutencao').length;
  const coldCount = docks.filter(d => d.isColdChain && d.status === 'ocupada').length;

  // Setores
  const sectors = [
    { id: 'all', name: 'Todos os Setores' },
    { id: 'recebimento_geral', name: 'Recebimento (Docas 01-04)' },
    { id: 'cadeia_frio', name: 'Cadeia Fria (Docas 05-07)' },
    { id: 'expedicao_crossdock', name: 'Cross-docking (Docas 08-10)' },
    { id: 'expedicao_pesada', name: 'Expedição Pesada (Docas 11-14)' },
  ];

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Resumo Visual */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Contadores por Status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Todas as Docas</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[10px]">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('disponivel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'disponivel'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Livres</span>
            <span className="font-mono text-[11px] font-bold">({availableCount})</span>
          </button>

          <button
            onClick={() => setFilter('ocupada')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'ocupada'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Em Operação</span>
            <span className="font-mono text-[11px] font-bold">({occupiedCount})</span>
          </button>

          <button
            onClick={() => setFilter('frio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'frio'
                ? 'bg-cyan-700 text-white'
                : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
            <span>Frio</span>
            <span className="font-mono text-[11px] font-bold">({coldCount}/3)</span>
          </button>

          <button
            onClick={() => setFilter('manutencao')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filter === 'manutencao'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span>Manutenção</span>
            <span className="font-mono text-[11px] font-bold">({maintenanceCount})</span>
          </button>
        </div>

        {/* Seletor de Setor */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            aria-label="Filtrar por setor de docas"
            className="w-full md:w-auto text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Principal das 14 Docas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocks.map(dock => {
          const vehicle = dock.currentVehicleId ? vehicleMap.get(dock.currentVehicleId) : undefined;
          return (
            <DockCard
              key={dock.id}
              dock={dock}
              vehicle={vehicle}
              onOpenDetails={onOpenDetails}
              onQuickAssign={onQuickAssign}
              onQuickComplete={onQuickComplete}
              onQuickStart={onQuickStart}
              onToggleMaintenance={onToggleMaintenance}
            />
          );
        })}
      </div>

      {filteredDocks.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
          <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Nenhuma doca encontrada com os filtros atuais</p>
          <button
            onClick={() => { setFilter('all'); setSelectedSector('all'); }}
            className="mt-3 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
