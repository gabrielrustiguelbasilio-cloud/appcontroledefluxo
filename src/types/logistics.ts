export type DockStatus = 'disponivel' | 'ocupada' | 'manutencao' | 'reservada';

export type DockSector = 
  | 'recebimento_geral'    // Docas 01 a 04
  | 'cadeia_frio'          // Docas 05 a 07 (Refrigerados/Perecíveis)
  | 'expedicao_crossdock'  // Docas 08 a 10 (Cross-docking rápido)
  | 'expedicao_pesada';    // Docas 11 a 14 (Linha Longa Distância)

export type VehicleType = 'van' | 'vuc' | 'toco' | 'truck' | 'carreta' | 'bitrem';

export type CargoType = 'seca' | 'refrigerada' | 'expressa' | 'perigosa' | 'geral';

export type OperationType = 'descarga' | 'carregamento' | 'crossdocking';

export type VehiclePriority = 'normal' | 'alta' | 'urgente';

export type VehicleStatus = 
  | 'aguardando_patio' // No pátio esperando doca
  | 'em_transito_doca' // Chamado, manobrando para a doca
  | 'em_operacao'      // Atracado, carregando/descarregando
  | 'concluido'        // Operação finalizada, aguardando saída
  | 'liberado';        // Check-out concluído na portaria

export interface Vehicle {
  id: string;
  licensePlate: string;        // Placa (ex: BRA2E19)
  driverName: string;          // Nome do motorista
  driverPhone?: string;        // WhatsApp/Telefone para chamada
  carrier: string;             // Transportadora / Frota
  vehicleType: VehicleType;    // Tipo de veículo
  cargoType: CargoType;        // Tipo de carga
  operationType: OperationType;// Operação
  invoiceNumbers: string;      // NFs / CT-e
  priority: VehiclePriority;   // Prioridade
  notes?: string;              // Observações da guarita
  
  // Timestamps (ISO Strings)
  checkInTime: string;         // Chegada na portaria
  dockedTime?: string;         // Atracou na doca
  operationStartTime?: string; // Início do serviço
  operationEndTime?: string;   // Fim do serviço
  checkOutTime?: string;       // Saída na portaria
  
  status: VehicleStatus;
  assignedDockId?: number;     // ID da doca (1 a 14)
  estimatedMinutes?: number;   // Tempo estimado de operação
}

export interface Dock {
  id: number;                  // 1 a 14
  code: string;                // "DOCA-01" a "DOCA-14"
  name: string;
  sector: DockSector;
  sectorName: string;
  status: DockStatus;
  isColdChain: boolean;        // Tem vedação térmica/câmara fria
  hasHydraulicLeveler: boolean;// Niveladora hidráulica embutida
  allowedVehicles: VehicleType[];
  currentVehicleId?: string;
  currentVehicle?: Vehicle;
  operationStartTime?: string;
  estimatedDurationMin?: number;
  maintenanceReason?: string;
  notes?: string;
}

export interface MovementLog {
  id: string;
  timestamp: string;
  action: 'checkin' | 'assigned' | 'docked' | 'started' | 'completed' | 'checkout' | 'maintenance_start' | 'maintenance_end';
  dockId?: number;
  dockCode?: string;
  vehicleId?: string;
  licensePlate?: string;
  operator: string;
  details: string;
}

export interface BottleneckAlert {
  id: string;
  type: 'tempo_excedido' | 'fila_alta' | 'doca_ociosa' | 'frio_sobrecarregado' | 'manutencao_critica';
  severity: 'alta' | 'media' | 'baixa';
  title: string;
  description: string;
  suggestedAction: string;
  dockId?: number;
  vehicleId?: string;
  metricValue?: string;
}

export interface LogisticsKPIs {
  totalDocks: number;
  availableDocks: number;
  occupiedDocks: number;
  maintenanceDocks: number;
  reservedDocks: number;
  occupancyRatePct: number;
  vehiclesInYard: number;
  vehiclesInOperation: number;
  vehiclesCompletedToday: number;
  avgDwellTimeMin: number;       // Tempo médio de permanência em doca
  avgYardWaitTimeMin: number;    // Tempo médio de espera no pátio
  throughputPerHour: number;     // Caminhões finalizados por hora
  slaCompliancePct: number;      // % operações dentro do tempo estimado
  coldChainOccupancyPct: number; // Ocupação específica do setor frio
}

export interface LogisticsSuggestion {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  category: 'alocacao' | 'produtividade' | 'gargalo' | 'manutencao';
  actionType?: 'assign_auto' | 'release_dock' | 'extend_hours' | 'call_maintenance';
  actionLabel?: string;
  targetDockId?: number;
  targetVehicleId?: string;
}

export type StorageProvider = 'local' | 'vercel_blob' | 'google_drive';

export interface StorageStateMeta {
  provider: StorageProvider;
  lastSavedAt: string;
  version: number;
  cloudSyncStatus: 'synced' | 'pending' | 'offline' | 'error';
  backupCount: number;
  vercelBlobTokenConfigured: boolean;
}
