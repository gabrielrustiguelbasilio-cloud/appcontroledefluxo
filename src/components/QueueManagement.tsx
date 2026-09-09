import React, { useState } from 'react';
import { 
  Truck, 
  Clock, 
  Zap, 
  Snowflake, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Plus, 
  ShieldAlert, 
  ArrowRight,
  Phone,
  Layers
} from 'lucide-react';
import { Vehicle, Dock } from '../types/logistics';
import { logisticsEngine } from '../utils/logisticsEngine';

interface QueueManagementProps {
  vehicles: Vehicle[];
  docks: Dock[];
  onOpenNewVehicle: () => void;
  onAssignDock: (vehicle: Vehicle, dockId: number) => void;
  onAutoAssignVehicle: (vehicle: Vehicle) => void;
}

export const QueueManagement: React.FC<QueueManagementProps> = ({
  vehicles,
  docks,
  onOpenNewVehicle,
  onAssignDock,
  onAutoAssignVehicle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [manualDockSelectVehId, setManualDockSelectVehId] = useState<string | null>(null);

  // Apenas veículos aguardando no pátio
  const queueVehicles = vehicles.filter(v => v.status === 'aguardando_patio');

  // Filtragem
  const filteredQueue = queueVehicles.filter(v => {
    const matchesSearch = 
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.invoiceNumbers.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCargo = cargoFilter === 'all' || v.cargoType === cargoFilter;
    const matchesPriority = priorityFilter === 'all' || v.priority === priorityFilter;

    return matchesSearch && matchesCargo && matchesPriority;
  });

  // Ordenação prioritária: Urgente primeiro, depois Alta, depois tempo de espera mais antigo
  filteredQueue.sort((a, b) => {
    const priorityWeight = { urgente: 3, alta: 2, normal: 1 };
    const diff = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    if (diff !== 0) return diff;
    return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
  });

  // Docas disponíveis para seleção manual rápida
  const availableDocks = docks.filter(d => d.status === 'disponivel');

  return (
    <div className="space-y-4">
      {/* Top Banner & Ação Rápida */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Fila de Veículos no Pátio (Triagem & Bolsão)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              {queueVehicles.length} aguardando
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Veículos com check-in realizado na guarita aguardando liberação e chamada para doca.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenNewVehicle}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Entrada (Check-in)</span>
          </button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por placa, motorista, transportadora ou NF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            aria-label="Filtrar por tipo de carga"
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas as Cargas</option>
            <option value="seca">Carga Seca</option>
            <option value="refrigerada">Refrigerada (Frio)</option>
            <option value="expressa">Expressa / E-com</option>
            <option value="perigosa">Perigosa / Química</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filtrar por prioridade"
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta Prioridade</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Lista da Fila */}
      <div className="space-y-2.5">
        {filteredQueue.map(vehicle => {
          // Cálculo de tempo de espera
          const waitMins = Math.max(1, Math.round((Date.now() - new Date(vehicle.checkInTime).getTime()) / (60 * 1000)));
          const isHighWait = waitMins > 30;

          // Sugestão automática para este veículo
          const recommendation = logisticsEngine.findBestDockForVehicle(vehicle, docks);

          return (
            <div
              key={vehicle.id}
              className={`bg-white p-3.5 sm:p-4 rounded-xl border shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                vehicle.priority === 'urgente' 
                  ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' 
                  : vehicle.priority === 'alta'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Informações do Veículo */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700 border border-slate-200">
                  <Truck className="w-5 h-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                      {vehicle.licensePlate}
                    </span>
                    <span className="text-xs font-semibold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {vehicle.vehicleType}
                    </span>
                    <span className="text-xs font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {vehicle.operationType}
                    </span>

                    {vehicle.cargoType === 'refrigerada' && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-200">
                        <Snowflake className="w-3 h-3 text-cyan-600" />
                        CADEIA FRIA
                      </span>
                    )}

                    {vehicle.priority === 'urgente' && (
                      <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                        URGENTE
                      </span>
                    )}
                    {vehicle.priority === 'alta' && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        ALTA PRIORIDADE
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-900">{vehicle.driverName}</span>
                    <span>•</span>
                    <span>{vehicle.carrier}</span>
                    {vehicle.driverPhone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-500 font-mono">
                          <Phone className="w-3 h-3" />
                          {vehicle.driverPhone}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="font-mono text-slate-500">{vehicle.invoiceNumbers}</span>
                  </div>

                  {/* Sugestão contextual do algoritmo */}
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="font-medium text-slate-700">Doca Recomendada:</span>
                    {recommendation.dock ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {recommendation.dock.code} ({recommendation.dock.name.split(' - ')[1]})
                      </span>
                    ) : (
                      <span className="text-amber-700 italic">
                        {recommendation.reason}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tempo de Espera & Ações */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Tempo no pátio */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <Clock className={`w-3.5 h-3.5 ${isHighWait ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`} />
                  <span className="text-slate-600">Aguardando:</span>
                  <span className={`font-mono font-bold ${isHighWait ? 'text-rose-600' : 'text-slate-900'}`}>
                    {waitMins} min
                  </span>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Auto-alocação Inteligente */}
                  <button
                    onClick={() => onAutoAssignVehicle(vehicle)}
                    disabled={!recommendation.dock}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      recommendation.dock
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                    title={recommendation.reason}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Alocar Auto ({recommendation.dock?.code || 'N/D'})</span>
                  </button>

                  {/* Seleção Manual */}
                  <div className="relative">
                    {manualDockSelectVehId === vehicle.id ? (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
                        <select
                          onChange={(e) => {
                            const dId = Number(e.target.value);
                            if (dId) {
                              onAssignDock(vehicle, dId);
                              setManualDockSelectVehId(null);
                            }
                          }}
                          defaultValue=""
                          aria-label="Escolher doca para alocação manual"
                          className="text-xs font-bold bg-white text-slate-800 border border-slate-300 rounded px-2 py-1"
                        >
                          <option value="" disabled>Escolha a Doca...</option>
                          {availableDocks.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.code} - {d.sectorName} {d.isColdChain ? '(Frio)' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setManualDockSelectVehId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setManualDockSelectVehId(vehicle.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      >
                        Manual...
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredQueue.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">Nenhum veículo aguardando no pátio</p>
            <p className="text-xs text-slate-500 mt-1">
              Todas as carretas e caminhões que deram entrada já estão atracados nas docas ou foram liberados.
            </p>
            <button
              onClick={onOpenNewVehicle}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Registrar Nova Chegada de Veículo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
