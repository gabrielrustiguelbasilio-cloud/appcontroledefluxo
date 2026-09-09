import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Truck, 
  Snowflake, 
  Wrench, 
  Clock, 
  FileText, 
  CheckCircle, 
  Play, 
  AlertTriangle, 
  User, 
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Dock, Vehicle } from '../types/logistics';

interface DockDetailModalProps {
  dock: Dock | null;
  vehicle?: Vehicle;
  queueVehicles: Vehicle[];
  onClose: () => void;
  onAssignVehicle: (dockId: number, vehicleId: string) => void;
  onStartOperation: (dock: Dock) => void;
  onCompleteOperation: (dock: Dock) => void;
  onUpdateMaintenance: (dockId: number, inMaintenance: boolean, reason?: string) => void;
}

export const DockDetailModal: React.FC<DockDetailModalProps> = ({
  dock,
  vehicle,
  queueVehicles,
  onClose,
  onAssignVehicle,
  onStartOperation,
  onCompleteOperation,
  onUpdateMaintenance
}) => {
  if (!dock) return null;

  const [selectedQueueVehId, setSelectedQueueVehId] = useState<string>('');
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState(dock.maintenanceReason || '');
  const [isEditingMaintenance, setIsEditingMaintenance] = useState(false);

  // Duração decorrida
  let elapsedMinutes = 0;
  let isDelayed = false;
  const estimatedMin = dock.estimatedDurationMin || 60;

  if (dock.status === 'ocupada' && dock.operationStartTime) {
    const start = new Date(dock.operationStartTime).getTime();
    elapsedMinutes = Math.max(1, Math.round((Date.now() - start) / (60 * 1000)));
    isDelayed = elapsedMinutes > estimatedMin;
  }

  // Filtrar veículos da fila compatíveis com esta doca
  const compatibleQueue = queueVehicles.filter(v => 
    dock.allowedVehicles.includes(v.vehicleType) &&
    (v.cargoType !== 'refrigerada' || dock.isColdChain)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-black text-sm shadow-md">
              {dock.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {dock.name}
                </h3>
                {dock.isColdChain && (
                  <span className="p-1 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center gap-1">
                    <Snowflake className="w-3 h-3 text-cyan-600" />
                    Cadeia Fria
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{dock.sectorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Ficha Técnica da Doca */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Status Atual:</span>
              <span className="font-bold text-slate-900 uppercase">
                {dock.status === 'disponivel' ? '🟢 Disponível' : 
                 dock.status === 'ocupada' ? '🔵 Em Operação' : 
                 dock.status === 'reservada' ? '🟡 Reservada / Trânsito' : '⚪ Manutenção'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Niveladora Hidráulica:</span>
              <span className="font-semibold text-slate-800">
                {dock.hasHydraulicLeveler ? 'Sim (Automática)' : 'Manual / Padrão'}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[11px] block">Veículos Permitidos:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {dock.allowedVehicles.map(v => (
                  <span key={v} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Veículo Atual (se houver) */}
          {vehicle ? (
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                    {vehicle.licensePlate}
                  </span>
                  <span className="font-bold uppercase text-slate-700">
                    {vehicle.vehicleType}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase">
                  {vehicle.operationType}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Motorista:</span>
                  <span className="font-bold text-slate-900">{vehicle.driverName}</span>
                  {vehicle.driverPhone && (
                    <span className="text-slate-500 font-mono text-[11px] block">{vehicle.driverPhone}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Transportadora:</span>
                  <span className="font-semibold text-slate-800">{vehicle.carrier}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Notas Fiscais / CT-e:</span>
                  <span className="font-mono text-slate-700 font-semibold">{vehicle.invoiceNumbers}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Tipo de Carga:</span>
                  <span className="capitalize font-semibold text-slate-800">{vehicle.cargoType}</span>
                </div>
              </div>

              {/* Tempo de Permanência */}
              {dock.status === 'ocupada' && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-[11px] text-slate-500 block">Tempo Decorrido na Doca:</span>
                      <span className={`font-mono font-bold text-sm ${isDelayed ? 'text-rose-600' : 'text-slate-900'}`}>
                        {elapsedMinutes} minutos
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Meta SLA:</span>
                    <span className="font-mono font-semibold text-slate-700">{estimatedMin} min</span>
                  </div>
                </div>
              )}

              {vehicle.notes && (
                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-blue-100">
                  Obs: {vehicle.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Nenhum caminhão atracado nesta posição no momento. Doca pronta para receber veículos.</span>
            </div>
          )}

          {/* Se a Doca estiver disponível: Designar veículo da fila */}
          {dock.status === 'disponivel' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-900 block">
                Designar Veículo da Fila de Espera ({compatibleQueue.length} compatíveis):
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedQueueVehId}
                  onChange={(e) => setSelectedQueueVehId(e.target.value)}
                  aria-label="Selecionar veículo da fila"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="">Selecione um veículo...</option>
                  {compatibleQueue.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.vehicleType.toUpperCase()} ({v.driverName} - {v.carrier}) - {v.cargoType}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedQueueVehId}
                  onClick={() => {
                    if (selectedQueueVehId) {
                      onAssignVehicle(dock.id, selectedQueueVehId);
                      onClose();
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs ${
                    selectedQueueVehId
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Designar
                </button>
              </div>
            </div>
          )}

          {/* Manutenção / Interdição */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-slate-500" />
                Interdição para Manutenção Técnica
              </span>
              <button
                type="button"
                onClick={() => setIsEditingMaintenance(!isEditingMaintenance)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                {isEditingMaintenance ? 'Cancelar' : dock.status === 'manutencao' ? 'Liberar Manutenção' : 'Interditar Doca'}
              </button>
            </div>

            {isEditingMaintenance && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                {dock.status === 'manutencao' ? (
                  <div>
                    <p className="text-slate-600 text-[11px] mb-2">
                      A doca está atualmente interditada. Confirma que a manutenção foi concluída e a doca está liberada para operações?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateMaintenance(dock.id, false);
                        setIsEditingMaintenance(false);
                        onClose();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                    >
                      Confirmar Liberação da Doca
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                      Motivo da Interdição (ex: Revisão niveladora hidráulica, troca de batente):
                    </label>
                    <input
                      type="text"
                      placeholder="Descreva o motivo da manutenção..."
                      value={maintenanceReasonInput}
                      onChange={(e) => setMaintenanceReasonInput(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs mb-2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateMaintenance(dock.id, true, maintenanceReasonInput);
                        setIsEditingMaintenance(false);
                        onClose();
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs"
                    >
                      Interditar Doca Imediatamente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {dock.status === 'reservada' && (
              <button
                type="button"
                onClick={() => {
                  onStartOperation(dock);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Confirmar Atracamento & Iniciar Operação</span>
              </button>
            )}

            {dock.status === 'ocupada' && (
              <button
                type="button"
                onClick={() => {
                  onCompleteOperation(dock);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Concluir Operação & Liberar Doca</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
