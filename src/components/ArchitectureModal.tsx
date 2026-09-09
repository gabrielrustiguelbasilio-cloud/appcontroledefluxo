import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Layers, 
  Database, 
  Zap, 
  Clock, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck,
  Code,
  ArrowRight
} from 'lucide-react';
import { AppState, storageService } from '../services/storageService';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onStateRestored: (newState: AppState) => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onStateRestored
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'stack' | 'schema' | 'mvp' | 'kpis' | 'persistencia' | 'roadmap'>('stack');
  const [blobTokenInput, setBlobTokenInput] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Manipuladores de persistência
  const handleExportBackup = () => {
    storageService.exportToJson(currentState);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const imported = storageService.importFromJson(content);
      if (imported) {
        onStateRestored(imported);
        setSyncSuccessMsg('Backup restaurado com sucesso!');
        setTimeout(() => setSyncSuccessMsg(null), 4000);
      } else {
        alert('Erro ao processar arquivo de backup. Verifique se o JSON é válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar os dados de demonstração padrão com as 14 docas e carretas?')) {
      const reset = storageService.resetDefaults();
      onStateRestored(reset);
      setSyncSuccessMsg('Dados de demonstração restaurados com sucesso!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden my-auto">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Dossiê de Arquitetura de Software & Especificação Técnica
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  DOCUMENTO TÉCNICO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema Integrado de Gestão de Pátio e Docas (DocaFlow YMS) para Transportadoras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação do Dossiê */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 flex gap-1 overflow-x-auto text-xs">
          {[
            { id: 'stack', label: '1. Arquitetura Técnica & Stack' },
            { id: 'schema', label: '2. Schema de Dados' },
            { id: 'mvp', label: '3. Escopo MVP' },
            { id: 'kpis', label: '4. KPIs & Otimização' },
            { id: 'persistencia', label: '5. Google Drive vs Vercel Blob' },
            { id: 'roadmap', label: '6. Roteiro (4 Sprints)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mensagem de Feedback */}
        {syncSuccessMsg && (
          <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {syncSuccessMsg}
            </span>
            <button onClick={() => setSyncSuccessMsg(null)}>✕</button>
          </div>
        )}

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-5 sm:p-7 overflow-y-auto text-slate-800 text-xs leading-relaxed space-y-6 flex-1">
          {/* TAB 1: STACK TECNOLÓGICA */}
          {activeTab === 'stack' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                1. Arquitetura Técnica Recomendada para Ambientes Críticos de Transportadora
              </h4>
              <p className="text-slate-600">
                Sistemas operacionais de depósito (Yard Management Systems - YMS) exigem <strong>alta disponibilidade</strong>, <strong>latência inferior a 100ms</strong> na guarita e <strong>tolerância a falhas de rede</strong> no piso do armazém. A arquitetura recomendada combina um cliente SPA resiliente e offline-first com microserviços em Node.js/TypeScript:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Frontend & PWA
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>React 19 + TypeScript</strong>: Interfaces declarativas e tipagem rigorosa de eventos logísticos.</li>
                    <li>• <strong>Tailwind CSS 4</strong>: Design atômico de alto contraste para tablets em iluminação de pátio.</li>
                    <li>• <strong>Recharts</strong>: Gráficos de ocupação e throughput em SVG renderizados no cliente.</li>
                    <li>• <strong>Lucide React</strong>: Biblioteca de ícones operacionais unificada.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-indigo-600" />
                    Camada de Aplicação (API)
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Node.js + Express / Next.js Edge</strong>: Processamento assíncrono de regras de despacho.</li>
                    <li>• <strong>Motor Heurístico de Despacho</strong>: Algoritmo guloso ponderado por setor e cadeia térmica.</li>
                    <li>• <strong>Motor de Auditoria</strong>: Log imutável de eventos (check-in, atracamento, checkout).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    Persistência Híbrida
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600">
                    <li>• <strong>Cache Local L1 (IndexedDB/LocalStorage)</strong>: Recuperação instantânea sem perda de sessão.</li>
                    <li>• <strong>Storage Nuvem L2 (Vercel Blob / S3)</strong>: Snapshots de estado e fotos de canhotos com token direto.</li>
                    <li>• <strong>Exportador Executivo (JSON/CSV)</strong>: Relatórios para integração com ERP / WMS / TMS.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA DE DADOS */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                2. Schema de Dados Normalizado (Docas, Veículos, Movimentações e Logs)
              </h4>
              <p className="text-slate-600">
                Modelo estruturado para garantia de integridade relacional, rastreabilidade fiscal e cálculo de SLAs operacionais:
              </p>

              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto space-y-3">
                <div className="text-blue-400 font-bold">// 1. Tabela/Coleção: DOCKS (14 Posições Físicas)</div>
                <div>{`interface Dock {
  id: number;                   // Chave primária (1 a 14)
  code: string;                 // 'DOCA-01' a 'DOCA-14'
  name: string;                 // 'Doca 01 - Inbound Pesado'
  sector: 'recebimento_geral' | 'cadeia_frio' | 'expedicao_crossdock' | 'expedicao_pesada';
  status: 'disponivel' | 'ocupada' | 'manutencao' | 'reservada';
  isColdChain: boolean;         // Doca com duto de refrigeração vedado (Docas 05 a 07)
  hasHydraulicLeveler: boolean; // Niveladora embutida para calçamento seguro
  allowedVehicles: ('van' | 'vuc' | 'toco' | 'truck' | 'carreta' | 'bitrem')[];
  currentVehicleId?: string;    // FK -> Vehicle.id
  operationStartTime?: string;  // ISO timestamp
  estimatedDurationMin?: number;// SLA padrão (ex: 60 ou 90 min)
  maintenanceReason?: string;   // Laudo técnico de interdição
}`}</div>

                <div className="text-blue-400 font-bold pt-2">// 2. Tabela/Coleção: VEHICLES (Veículos e Cargas)</div>
                <div>{`interface Vehicle {
  id: string;                   // UUID v4
  licensePlate: string;         // Placa Mercosul (ex: BRA2E19) - Índice Único Ativo
  driverName: string;           // Nome civil do motorista
  driverPhone?: string;         // Telefone para chamada via SMS/WhatsApp
  carrier: string;              // Razão social da transportadora / frota
  vehicleType: VehicleType;     // Tipo de porte físico
  cargoType: 'seca' | 'refrigerada' | 'expressa' | 'perigosa' | 'geral';
  operationType: 'descarga' | 'carregamento' | 'crossdocking';
  invoiceNumbers: string;       // NFs ou CT-e associados para conferência cega
  priority: 'normal' | 'alta' | 'urgente';
  status: 'aguardando_patio' | 'em_transito_doca' | 'em_operacao' | 'concluido' | 'liberado';
  checkInTime: string;          // Timestamp chegada na portaria
  dockedTime?: string;          // Timestamp atracamento físico
  operationStartTime?: string;  // Timestamp início de descarga/carga
  operationEndTime?: string;    // Timestamp término de descarga/carga
  checkOutTime?: string;        // Timestamp liberação na guarita de saída
}`}</div>

                <div className="text-blue-400 font-bold pt-2">// 3. Tabela/Coleção: MOVEMENT_LOGS (Trilha de Auditoria Imutável)</div>
                <div>{`interface MovementLog {
  id: string;                   // UUID
  timestamp: string;            // ISO UTC
  action: 'checkin' | 'assigned' | 'docked' | 'started' | 'completed' | 'checkout' | 'maintenance';
  dockId?: number;
  vehicleId?: string;
  operator: string;             // Matrícula/Nome do operador responsável
  details: string;              // Descrição circunstanciada do evento
}`}</div>
              </div>
            </div>
          )}

          {/* TAB 3: ESCOPO MVP */}
          {activeTab === 'mvp' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                3. Matriz de Priorização de Funcionalidades para MVP (Escopo Essencial)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Must Have (Essencial para Go-Live - 100% Implementado no App)
                  </span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li>✅ <strong>Grid Visual das 14 Docas</strong> com atualização de status em tempo real.</li>
                    <li>✅ <strong>Registro Rápido de Portaria (Check-in)</strong> com placa, NFs e motorista.</li>
                    <li>✅ <strong>Fila de Pátio Ordenada por Prioridade</strong> com controle de tempo de espera.</li>
                    <li>✅ <strong>Algoritmo de Auto-Alocação</strong> considerando tipo de veículo e cadeia de frio.</li>
                    <li>✅ <strong>Detecção Automática de Estouro de SLA</strong> com cronômetro visual em doca.</li>
                    <li>✅ <strong>Exportação & Impressão de Relatórios Estruturados A4</strong>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Should Have & Could Have (Próximas Fases)
                  </span>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    <li>• Leitura automática de Placa por Câmera LPR (OCR) na guarita.</li>
                    <li>• Painel de Chamada em TV/Totem no Pátio (Paging via alto-falante/WhatsApp).</li>
                    <li>• Integração direta via API REST / Webhook com TMS (Totvs, Senior, SAP).</li>
                    <li>• Agendamento prévio de janelas de descarga pelos fornecedores (Slot Booking).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KPIS & MOTOR DE OTIMIZAÇÃO */}
          {activeTab === 'kpis' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                4. Indicadores de Desempenho Logístico (KPIs) & Algoritmo Anti-Gargalos
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">
                    Fórmula 1: Tempo Médio de Permanência em Doca (Dwell Time / Turnaround)
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    DwellTime = &Sigma; (TempoFimOperacao - TempoAtracamento) / TotalVeiculosAtendidos
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <em>Ação do Sistema:</em> Quando uma doca excede o SLA estimado em mais de 15 minutos, o sistema aciona alerta amarelo e sugere reforço de equipe de conferentes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">
                    Fórmula 2: Taxa de Ocupação Operacional (%)
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    TaxaOcupacao = (DocasOcupadas / (14 - DocasEmManutencao)) &times; 100
                  </div>
                  <p className="text-[11px] text-slate-600">
                    <em>Regra Heurística:</em> Ocupação &gt; 80% indica risco de engarrafamento no pátio; ocupação &lt; 50% com fila no pátio indica lentidão na portaria ou desbalanceamento de alocação.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 text-xs">
                    Fórmula 3: Throughput Operacional (Vazão de Veículos/Hora)
                  </div>
                  <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-800">
                    Throughput = VeiculosCompletados / HorasDeTurnoTrabalhadas
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Permite medir a produtividade por turno e prever a hora exata de escoamento da fila externa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOOGLE DRIVE VS VERCEL BLOB */}
          {activeTab === 'persistencia' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                5. Estratégia de Persistência: Vercel Blob Storage vs Google Drive (Análise de Trade-Offs)
              </h4>

              {/* Tabela de Comparação Técnica */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Critério Logístico</th>
                      <th className="p-2.5 text-blue-700">Vercel Blob Storage (Recomendado)</th>
                      <th className="p-2.5 text-slate-700">Google Drive API</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Latência de Leitura/Escrita</td>
                      <td className="p-2.5 text-emerald-700 font-bold">~30ms a 80ms (Edge CDN Global)</td>
                      <td className="p-2.5 text-rose-700">500ms a 2.500ms (API REST pesada)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Autenticação em Quiosques/Tablets</td>
                      <td className="p-2.5 text-emerald-700 font-bold">Baseada em Token/Env (sem login do operador)</td>
                      <td className="p-2.5 text-amber-700">Exige OAuth 2.0 interativo com expiração de token</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Adequação para Snapshot de Estado</td>
                      <td className="p-2.5 text-emerald-700 font-bold">Excelente (Armazenamento de objetos JSON puro)</td>
                      <td className="p-2.5 text-slate-600">Risco de concorrência e conflitos de arquivo</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Armazenamento de Fotos/Canhotos</td>
                      <td className="p-2.5 text-emerald-700 font-bold">URLs públicas/assinadas de alta velocidade</td>
                      <td className="p-2.5 text-slate-600">Permissões complexas de compartilhamento</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Limites de Cota (Rate Limits)</td>
                      <td className="p-2.5 text-slate-700">Escalabilidade elástica transparente</td>
                      <td className="p-2.5 text-rose-700">Cota rigorosa de requisições por minuto por usuário</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Veredito do Arquiteto */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-slate-800 space-y-2">
                <span className="font-bold text-blue-900 text-xs block">
                  🎯 Veredito do Arquiteto de Software:
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>Recomendamos o Vercel Blob Storage</strong> como a camada primária de persistência em nuvem para o estado operacional e fotos de avarias. O Google Drive impõe fricção excessiva em dispositivos industriais (expiração de tokens de guarita, tela de consentimento e latência alta que atrasa o atracamento). No entanto, o sistema oferece <strong>exportação estruturada em JSON/CSV</strong>, permitindo que a transportadora envie relatórios consolidados diretamente para o Google Drive corporativo para auditoria.
                </p>
              </div>

              {/* Painel de Gestão de Dados e Backups */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  Ferramentas de Persistência & Recuperação de Desastre (Ativas)
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Backup JSON Completo</span>
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Restaurar de Arquivo JSON...</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleImportFile}
                      className="hidden" 
                    />
                  </label>

                  <button
                    onClick={handleResetDefaults}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs transition-colors ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resetar para Demonstração</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ROADMAP DE IMPLEMENTAÇÃO */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                6. Roteiro de Implementação Viável para Equipe Pequena (4 Sprints de 2 Semanas)
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-mono font-bold text-xs shrink-0">
                    Sprint 1
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Fundação & Interface Operacional de Docas</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Configuração do grid interativo das 14 docas, persistência local confiável, formulário de check-in de portaria e gestão de fila de espera com ordenação por prioridade.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded bg-indigo-600 text-white font-mono font-bold text-xs shrink-0">
                    Sprint 2
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Motor de Despacho Inteligente & Regras Físicas</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Desenvolvimento do algoritmo de auto-alocação considerando compatibilidade de veículo, cadeia fria (docas 05 a 07) e setor de expedição/inbound.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-mono font-bold text-xs shrink-0">
                    Sprint 3
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Dashboard de KPIs & Detecção Ativa de Gargalos</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Cálculo em tempo real de Dwell Time, Throughput por hora, conformidade de SLA e motor de recomendações e alertas preventivos para a gerência.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 flex items-start gap-3">
                  <span className="px-2.5 py-1 rounded bg-amber-600 text-slate-950 font-mono font-bold text-xs shrink-0">
                    Sprint 4
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Relatórios Impressos A4, Auditoria & Sincronização em Nuvem</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Estilização de relatórios para impressão/PDF, trilha completa de logs em CSV e conector de sincronização em nuvem via Vercel Blob Storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Documento de Arquitetura Técnica Integrada • DocaFlow YMS v1.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Fechar Dossiê
          </button>
        </div>
      </div>
    </div>
  );
};
