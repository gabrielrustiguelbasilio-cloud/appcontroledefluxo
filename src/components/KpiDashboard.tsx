import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Clock, 
  Layers, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Snowflake, 
  Zap,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { LogisticsKPIs, BottleneckAlert, LogisticsSuggestion, Dock, Vehicle } from '../types/logistics';

interface KpiDashboardProps {
  kpis: LogisticsKPIs;
  bottlenecks: BottleneckAlert[];
  suggestions: LogisticsSuggestion[];
  docks: Dock[];
  vehicles: Vehicle[];
  onActionClick?: (actionType?: string, targetDockId?: number, targetVehicleId?: string) => void;
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({
  kpis,
  bottlenecks,
  suggestions,
  docks,
  vehicles,
  onActionClick
}) => {
  // Dados para o Gráfico de Ocupação por Setor
  const sectorData = [
    {
      name: 'Recebimento (01-04)',
      ocupadas: docks.filter(d => d.sector === 'recebimento_geral' && d.status === 'ocupada').length,
      livres: docks.filter(d => d.sector === 'recebimento_geral' && d.status === 'disponivel').length,
      total: 4
    },
    {
      name: 'Cadeia Fria (05-07)',
      ocupadas: docks.filter(d => d.sector === 'cadeia_frio' && d.status === 'ocupada').length,
      livres: docks.filter(d => d.sector === 'cadeia_frio' && d.status === 'disponivel').length,
      total: 3
    },
    {
      name: 'Crossdock (08-10)',
      ocupadas: docks.filter(d => d.sector === 'expedicao_crossdock' && d.status === 'ocupada').length,
      livres: docks.filter(d => d.sector === 'expedicao_crossdock' && d.status === 'disponivel').length,
      total: 3
    },
    {
      name: 'Expedição Pesada (11-14)',
      ocupadas: docks.filter(d => d.sector === 'expedicao_pesada' && d.status === 'ocupada').length,
      livres: docks.filter(d => d.sector === 'expedicao_pesada' && d.status === 'disponivel').length,
      total: 4
    },
  ];

  // Dados para o Gráfico de Status das 14 Docas (Pizza)
  const pieData = [
    { name: 'Disponíveis', value: kpis.availableDocks, color: '#10b981' },
    { name: 'Em Operação', value: kpis.occupiedDocks, color: '#2563eb' },
    { name: 'Reservadas/Trânsito', value: kpis.reservedDocks, color: '#f59e0b' },
    { name: 'Manutenção', value: kpis.maintenanceDocks, color: '#64748b' },
  ].filter(d => d.value > 0);

  // Simulação de Throughput por hora do turno
  const throughputData = [
    { hora: '07:00', concluidos: 1, entradas: 3 },
    { hora: '08:00', concluidos: 2, entradas: 4 },
    { hora: '09:00', concluidos: 3, entradas: 5 },
    { hora: '10:00', concluidos: 4, entradas: 2 },
    { hora: '11:00 (Atual)', concluidos: kpis.vehiclesCompletedToday, entradas: kpis.vehiclesInYard + kpis.vehiclesInOperation },
  ];

  return (
    <div className="space-y-6">
      {/* 1. KPIs Executivos Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Taxa de Ocupação */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Taxa de Ocupação
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {kpis.occupancyRatePct}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({kpis.occupiedDocks} de {14 - kpis.maintenanceDocks} ativas)
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-2 h-2 rounded-full ${kpis.occupancyRatePct > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            <span>Meta operacional: 70% a 85%</span>
          </div>
        </div>

        {/* Card 2: Tempo Médio de Permanência (Dwell Time) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Permanência em Doca
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {kpis.avgDwellTimeMin} <span className="text-sm font-semibold">min</span>
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
              SLA {kpis.slaCompliancePct}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Meta: &le; 60 min (carga seca) / &le; 75 min (frio)
          </div>
        </div>

        {/* Card 3: Tempo Médio de Espera no Pátio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Espera no Pátio (Fila)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${kpis.avgYardWaitTimeMin > 25 ? 'text-amber-600' : 'text-slate-900'}`}>
              {kpis.avgYardWaitTimeMin} <span className="text-sm font-semibold">min</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({kpis.vehiclesInYard} na fila)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            {kpis.avgYardWaitTimeMin > 25 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Fila elevada
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Fluidez normal
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Throughput & Finalizados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Throughput
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {kpis.throughputPerHour}
            </span>
            <span className="text-xs font-semibold text-slate-500">veículos/hora</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Total hoje: <span className="font-bold text-slate-800">{kpis.vehiclesCompletedToday} atendimentos</span>
          </div>
        </div>
      </div>

      {/* 2. Seção de Gargalos Operacionais Identificados (Resolução Ativa) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Gargalos Operacionais Identificados em Tempo Real
              </h3>
              <p className="text-xs text-slate-500">
                Detecção proativa de retenções de pátio, desvios de SLA e sobrecargas de docas
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-100 text-rose-800 border border-rose-200">
            {bottlenecks.length} ocorrência(s)
          </span>
        </div>

        {bottlenecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {bottlenecks.map(b => (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 ${
                  b.severity === 'alta'
                    ? 'bg-rose-50/40 border-rose-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${b.severity === 'alta' ? 'text-rose-600' : 'text-amber-600'}`} />
                      {b.title}
                    </span>
                    {b.metricValue && (
                      <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 shadow-2xs">
                        {b.metricValue}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {b.description}
                  </p>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-700 font-medium">
                    <span className="font-bold text-slate-900">Ação Recomendada: </span>
                    {b.suggestedAction}
                  </div>
                  {onActionClick && (
                    <button
                      onClick={() => onActionClick('auto_resolve', b.dockId, b.vehicleId)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-bold shrink-0 transition-colors"
                    >
                      Agir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Nenhum gargalo crítico detectado no pátio neste momento. Fluxo de veículos e docas operando com conformidade.</span>
          </div>
        )}
      </div>

      {/* 3. Gráficos Interativos (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico 1: Ocupação por Setor Logístico */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Distribuição de Ocupação por Setor
            </h4>
            <span className="text-xs text-slate-500 font-medium">14 Docas Totais</span>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ocupadas" name="Docas Ocupadas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="livres" name="Docas Livres" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Fluxo e Throughput por Hora */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
              Throughput & Chegadas por Hora
            </h4>
            <span className="text-xs text-slate-500 font-medium">Turno Vigente</span>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="entradas" name="Veículos em Pátio/Entradas" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="concluidos" name="Atendimentos Concluídos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Painel de Boas Práticas & Sugestões Contextuais */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Boas Práticas e Recomendações Logísticas Contextuais
            </h3>
            <p className="text-xs text-slate-500">
              Algoritmo de inteligência operacional que sugere realocações, janelas e escalonamento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map(s => (
            <div 
              key={s.id} 
              className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                s.severity === 'critical' ? 'bg-rose-50/50 border-rose-200' :
                s.severity === 'warning' ? 'bg-amber-50/50 border-amber-200' :
                s.severity === 'success' ? 'bg-emerald-50/50 border-emerald-200' :
                'bg-blue-50/50 border-blue-200'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-slate-900 block mb-1">
                  {s.title}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.message}
                </p>
              </div>

              {s.actionLabel && onActionClick && (
                <div className="pt-2 border-t border-slate-200/50 flex justify-end">
                  <button
                    onClick={() => onActionClick(s.actionType, s.targetDockId, s.targetVehicleId)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>{s.actionLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
