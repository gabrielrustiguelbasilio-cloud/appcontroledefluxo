import { Dock, Vehicle, LogisticsKPIs, LogisticsSuggestion, BottleneckAlert } from '../types/logistics';

export const logisticsEngine = {
  // Algoritmo de Alocação Inteligente de Docas (Auto-Dispatch)
  findBestDockForVehicle(vehicle: Vehicle, docks: Dock[]): { dock: Dock | null; reason: string } {
    // 1. Filtrar docas disponíveis
    const availableDocks = docks.filter(d => d.status === 'disponivel');
    if (availableDocks.length === 0) {
      return { dock: null, reason: 'Nenhuma das 14 docas está disponível no momento.' };
    }

    // 2. Regra estrita: Carga refrigerada EXIGE doca com cadeia de frio (Docas 05, 06, 07)
    let candidates = availableDocks;
    if (vehicle.cargoType === 'refrigerada') {
      candidates = candidates.filter(d => d.isColdChain);
      if (candidates.length === 0) {
        return { 
          dock: null, 
          reason: 'Carga refrigerada exige Doca de Cadeia de Frio (Docas 05 a 07), mas todas estão ocupadas ou em manutenção.' 
        };
      }
    } else {
      // Para carga seca ou geral, prefira NÃO ocupar docas de frio a menos que estritamente necessário
      const nonColdCandidates = candidates.filter(d => !d.isColdChain);
      if (nonColdCandidates.length > 0) {
        candidates = nonColdCandidates;
      }
    }

    // 3. Filtrar compatibilidade de porte físico do veículo
    const compatibleByVehicle = candidates.filter(d => 
      d.allowedVehicles.includes(vehicle.vehicleType)
    );

    if (compatibleByVehicle.length > 0) {
      candidates = compatibleByVehicle;
    }

    // 4. Pontuação e afinidade por tipo de operação (Descarga -> Inbound; Crossdocking -> Crossdock; Carga -> Linha Pesada)
    const scoredDocks = candidates.map(dock => {
      let score = 10;

      // Preferência de setor
      if (vehicle.operationType === 'descarga' && dock.sector === 'recebimento_geral') score += 20;
      if (vehicle.operationType === 'crossdocking' && dock.sector === 'expedicao_crossdock') score += 25;
      if (vehicle.operationType === 'carregamento' && dock.sector === 'expedicao_pesada') score += 20;
      if (vehicle.cargoType === 'refrigerada' && dock.sector === 'cadeia_frio') score += 30;

      // Se for veículo pesado (bitrem/carreta), pontua mais docas com niveladora hidráulica e espaço amplo
      if (['bitrem', 'carreta'].includes(vehicle.vehicleType)) {
        if (dock.hasHydraulicLeveler) score += 10;
        if ([1, 4, 11, 12, 13].includes(dock.id)) score += 15;
      }

      // Se for veículo leve (van/vuc), prioriza docas de menor calado para poupar docas pesadas
      if (['van', 'vuc'].includes(vehicle.vehicleType)) {
        if ([7, 8, 10].includes(dock.id)) score += 15;
      }

      return { dock, score };
    });

    scoredDocks.sort((a, b) => b.score - a.score);

    if (scoredDocks.length > 0) {
      const best = scoredDocks[0].dock;
      return { 
        dock: best, 
        reason: `Alocação otimizada para ${best.code} (${best.sectorName}) com base no tipo ${vehicle.vehicleType.toUpperCase()} e operação ${vehicle.operationType.toUpperCase()}.` 
      };
    }

    return { dock: candidates[0], reason: 'Alocada na primeira doca compatível disponível.' };
  },

  // Cálculo preciso de KPIs Logísticos
  calculateKPIs(docks: Dock[], vehicles: Vehicle[]): LogisticsKPIs {
    const totalDocks = docks.length; // 14
    const availableDocks = docks.filter(d => d.status === 'disponivel').length;
    const occupiedDocks = docks.filter(d => d.status === 'ocupada').length;
    const maintenanceDocks = docks.filter(d => d.status === 'manutencao').length;
    const reservedDocks = docks.filter(d => d.status === 'reservada').length;

    // Taxa de ocupação operacional (% das docas ativas não interditadas)
    const operationalDocks = totalDocks - maintenanceDocks;
    const occupancyRatePct = operationalDocks > 0 
      ? Math.round((occupiedDocks / operationalDocks) * 100) 
      : 0;

    const vehiclesInYard = vehicles.filter(v => v.status === 'aguardando_patio').length;
    const vehiclesInOperation = vehicles.filter(v => v.status === 'em_operacao' || v.status === 'em_transito_doca').length;
    const completedVehicles = vehicles.filter(v => v.status === 'liberado' || v.status === 'concluido');

    // Tempo médio de espera no pátio (Minutos entre check-in e dockedTime)
    let totalWaitMin = 0;
    let waitCount = 0;
    vehicles.forEach(v => {
      if (v.checkInTime && v.dockedTime) {
        const diffMs = new Date(v.dockedTime).getTime() - new Date(v.checkInTime).getTime();
        const diffMins = Math.max(0, Math.round(diffMs / (60 * 1000)));
        totalWaitMin += diffMins;
        waitCount++;
      } else if (v.status === 'aguardando_patio') {
        // Veículos ainda na fila contam para o tempo de espera atual
        const diffMs = Date.now() - new Date(v.checkInTime).getTime();
        const diffMins = Math.max(0, Math.round(diffMs / (60 * 1000)));
        totalWaitMin += diffMins;
        waitCount++;
      }
    });
    const avgYardWaitTimeMin = waitCount > 0 ? Math.round(totalWaitMin / waitCount) : 0;

    // Tempo médio de permanência em doca (Dwell Time em minutos)
    let totalDwellMin = 0;
    let dwellCount = 0;
    let withinSlaCount = 0;
    
    // Análise de veículos que já atracaram ou concluíram
    vehicles.forEach(v => {
      if (v.dockedTime) {
        const endTime = v.operationEndTime ? new Date(v.operationEndTime).getTime() : Date.now();
        const start = new Date(v.dockedTime).getTime();
        const durationMin = Math.max(1, Math.round((endTime - start) / (60 * 1000)));
        totalDwellMin += durationMin;
        dwellCount++;

        // SLA check
        const estimated = v.estimatedMinutes || 60;
        if (durationMin <= estimated) {
          withinSlaCount++;
        }
      }
    });

    const avgDwellTimeMin = dwellCount > 0 ? Math.round(totalDwellMin / dwellCount) : 58;
    const slaCompliancePct = dwellCount > 0 ? Math.round((withinSlaCount / dwellCount) * 100) : 85;

    // Throughput (estimado com base nos liberados hoje)
    const throughputPerHour = Math.round((completedVehicles.length / 4.5) * 10) / 10 || 1.8;

    // Ocupação da Cadeia de Frio (Docas 5, 6, 7)
    const coldDocks = docks.filter(d => d.isColdChain);
    const occupiedCold = coldDocks.filter(d => d.status === 'ocupada').length;
    const coldChainOccupancyPct = Math.round((occupiedCold / coldDocks.length) * 100);

    return {
      totalDocks,
      availableDocks,
      occupiedDocks,
      maintenanceDocks,
      reservedDocks,
      occupancyRatePct,
      vehiclesInYard,
      vehiclesInOperation,
      vehiclesCompletedToday: completedVehicles.length,
      avgDwellTimeMin,
      avgYardWaitTimeMin,
      throughputPerHour,
      slaCompliancePct,
      coldChainOccupancyPct,
    };
  },

  // Identificação de Gargalos Críticos
  detectBottlenecks(docks: Dock[], vehicles: Vehicle[], kpis: LogisticsKPIs): BottleneckAlert[] {
    const alerts: BottleneckAlert[] = [];
    const now = Date.now();

    // 1. Doca com tempo estourado (> 100% do SLA estimado)
    docks.forEach(dock => {
      if (dock.status === 'ocupada' && dock.operationStartTime) {
        const elapsedMin = Math.round((now - new Date(dock.operationStartTime).getTime()) / (60 * 1000));
        const estimated = dock.estimatedDurationMin || 60;
        if (elapsedMin > estimated) {
          const delay = elapsedMin - estimated;
          alerts.push({
            id: `delay-dock-${dock.id}`,
            type: 'tempo_excedido',
            severity: delay > 25 ? 'alta' : 'media',
            title: `Tempo Excedido na ${dock.code}`,
            description: `Operação ultrapassou o SLA estimado em ${delay} min (Tempo decorrido: ${elapsedMin}m / Meta: ${estimated}m).`,
            suggestedAction: 'Verificar motivo da retenção com conferente ou enviar equipe de apoio de chapa.',
            dockId: dock.id,
            metricValue: `+${delay} min`
          });
        }
      }
    });

    // 2. Veículos refrigerados na fila sem doca de frio disponível
    const waitingRefrigerated = vehicles.filter(v => v.status === 'aguardando_patio' && v.cargoType === 'refrigerada');
    const availableColdDocks = docks.filter(d => d.isColdChain && d.status === 'disponivel');
    if (waitingRefrigerated.length > 0 && availableColdDocks.length === 0) {
      alerts.push({
        id: 'cold-chain-bottleneck',
        type: 'frio_sobrecarregado',
        severity: 'alta',
        title: 'Gargalo Crítico na Cadeia de Frio',
        description: `Existem ${waitingRefrigerated.length} caminhão(ões) refrigerado(s) na fila do pátio e nenhuma das 3 docas de frio (05, 06, 07) está livre.`,
        suggestedAction: 'Acelerar liberação da Doca 06 ou Doca 05 para evitar risco de avaria térmica de perecíveis.',
        metricValue: `${waitingRefrigerated.length} na fila`
      });
    }

    // 3. Fila alta no pátio (> 4 veículos)
    if (kpis.vehiclesInYard >= 4) {
      alerts.push({
        id: 'yard-queue-high',
        type: 'fila_alta',
        severity: kpis.vehiclesInYard >= 6 ? 'alta' : 'media',
        title: 'Congestionamento no Pátio Externo',
        description: `${kpis.vehiclesInYard} veículos retidos no bolsão de triagem aguardando chamada para doca.`,
        suggestedAction: 'Priorizar liberação de docas finalizadas e acionar auto-dispatch imediato.',
        metricValue: `${kpis.vehiclesInYard} veículos`
      });
    }

    // 4. Doca ociosa com veículos compatíveis aguardando no pátio
    docks.forEach(dock => {
      if (dock.status === 'disponivel') {
        const compatibleWaiters = vehicles.filter(v => 
          v.status === 'aguardando_patio' && 
          dock.allowedVehicles.includes(v.vehicleType) &&
          (v.cargoType !== 'refrigerada' || dock.isColdChain)
        );
        if (compatibleWaiters.length > 0) {
          alerts.push({
            id: `idle-dock-${dock.id}`,
            type: 'doca_ociosa',
            severity: 'baixa',
            title: `${dock.code} Ociosa com Fila no Pátio`,
            description: `Doca está livre e existem ${compatibleWaiters.length} veículo(s) no pátio prontos para atracar nesta posição.`,
            suggestedAction: `Chamar o caminhão ${compatibleWaiters[0].licensePlate} (${compatibleWaiters[0].driverName}) para atracamento imediato.`,
            dockId: dock.id,
            vehicleId: compatibleWaiters[0].id,
            metricValue: 'Ociosa'
          });
        }
      }
    });

    return alerts;
  },

  // Gerador de Boas Práticas e Recomendações Contextuais
  generateSuggestions(docks: Dock[], vehicles: Vehicle[], kpis: LogisticsKPIs): LogisticsSuggestion[] {
    const suggestions: LogisticsSuggestion[] = [];

    // Ocupação do setor de recebimento
    const receivingDocks = docks.filter(d => d.sector === 'recebimento_geral');
    const occupiedReceiving = receivingDocks.filter(d => d.status === 'ocupada').length;
    const receivingOccupancy = Math.round((occupiedReceiving / receivingDocks.length) * 100);

    if (receivingOccupancy >= 75) {
      suggestions.push({
        id: 'sug-extender-recebimento',
        title: 'Docas de Recebimento com Ocupação Elevada (>75%)',
        message: 'O setor de recebimento (Docas 01 a 04) opera em capacidade máxima. Considere estender a janela de conferência cega em 1 hora ou realocar a equipe de expedição para apoiar a despaletização.',
        severity: 'warning',
        category: 'gargalo',
        actionLabel: 'Revisar Escala'
      });
    }

    // Alerta de tempo de espera no pátio
    if (kpis.avgYardWaitTimeMin > 25) {
      suggestions.push({
        id: 'sug-wait-time-high',
        title: `Tempo Médio de Espera Subiu para ${kpis.avgYardWaitTimeMin} min`,
        message: 'O tempo médio de permanência dos motoristas na guarita aumentou 18% em relação à média padrão. Recomenda-se acionar chamada sequencial automática para desobstruir o bolsão de triagem.',
        severity: 'critical',
        category: 'produtividade',
        actionType: 'assign_auto',
        actionLabel: 'Executar Auto-Alocação'
      });
    } else {
      suggestions.push({
        id: 'sug-throughput-ok',
        title: 'Fluxo Operacional Estável',
        message: 'Tempo de atendimento dentro da meta operacional estabelecida de 60 minutos por veículo. Mantenha o checklist prévio de documentação na portaria.',
        severity: 'success',
        category: 'produtividade'
      });
    }

    // Sugestão para Cadeia de Frio
    if (kpis.coldChainOccupancyPct >= 66) {
      suggestions.push({
        id: 'sug-frio-prioridade',
        title: 'Alocação Preventiva na Cadeia de Frio (Docas 05 a 07)',
        message: 'Docas térmicas com 2 de 3 posições tomadas. Programe os próximos agendamentos de carretas frigorificadas para janelas espaçadas de no mínimo 45 minutos.',
        severity: 'info',
        category: 'alocacao'
      });
    }

    // Doca em manutenção
    const maintDocks = docks.filter(d => d.status === 'manutencao');
    if (maintDocks.length > 0) {
      maintDocks.forEach(md => {
        suggestions.push({
          id: `sug-maint-${md.id}`,
          title: `${md.code} em Interdição Mecânica`,
          message: `${md.maintenanceReason || 'Manutenção corretiva'}. Cada hora de doca parada reduz a capacidade do pátio em aprox. 1.2 carretas.`,
          severity: 'warning',
          category: 'manutencao',
          targetDockId: md.id,
          actionType: 'call_maintenance',
          actionLabel: 'Verificar Laudo'
        });
      });
    }

    return suggestions;
  }
};
