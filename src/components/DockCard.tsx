import React from 'react';
import { 
  Snowflake, 
  Wrench, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Repeat, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  User, 
  FileText,
  Play,
  RotateCcw
} from 'lucide-react';
import { Dock, Vehicle } from '../types/logistics';

interface DockCardProps {
  dock: Dock;
  vehicle?: Vehicle;
  onOpenDetails: (dock: Dock) => void;
  onQuickAssign: (dock: Dock) => void;
  onQuickComplete: (dock: Dock) => void;
  onQuickStart: (dock: Dock) => void;
  onToggleMaintenance: (dock: Dock) => void;
}

export const DockCard: React.FC<DockCardProps> = ({
  dock,
  vehicle,
  onOpenDetails,
  onQuickAssign,
  onQuickComplete,
  onQuickStart,
  onToggleMaintenance
}) => {
  // Cálculo de tempo decorrido e SLA
  let elapsedMinutes = 0;
  let isDelayed = false;
  let progressPct = 0;
  const estimatedMin = dock.estimatedDurationMin || 60;

  if (dock.status === 'ocupada' && dock.operationStartTime) {
    const start = new Date(dock.operationStartTime).getTime();
    elapsedMinutes = Math.max(1, Math.round((Date.now() - start) / (60 * 1000)));
    isDelayed = elapsedMinutes > estimatedMin;
    progressPct = Math.min(100, Math.round((elapsedMinutes / estimatedMin) * 100));
  }

  // Estilos de status
  const getStatusBadge = () => {
    switch (dock.status) {
      case 'disponivel':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Disponível',
          cardBorder: 'border-emerald-200 hover:border-emerald-400 bg-white'
        };
      case 'ocupada':
        return {
          bg: isDelayed ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-blue-50 text-blue-800 border-blue-300',
          dot: isDelayed ? 'bg-rose-500 animate-ping' : 'bg-blue-600 animate-pulse',
          label: isDelayed ? 'Tempo Excedido' : 'Em Operação',
          cardBorder: isDelayed ? 'border-rose-300 ring-2 ring-rose-200 bg-rose-50/20' : 'border-blue-200 hover:border-blue-400 bg-white'
        };
      case 'reservada':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-bounce',
          label: 'Em Trânsito / Reservada',
          cardBorder: 'border-amber-200 hover:border-amber-400 bg-amber-50/20'
        };
      case 'manutencao':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          label: 'Interditada / Manutenção',
          cardBorder: 'border-slate-300 bg-slate-50 opacity-90'
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div 
      id={`dock-card-${dock.id}`}
      className={`rounded-xl border shadow-sm transition-all duration-200 flex flex-col justify-between overflow-hidden ${status.cardBorder}`}
    >
      {/* Cabeçalho da Doca */}
      <div className="p-3.5 pb-2.5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900 tracking-tight font-mono">
              {dock.code}
            </span>
            {dock.isColdChain && (
              <span className="p-1 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center gap-0.5 border border-cyan-200" title="Câmara Fria / Perecíveis">
                <Snowflake className="w-3 h-3 text-cyan-600" />
                FRIO
              </span>
            )}
            {dock.hasHydraulicLeveler && (
              <span className="p-1 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold" title="Niveladora Hidráulica Embutida">
                Niveladora
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-700 font-semibold truncate block max-w-[170px]">
            {dock.name.split(' - ')[1] || dock.sectorName}
          </span>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${status.bg}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
          <span>{status.label}</span>
        </div>
      </div>

      {/* Conteúdo Central do Cartão */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        {dock.status === 'disponivel' && (
          <div className="py-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-100">
              <CheckCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">Doca Livre e Calçada</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Compatível com: {dock.allowedVehicles.join(', ')}
            </p>
          </div>
        )}

        {dock.status === 'manutencao' && (
          <div className="py-3 text-center">
            <div className="w-9 h-9 mx-auto rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-1.5">
              <Wrench className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-800">Interdição Técnica</p>
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
              "{dock.maintenanceReason || 'Em vistoria de segurança'}"
            </p>
          </div>
        )}

        {dock.status === 'reservada' && (
          <div className="py-2.5">
            <div className="flex items-center gap-2 mb-1.5 text-amber-700 font-semibold text-xs">
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Caminhão a Caminho</span>
            </div>
            {vehicle ? (
              <div className="bg-amber-100/60 p-2.5 rounded-lg border border-amber-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="font-mono bg-amber-200/70 px-1.5 py-0.5 rounded text-[11px]">{vehicle.licensePlate}</span>
                  <span className="capitalize text-[11px] font-semibold text-amber-900">{vehicle.vehicleType}</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-1 truncate">
                  {vehicle.driverName} ({vehicle.carrier})
                </p>
              </div>
            ) : (
              <p className="text-xs text-amber-800">Veículo aguardando manobra de atracamento.</p>
            )}
          </div>
        )}

        {dock.status === 'ocupada' && (
          <div className="space-y-2.5">
            {vehicle ? (
              <div className="space-y-1.5">
                {/* Placa e Tipo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                      {vehicle.licensePlate}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {vehicle.operationType}
                  </span>
                </div>

                {/* Motorista & Transportadora */}
                <div className="text-xs text-slate-700">
                  <p className="font-semibold text-slate-900 truncate">{vehicle.driverName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{vehicle.carrier}</p>
                </div>

                {/* Nota Fiscal ou Carga */}
                <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono truncate bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{vehicle.invoiceNumbers || 'Sem NF informada'}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">Veículo atracado.</div>
            )}

            {/* Cronômetro & Barra de SLA */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3 h-3" />
                  Tempo Doca:
                </span>
                <span className={`font-mono font-bold ${isDelayed ? 'text-rose-600' : 'text-slate-800'}`}>
                  {elapsedMinutes} min / {estimatedMin}m
                </span>
              </div>
              
              {/* Barra de Progresso */}
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isDelayed ? 'bg-rose-500' : progressPct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Ações Rápidas de Chão de Fábrica */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
        <button
          onClick={() => onOpenDetails(dock)}
          className="px-2.5 py-1.5 rounded text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          title="Ver detalhes completos da doca e carga"
        >
          Detalhes
        </button>

        <div className="flex items-center gap-1">
          {dock.status === 'disponivel' && (
            <button
              onClick={() => onQuickAssign(dock)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5" />
              Alocar
            </button>
          )}

          {dock.status === 'reservada' && (
            <button
              onClick={() => onQuickStart(dock)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              Atracar
            </button>
          )}

          {dock.status === 'ocupada' && (
            <button
              onClick={() => onQuickComplete(dock)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-blue-700 hover:bg-blue-600 text-white transition-colors shadow-sm flex items-center gap-1"
              title="Finalizar operação de carregamento/descarga e liberar a doca"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Finalizar
            </button>
          )}

          {dock.status === 'manutencao' && (
            <button
              onClick={() => onToggleMaintenance(dock)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1"
            >
              Liberar Doca
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
