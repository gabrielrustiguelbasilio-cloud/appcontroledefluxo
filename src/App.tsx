import React, { useState, useEffect, useMemo } from 'react';
import { 
  Navbar 
} from './components/Navbar';
import { 
  DockGrid 
} from './components/DockGrid';
import { 
  QueueManagement 
} from './components/QueueManagement';
import { 
  KpiDashboard 
} from './components/KpiDashboard';
import { 
  MovementsTable 
} from './components/MovementsTable';
import { 
  NewVehicleModal 
} from './components/NewVehicleModal';
import { 
  DockDetailModal 
} from './components/DockDetailModal';
import { 
  PrintableReport 
} from './components/PrintableReport';
import { 
  ArchitectureModal 
} from './components/ArchitectureModal';
import { 
  Dock, 
  Vehicle, 
  MovementLog 
} from './types/logistics';
import { 
  storageService, 
  AppState 
} from './services/storageService';
import { 
  logisticsEngine 
} from './utils/logisticsEngine';
import { 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';

export default function App() {
  // Estado central da aplicação persistente
  const [appState, setAppState] = useState<AppState>(() => storageService.loadState());
  const [activeTab, setActiveTab] = useState<'docas' | 'fila' | 'kpis' | 'historico'>('docas');

  // Modais
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [selectedDock, setSelectedDock] = useState<Dock | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Banner de Notificação Rápida
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Salvar no storage sempre que houver alteração
  const updateState = (newState: Partial<AppState>) => {
    setAppState(prev => {
      const merged: AppState = {
        ...prev,
        ...newState,
        docks: newState.docks || prev.docks,
        vehicles: newState.vehicles || prev.vehicles,
        logs: newState.logs || prev.logs,
      };
      storageService.saveState(merged);
      return merged;
    });
  };

  const { docks, vehicles, logs, meta } = appState;

  // KPIs e Métricas Calculadas
  const kpis = useMemo(() => logisticsEngine.calculateKPIs(docks, vehicles), [docks, vehicles]);
  const bottlenecks = useMemo(() => logisticsEngine.detectBottlenecks(docks, vehicles, kpis), [docks, vehicles, kpis]);
  const suggestions = useMemo(() => logisticsEngine.generateSuggestions(docks, vehicles, kpis), [docks, vehicles, kpis]);

  const queueCount = useMemo(() => vehicles.filter(v => v.status === 'aguardando_patio').length, [vehicles]);
  const availableDocksCount = useMemo(() => docks.filter(d => d.status === 'disponivel').length, [docks]);

  // Handler: Novo Veículo na Portaria (Check-in)
  const handleSaveVehicle = (vehicleData: Partial<Vehicle>, directDockId?: number) => {
    const newId = `veh-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    const newVehicle: Vehicle = {
      id: newId,
      licensePlate: vehicleData.licensePlate || 'SEM-PLACA',
      driverName: vehicleData.driverName || 'Motorista',
      driverPhone: vehicleData.driverPhone,
      carrier: vehicleData.carrier || 'Transportadora',
      vehicleType: vehicleData.vehicleType || 'truck',
      cargoType: vehicleData.cargoType || 'seca',
      operationType: vehicleData.operationType || 'descarga',
      invoiceNumbers: vehicleData.invoiceNumbers || 'NF pendente',
      priority: vehicleData.priority || 'normal',
      notes: vehicleData.notes,
      checkInTime: nowIso,
      status: directDockId ? 'em_operacao' : 'aguardando_patio',
      assignedDockId: directDockId,
      estimatedMinutes: vehicleData.estimatedMinutes || 60,
      dockedTime: directDockId ? nowIso : undefined,
      operationStartTime: directDockId ? nowIso : undefined,
    };

    const newLog: MovementLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      action: directDockId ? 'docked' : 'checkin',
      vehicleId: newId,
      licensePlate: newVehicle.licensePlate,
      dockId: directDockId,
      dockCode: directDockId ? docks.find(d => d.id === directDockId)?.code : undefined,
      operator: 'Guarita Portaria 01',
      details: directDockId 
        ? `Check-in realizado com alocação direta imediata na ${docks.find(d => d.id === directDockId)?.code}.`
        : `Check-in realizado com sucesso. Veículo aguardando no bolsão de triagem.`
    };

    let updatedDocks = [...docks];
    if (directDockId) {
      updatedDocks = updatedDocks.map(d => {
        if (d.id === directDockId) {
          return {
            ...d,
            status: 'ocupada' as const,
            currentVehicleId: newId,
            operationStartTime: nowIso,
            estimatedDurationMin: newVehicle.estimatedMinutes
          };
        }
        return d;
      });
    }

    updateState({
      vehicles: [newVehicle, ...vehicles],
      docks: updatedDocks,
      logs: [newLog, ...logs]
    });

    showToast(
      directDockId 
        ? `Veículo ${newVehicle.licensePlate} cadastrado e atracado na Doca ${directDockId}!`
        : `Veículo ${newVehicle.licensePlate} cadastrado na fila do pátio com sucesso.`,
      'success'
    );
  };

  // Handler: Designar Veículo a uma Doca
  const handleAssignDock = (vehicle: Vehicle, dockId: number) => {
    const nowIso = new Date().toISOString();
    const targetDock = docks.find(d => d.id === dockId);
    if (!targetDock) return;

    // Atualiza Doca
    const updatedDocks = docks.map(d => {
      if (d.id === dockId) {
        return {
          ...d,
          status: 'ocupada' as const,
          currentVehicleId: vehicle.id,
          operationStartTime: nowIso,
          estimatedDurationMin: vehicle.estimatedMinutes || 60
        };
      }
      return d;
    });

    // Atualiza Veículo
    const updatedVehicles = vehicles.map(v => {
      if (v.id === vehicle.id) {
        return {
          ...v,
          status: 'em_operacao' as const,
          assignedDockId: dockId,
          dockedTime: nowIso,
          operationStartTime: nowIso
        };
      }
      return v;
    });

    // Novo Log
    const newLog: MovementLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      action: 'docked',
      vehicleId: vehicle.id,
      licensePlate: vehicle.licensePlate,
      dockId,
      dockCode: targetDock.code,
      operator: 'Coordenação de Pátio',
      details: `Veículo ${vehicle.licensePlate} atracado e calçado na ${targetDock.code} (${targetDock.sectorName}).`
    };

    updateState({
      docks: updatedDocks,
      vehicles: updatedVehicles,
      logs: [newLog, ...logs]
    });

    showToast(`Veículo ${vehicle.licensePlate} atracado na ${targetDock.code}. Operação iniciada!`, 'success');
  };

  // Handler: Auto-Alocar Tudo na Fila
  const handleAutoDispatchAll = () => {
    const queue = vehicles.filter(v => v.status === 'aguardando_patio');
    if (queue.length === 0) {
      showToast('A fila de espera do pátio está vazia.', 'info');
      return;
    }

    let tempDocks = [...docks];
    let tempVehicles = [...vehicles];
    let newLogs: MovementLog[] = [];
    let allocatedCount = 0;
    const nowIso = new Date().toISOString();

    for (const veh of queue) {
      const { dock, reason } = logisticsEngine.findBestDockForVehicle(veh, tempDocks);
      if (dock) {
        allocatedCount++;
        // Atualiza doca temporária
        tempDocks = tempDocks.map(d => {
          if (d.id === dock.id) {
            return {
              ...d,
              status: 'ocupada' as const,
              currentVehicleId: veh.id,
              operationStartTime: nowIso,
              estimatedDurationMin: veh.estimatedMinutes || 60
            };
          }
          return d;
        });

        // Atualiza veículo temporário
        tempVehicles = tempVehicles.map(v => {
          if (v.id === veh.id) {
            return {
              ...v,
              status: 'em_operacao' as const,
              assignedDockId: dock.id,
              dockedTime: nowIso,
              operationStartTime: nowIso
            };
          }
          return v;
        });

        newLogs.push({
          id: `log-${Date.now()}-${allocatedCount}`,
          timestamp: nowIso,
          action: 'docked',
          vehicleId: veh.id,
          licensePlate: veh.licensePlate,
          dockId: dock.id,
          dockCode: dock.code,
          operator: 'DocaFlow Auto-Dispatch',
          details: `Auto-alocação otimizada: ${reason}`
        });
      }
    }

    if (allocatedCount > 0) {
      updateState({
        docks: tempDocks,
        vehicles: tempVehicles,
        logs: [...newLogs, ...logs]
      });
      showToast(`Auto-alocação concluída: ${allocatedCount} veículo(s) direcionados para docas livres!`, 'success');
    } else {
      showToast('Não foi possível alocar veículos: verifique a compatibilidade ou libere docas ocupadas.', 'warning');
    }
  };

  // Handler: Auto-Alocar Veículo Único
  const handleAutoAssignSingle = (vehicle: Vehicle) => {
    const { dock, reason } = logisticsEngine.findBestDockForVehicle(vehicle, docks);
    if (!dock) {
      showToast(`Não há doca compatível livre no momento para o veículo ${vehicle.licensePlate}.`, 'warning');
      return;
    }
    handleAssignDock(vehicle, dock.id);
  };

  // Handler: Iniciar Operação (de Reservada para Ocupada)
  const handleStartOperation = (dock: Dock) => {
    const nowIso = new Date().toISOString();
    const updatedDocks = docks.map(d => {
      if (d.id === dock.id) {
        return {
          ...d,
          status: 'ocupada' as const,
          operationStartTime: nowIso
        };
      }
      return d;
    });

    const updatedVehicles = vehicles.map(v => {
      if (v.id === dock.currentVehicleId) {
        return {
          ...v,
          status: 'em_operacao' as const,
          dockedTime: nowIso,
          operationStartTime: nowIso
        };
      }
      return v;
    });

    const newLog: MovementLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      action: 'started',
      dockId: dock.id,
      dockCode: dock.code,
      vehicleId: dock.currentVehicleId,
      licensePlate: vehicles.find(v => v.id === dock.currentVehicleId)?.licensePlate,
      operator: 'Operador de Doca',
      details: `Atracamento confirmado e conferência física iniciada na ${dock.code}.`
    };

    updateState({
      docks: updatedDocks,
      vehicles: updatedVehicles,
      logs: [newLog, ...logs]
    });

    showToast(`Operação iniciada na ${dock.code}!`, 'success');
  };

  // Handler: Finalizar Operação e Liberar Doca
  const handleCompleteOperation = (dock: Dock) => {
    const nowIso = new Date().toISOString();
    const vehicleId = dock.currentVehicleId;
    const vehicle = vehicles.find(v => v.id === vehicleId);

    const updatedDocks = docks.map(d => {
      if (d.id === dock.id) {
        return {
          ...d,
          status: 'disponivel' as const,
          currentVehicleId: undefined,
          operationStartTime: undefined
        };
      }
      return d;
    });

    const updatedVehicles = vehicles.map(v => {
      if (v.id === vehicleId) {
        return {
          ...v,
          status: 'liberado' as const,
          operationEndTime: nowIso,
          checkOutTime: nowIso
        };
      }
      return v;
    });

    const newLog: MovementLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      action: 'completed',
      dockId: dock.id,
      dockCode: dock.code,
      vehicleId,
      licensePlate: vehicle?.licensePlate,
      operator: 'Conferente Líder',
      details: `Operação concluída na ${dock.code}. Veículo ${vehicle?.licensePlate || ''} liberado para saída.`
    };

    updateState({
      docks: updatedDocks,
      vehicles: updatedVehicles,
      logs: [newLog, ...logs]
    });

    showToast(`Doca ${dock.code} liberada! Veículo ${vehicle?.licensePlate || ''} finalizado com sucesso.`, 'success');
  };

  // Handler: Alterar Interdição / Manutenção
  const handleUpdateMaintenance = (dockId: number, inMaintenance: boolean, reason?: string) => {
    const nowIso = new Date().toISOString();
    const targetDock = docks.find(d => d.id === dockId);

    const updatedDocks = docks.map(d => {
      if (d.id === dockId) {
        return {
          ...d,
          status: inMaintenance ? ('manutencao' as const) : ('disponivel' as const),
          maintenanceReason: inMaintenance ? (reason || 'Manutenção preventiva') : undefined,
          currentVehicleId: inMaintenance ? undefined : d.currentVehicleId
        };
      }
      return d;
    });

    const newLog: MovementLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      action: inMaintenance ? 'maintenance_start' : 'maintenance_end',
      dockId,
      dockCode: targetDock?.code,
      operator: 'Equipe de Engenharia e Manutenção',
      details: inMaintenance 
        ? `Interdição técnica na ${targetDock?.code}: ${reason || 'Manutenção preventiva'}`
        : `Interdição finalizada na ${targetDock?.code}. Doca liberada para operações.`
    };

    updateState({
      docks: updatedDocks,
      logs: [newLog, ...logs]
    });

    showToast(
      inMaintenance 
        ? `${targetDock?.code} interditada para manutenção.` 
        : `${targetDock?.code} liberada da manutenção com sucesso!`,
      inMaintenance ? 'warning' : 'success'
    );
  };

  // Handler: Ações rápidas dos Alertas de Gargalos / Sugestões
  const handleSuggestionAction = (actionType?: string, targetDockId?: number, targetVehicleId?: string) => {
    if (actionType === 'assign_auto') {
      handleAutoDispatchAll();
    } else if (actionType === 'call_maintenance' && targetDockId) {
      const d = docks.find(doc => doc.id === targetDockId);
      if (d) setSelectedDock(d);
    } else if (targetDockId) {
      const d = docks.find(doc => doc.id === targetDockId);
      if (d) setSelectedDock(d);
    } else {
      setActiveTab('docas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Barra de Navegação Superior */}
      <Navbar
        onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
        onAutoDispatchAll={handleAutoDispatchAll}
        onOpenPrintReport={() => setIsPrintReportOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        queueCount={queueCount}
        availableDocksCount={availableDocksCount}
        meta={meta}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 no-print">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-bold text-white ${
            toastMessage.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
            toastMessage.type === 'warning' ? 'bg-amber-600 border-amber-500' :
            'bg-blue-600 border-blue-500'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toastMessage.type === 'warning' && <AlertCircle className="w-5 h-5 shrink-0" />}
            {toastMessage.type === 'info' && <Zap className="w-5 h-5 shrink-0" />}
            <span>{toastMessage.text}</span>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Informativo de Resumo Operacional se houver Gargalo Crítico */}
        {bottlenecks.some(b => b.severity === 'alta') && activeTab === 'docas' && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2.5 text-rose-900 font-semibold">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                <strong>Atenção Operacional:</strong> {bottlenecks.find(b => b.severity === 'alta')?.title} — {bottlenecks.find(b => b.severity === 'alta')?.description}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('kpis')}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold shrink-0 transition-colors"
            >
              Ver Gargalos
            </button>
          </div>
        )}

        {/* Visualização da Aba Selecionada */}
        {activeTab === 'docas' && (
          <DockGrid
            docks={docks}
            vehicles={vehicles}
            onOpenDetails={(d) => setSelectedDock(d)}
            onQuickAssign={(d) => setSelectedDock(d)}
            onQuickComplete={handleCompleteOperation}
            onQuickStart={handleStartOperation}
            onToggleMaintenance={(d) => handleUpdateMaintenance(d.id, d.status !== 'manutencao')}
          />
        )}

        {activeTab === 'fila' && (
          <QueueManagement
            vehicles={vehicles}
            docks={docks}
            onOpenNewVehicle={() => setIsNewVehicleOpen(true)}
            onAssignDock={(veh, dockId) => handleAssignDock(veh, dockId)}
            onAutoAssignVehicle={handleAutoAssignSingle}
          />
        )}

        {activeTab === 'kpis' && (
          <KpiDashboard
            kpis={kpis}
            bottlenecks={bottlenecks}
            suggestions={suggestions}
            docks={docks}
            vehicles={vehicles}
            onActionClick={handleSuggestionAction}
          />
        )}

        {activeTab === 'historico' && (
          <MovementsTable logs={logs} />
        )}
      </main>

      {/* Footer Simples */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DocaFlow YMS • Sistema Integrado de Gestão de Pátio e 14 Docas Operacionais</span>
          <button
            onClick={() => setIsArchitectureOpen(true)}
            className="text-blue-600 font-semibold hover:underline"
          >
            Ver Dossiê de Arquitetura & Persistência
          </button>
        </div>
      </footer>

      {/* Modais */}
      <NewVehicleModal
        isOpen={isNewVehicleOpen}
        onClose={() => setIsNewVehicleOpen(false)}
        onSave={handleSaveVehicle}
        docks={docks}
      />

      <DockDetailModal
        dock={selectedDock}
        vehicle={selectedDock?.currentVehicleId ? vehicles.find(v => v.id === selectedDock.currentVehicleId) : undefined}
        queueVehicles={vehicles.filter(v => v.status === 'aguardando_patio')}
        onClose={() => setSelectedDock(null)}
        onAssignVehicle={(dockId, vehId) => {
          const v = vehicles.find(veh => veh.id === vehId);
          if (v) handleAssignDock(v, dockId);
        }}
        onStartOperation={handleStartOperation}
        onCompleteOperation={handleCompleteOperation}
        onUpdateMaintenance={handleUpdateMaintenance}
      />

      <PrintableReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        docks={docks}
        vehicles={vehicles}
        kpis={kpis}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        currentState={appState}
        onStateRestored={(newState) => setAppState(newState)}
      />
    </div>
  );
}
