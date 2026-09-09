import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Snowflake, 
  FileText, 
  User, 
  Zap, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Phone 
} from 'lucide-react';
import { Vehicle, VehicleType, CargoType, OperationType, VehiclePriority, Dock } from '../types/logistics';
import { logisticsEngine } from '../utils/logisticsEngine';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Partial<Vehicle>, directDockId?: number) => void;
  docks: Dock[];
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  docks
}) => {
  if (!isOpen) return null;

  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [carrier, setCarrier] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('truck');
  const [cargoType, setCargoType] = useState<CargoType>('seca');
  const [operationType, setOperationType] = useState<OperationType>('descarga');
  const [invoiceNumbers, setInvoiceNumbers] = useState('');
  const [priority, setPriority] = useState<VehiclePriority>('normal');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [notes, setNotes] = useState('');

  // Sugestão em tempo real
  const tempVehicle: Vehicle = {
    id: 'temp',
    licensePlate: licensePlate || 'ABC-1234',
    driverName: driverName || 'Motorista',
    carrier: carrier || 'Transportadora',
    vehicleType,
    cargoType,
    operationType,
    invoiceNumbers,
    priority,
    checkInTime: new Date().toISOString(),
    status: 'aguardando_patio'
  };

  const recommendation = logisticsEngine.findBestDockForVehicle(tempVehicle, docks);

  const handleSubmit = (directDock: boolean = false) => {
    if (!licensePlate.trim()) {
      alert('Por favor, informe a placa do veículo.');
      return;
    }
    if (!driverName.trim()) {
      alert('Por favor, informe o nome do motorista.');
      return;
    }

    const payload: Partial<Vehicle> = {
      licensePlate: licensePlate.toUpperCase().trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      carrier: carrier.trim() || 'Frota Terceirizada',
      vehicleType,
      cargoType,
      operationType,
      invoiceNumbers: invoiceNumbers.trim() || 'NF pendente',
      priority,
      estimatedMinutes: Number(estimatedMinutes) || 60,
      notes: notes.trim(),
      checkInTime: new Date().toISOString(),
      status: 'aguardando_patio'
    };

    onSave(payload, directDock && recommendation.dock ? recommendation.dock.id : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Check-in de Portaria & Guarita
              </h3>
              <p className="text-xs text-slate-500">
                Registro rápido de chegada de veículos para controle e alocação de docas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Linha 1: Placa, Motorista, Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Placa do Veículo *
              </label>
              <input
                type="text"
                placeholder="Ex: BRA2E19"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm uppercase bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={8}
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nome do Motorista *
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Celular / WhatsApp (Chamada)
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Linha 2: Transportadora e NFs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Transportadora / Frota
              </label>
              <input
                type="text"
                placeholder="Ex: Jamef, Braspress, Frota Própria"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Notas Fiscais / CT-e
              </label>
              <input
                type="text"
                placeholder="Ex: NF 102.441 / CT-e 9912"
                value={invoiceNumbers}
                onChange={(e) => setInvoiceNumbers(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Linha 3: Tipo de Veículo (Touch Pills) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Tipo de Veículo
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['van', 'vuc', 'toco', 'truck', 'carreta', 'bitrem'] as VehicleType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleType(type)}
                  className={`py-2 px-2 rounded-lg font-bold uppercase text-[11px] border transition-all text-center ${
                    vehicleType === type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Linha 4: Tipo de Carga e Tipo de Operação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tipo de Carga
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'seca', label: 'Carga Seca' },
                  { id: 'refrigerada', label: 'Refrigerada / Frio', icon: Snowflake },
                  { id: 'expressa', label: 'Expressa / E-com' },
                  { id: 'perigosa', label: 'Química / Perigosa' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCargoType(c.id as CargoType)}
                    className={`p-2 rounded-lg font-semibold text-xs border text-left flex items-center justify-between ${
                      cargoType === c.id
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c.label}</span>
                    {c.icon && <c.icon className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tipo de Operação
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'descarga', label: 'Descarga (Inbound / Fornecedor)', desc: 'Descarregar no depósito' },
                  { id: 'carregamento', label: 'Carregamento (Outbound / Expedição)', desc: 'Coleta de carga' },
                  { id: 'crossdocking', label: 'Cross-docking Rápido', desc: 'Transferência direta entre veículos' },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperationType(op.id as OperationType)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      operationType === op.id
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold text-xs">{op.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{op.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Linha 5: Prioridade e Tempo Estimado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nível de Prioridade
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'normal', label: 'Normal', color: 'text-slate-700' },
                  { id: 'alta', label: 'Alta', color: 'text-amber-700' },
                  { id: 'urgente', label: 'Urgente', color: 'text-rose-700' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as VehiclePriority)}
                    className={`flex-1 py-1.5 rounded-lg border font-bold text-xs uppercase ${
                      priority === p.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tempo Estimado em Doca (minutos)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={15}
                  max={360}
                  step={15}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-xs text-slate-500">
                  (Padrão: 60 min para truck / 90 min carreta)
                </span>
              </div>
            </div>
          </div>

          {/* Doca Recomendada em Tempo Real */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-start gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  Recomendação do Sistema de Otimização:
                </span>
                {recommendation.dock && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-xs">
                    {recommendation.dock.code}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {recommendation.reason}
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé e Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              Salvar na Fila do Pátio
            </button>

            {recommendation.dock && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Salvar & Atracar na {recommendation.dock.code}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
