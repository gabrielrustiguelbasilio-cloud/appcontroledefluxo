import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  CheckCheck, 
  LogOut,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { MovementLog } from '../types/logistics';

interface MovementsTableProps {
  logs: MovementLog[];
}

export const MovementsTable: React.FC<MovementsTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.licensePlate && log.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.dockCode && log.dockCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.operator && log.operator.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Exportar logs como CSV
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Acao', 'Doca', 'Placa', 'Operador', 'Detalhes'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}"`,
      `"${l.action}"`,
      `"${l.dockCode || 'N/A'}"`,
      `"${l.licensePlate || 'N/A'}"`,
      `"${l.operator}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `docaflow_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getActionBadge = (action: MovementLog['action']) => {
    switch (action) {
      case 'checkin':
        return { label: 'Check-in Portaria', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Truck };
      case 'assigned':
        return { label: 'Doca Atribuída', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: ArrowRight };
      case 'docked':
        return { label: 'Atracado em Doca', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: Play };
      case 'started':
        return { label: 'Operação Iniciada', color: 'bg-cyan-50 text-cyan-800 border-cyan-200', icon: Clock };
      case 'completed':
        return { label: 'Operação Concluída', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCheck };
      case 'checkout':
        return { label: 'Check-out Liberado', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: LogOut };
      case 'maintenance_start':
        return { label: 'Início Manutenção', color: 'bg-rose-50 text-rose-800 border-rose-200', icon: Wrench };
      case 'maintenance_end':
        return { label: 'Fim Manutenção', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 };
      default:
        return { label: action, color: 'bg-slate-100 text-slate-800 border-slate-200', icon: Clock };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Trilha de Auditoria & Registro de Movimentações (Logs)
          </h3>
          <p className="text-xs text-slate-500">
            Histórico cronológico auditável de entradas, atracamentos, trocas de status e saídas
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Exportar Planilha (CSV)</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar nos logs por placa, doca, operador ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          aria-label="Filtrar por tipo de ação"
          className="w-full sm:w-auto text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as Ações</option>
          <option value="checkin">Check-in Portaria</option>
          <option value="assigned">Doca Atribuída</option>
          <option value="docked">Atracado em Doca</option>
          <option value="started">Operação Iniciada</option>
          <option value="completed">Operação Concluída</option>
          <option value="checkout">Check-out Liberado</option>
          <option value="maintenance_start">Manutenção</option>
        </select>
      </div>

      {/* Tabela de Logs */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Horário</th>
              <th className="py-2.5 px-3">Ação</th>
              <th className="py-2.5 px-3">Doca</th>
              <th className="py-2.5 px-3">Placa Veículo</th>
              <th className="py-2.5 px-3">Responsável</th>
              <th className="py-2.5 px-3">Detalhamento Operacional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredLogs.map(log => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              return (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.dockCode || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {log.licensePlate ? (
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {log.licensePlate}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                    {log.operator}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-md">
                    {log.details}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-xs">
          Nenhum registro de log encontrado para os filtros selecionados.
        </div>
      )}
    </div>
  );
};
