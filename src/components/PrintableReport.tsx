import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Truck, 
  TrendingUp, 
  Download 
} from 'lucide-react';
import { Dock, Vehicle, LogisticsKPIs } from '../types/logistics';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  docks: Dock[];
  vehicles: Vehicle[];
  kpis: LogisticsKPIs;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  docks,
  vehicles,
  kpis
}) => {
  if (!isOpen) return null;

  const [period, setPeriod] = useState<'diario' | 'semanal' | 'mensal'>('diario');
  const emitDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  // Filtragem de veículos para o relatório
  const reportVehicles = vehicles.filter(v => v.status === 'liberado' || v.status === 'em_operacao');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-2 sm:p-6 flex justify-center items-start">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-4 overflow-hidden border border-slate-300">
        {/* Barra de Controle de Impressão (Ocultada na impressão) */}
        <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Visualizador de Relatório Operacional</h3>
              <p className="text-xs text-slate-400">Pronto para impressão direta ou exportação em PDF (A4)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Período */}
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setPeriod('diario')}
                className={`px-3 py-1 rounded font-semibold ${
                  period === 'diario' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Diário
              </button>
              <button
                onClick={() => setPeriod('semanal')}
                className={`px-3 py-1 rounded font-semibold ${
                  period === 'semanal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setPeriod('mensal')}
                className={`px-3 py-1 rounded font-semibold ${
                  period === 'mensal' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Mensal
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Estruturado (O que sai na folha A4) */}
        <div id="print-content" className="p-6 sm:p-8 text-slate-900 bg-white space-y-6">
          {/* Cabeçalho Corporativo Oficial */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">DOCAFLOW LOGÍSTICA</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                  YMS CD-01
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Centro de Distribuição & Cross-docking Integrado • 14 Docas Operacionais
              </p>
              <p className="text-[11px] text-slate-500">
                Rodovia dos Bandeirantes, km 72 - Distrito Industrial Logístico
              </p>
            </div>

            <div className="text-right text-xs text-slate-600 font-medium">
              <div className="font-bold text-slate-900 uppercase text-sm">
                RELATÓRIO {period.toUpperCase()} DE GESTÃO DE DOCAS
              </div>
              <div>Data de Emissão: <span className="font-mono font-semibold text-slate-800">{emitDate}</span></div>
              <div>Turno: <span className="font-semibold text-slate-800">Geral Operacional</span></div>
            </div>
          </div>

          {/* Sumário Executivo de Indicadores (KPIs) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Indicadores de Desempenho Operacional (KPIs Consolidados)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Taxa de Ocupação Média</span>
                <span className="text-xl font-bold font-mono text-slate-900">{kpis.occupancyRatePct}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Capacidade 14 posições</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Permanência Média (Dwell)</span>
                <span className="text-xl font-bold font-mono text-slate-900">{kpis.avgDwellTimeMin} min</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Meta SLA: &le; 60 min</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Espera no Pátio</span>
                <span className="text-xl font-bold font-mono text-slate-900">{kpis.avgYardWaitTimeMin} min</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fila atual: {kpis.vehiclesInYard} carretas</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-500 font-semibold block">Conformidade SLA</span>
                <span className="text-xl font-bold font-mono text-slate-900">{kpis.slaCompliancePct}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Throughput: {kpis.throughputPerHour}/h</span>
              </div>
            </div>
          </div>

          {/* Status Detalhado das 14 Docas */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              2. Matriz Operacional das 14 Docas
            </h4>

            <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Doca</th>
                  <th className="p-2">Setor Funcional</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Equipamentos</th>
                  <th className="p-2">Veículo Atual / Alocado</th>
                  <th className="p-2">Tempo Operação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {docks.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-slate-900">{d.code}</td>
                    <td className="p-2 text-slate-700">{d.sectorName}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        d.status === 'disponivel' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'ocupada' ? 'bg-blue-100 text-blue-800' :
                        d.status === 'reservada' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-2 text-[11px] text-slate-600">
                      {d.isColdChain ? '❄️ Frio ' : ''}
                      {d.hasHydraulicLeveler ? '⚙️ Niveladora' : 'Padrão'}
                    </td>
                    <td className="p-2 font-mono">
                      {d.currentVehicleId ? (
                        <span className="font-bold text-slate-900">{d.currentVehicleId}</span>
                      ) : (
                        <span className="text-slate-400">Livre</span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-slate-600">
                      {d.status === 'ocupada' && d.operationStartTime ? (
                        `${Math.round((Date.now() - new Date(d.operationStartTime).getTime()) / (60 * 1000))} min`
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Relação de Veículos e Cargas Atendidas */}
          <div className="space-y-2 break-inside-avoid">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              3. Relação de Veículos e Cargas Registradas no Período
            </h4>

            <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Placa</th>
                  <th className="p-2">Motorista</th>
                  <th className="p-2">Transportadora</th>
                  <th className="p-2">Operação</th>
                  <th className="p-2">Tipo Carga</th>
                  <th className="p-2">Notas Fiscais</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportVehicles.map(v => (
                  <tr key={v.id}>
                    <td className="p-2 font-mono font-bold text-slate-900">{v.licensePlate}</td>
                    <td className="p-2 text-slate-800">{v.driverName}</td>
                    <td className="p-2 text-slate-600">{v.carrier}</td>
                    <td className="p-2 capitalize text-slate-700">{v.operationType}</td>
                    <td className="p-2 capitalize text-slate-700">{v.cargoType}</td>
                    <td className="p-2 font-mono text-[11px] text-slate-600">{v.invoiceNumbers}</td>
                    <td className="p-2">
                      <span className="font-bold uppercase text-[10px] text-slate-700">
                        {v.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recomendações e Assinaturas */}
          <div className="pt-4 border-t border-slate-200 break-inside-avoid space-y-8">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Observações do Encarregado de Pátio:</span>
              Operação decorreu dentro da normalidade operacional. As docas 05 e 06 mantiveram estrita conformidade térmica para frios. A Doca 12 aguarda conclusão de manutenção preventiva na bomba hidráulica.
            </div>

            {/* Linhas de Assinatura */}
            <div className="grid grid-cols-2 gap-12 pt-6">
              <div className="border-t border-slate-400 text-center pt-2">
                <span className="text-xs font-bold text-slate-800 block">Supervisor de Pátio & Docas</span>
                <span className="text-[11px] text-slate-500">Matrícula Operacional: OP-4491</span>
              </div>

              <div className="border-t border-slate-400 text-center pt-2">
                <span className="text-xs font-bold text-slate-800 block">Gerente de Logística e Transportes</span>
                <span className="text-[11px] text-slate-500">Coordenação de Centro de Distribuição</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
