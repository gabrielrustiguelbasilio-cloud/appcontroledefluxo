import { Dock, Vehicle, MovementLog, StorageProvider, StorageStateMeta } from '../types/logistics';
import { INITIAL_DOCKS, INITIAL_VEHICLES, INITIAL_LOGS } from '../data/initialData';

export interface AppState {
  docks: Dock[];
  vehicles: Vehicle[];
  logs: MovementLog[];
  meta: StorageStateMeta;
}

const STORAGE_KEY = 'docaflow_yms_state_v1';
const CONFIG_KEY = 'docaflow_yms_config';

export const storageService = {
  // Carrega o estado atual garantindo sobrevivência a reinicializações
  loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.docks && Array.isArray(parsed.docks) && parsed.docks.length === 14) {
          return {
            docks: parsed.docks,
            vehicles: parsed.vehicles || [],
            logs: parsed.logs || [],
            meta: parsed.meta || {
              provider: 'local',
              lastSavedAt: new Date().toISOString(),
              version: 1,
              cloudSyncStatus: 'synced',
              backupCount: 1,
              vercelBlobTokenConfigured: false,
            }
          };
        }
      }
    } catch (e) {
      console.warn('[DocaFlow Storage] Falha ao ler localStorage, utilizando dataset inicial', e);
    }

    // Se não há dados ou houve erro, inicializa com os dados padrão
    const defaultState: AppState = {
      docks: INITIAL_DOCKS,
      vehicles: INITIAL_VEHICLES,
      logs: INITIAL_LOGS,
      meta: {
        provider: 'local',
        lastSavedAt: new Date().toISOString(),
        version: 1,
        cloudSyncStatus: 'synced',
        backupCount: 1,
        vercelBlobTokenConfigured: false,
      }
    };
    this.saveState(defaultState);
    return defaultState;
  },

  // Salva no LocalStorage e aciona sync cloud se configurado
  saveState(state: AppState): boolean {
    try {
      const updatedState: AppState = {
        ...state,
        meta: {
          ...state.meta,
          lastSavedAt: new Date().toISOString(),
          version: (state.meta?.version || 1) + 1,
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));

      // Se Vercel Blob configurado com token real, pode disparar sync em background
      if (state.meta.provider === 'vercel_blob' && state.meta.vercelBlobTokenConfigured) {
        this.syncToVercelBlobBackground(updatedState);
      }
      return true;
    } catch (e) {
      console.error('[DocaFlow Storage] Erro ao salvar estado', e);
      return false;
    }
  },

  // Backup em arquivo JSON para download imediato (pronto para upload no Google Drive ou arquivamento)
  exportToJson(state: AppState) {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `docaflow_backup_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Importa backup previamente salvo
  importFromJson(jsonStr: string): AppState | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.docks || parsed.docks.length !== 14 || !parsed.vehicles) {
        throw new Error('Arquivo de backup inválido: não contém as 14 docas ou dados de veículos');
      }
      const importedState: AppState = {
        docks: parsed.docks,
        vehicles: parsed.vehicles,
        logs: parsed.logs || [],
        meta: {
          provider: parsed.meta?.provider || 'local',
          lastSavedAt: new Date().toISOString(),
          version: (parsed.meta?.version || 1) + 1,
          cloudSyncStatus: 'synced',
          backupCount: (parsed.meta?.backupCount || 1) + 1,
          vercelBlobTokenConfigured: parsed.meta?.vercelBlobTokenConfigured || false
        }
      };
      this.saveState(importedState);
      return importedState;
    } catch (e) {
      console.error('Falha ao importar backup', e);
      return null;
    }
  },

  // Restaura dados para o padrão de demonstração de alta fidelidade
  resetDefaults(): AppState {
    const defaultState: AppState = {
      docks: INITIAL_DOCKS,
      vehicles: INITIAL_VEHICLES,
      logs: INITIAL_LOGS,
      meta: {
        provider: 'local',
        lastSavedAt: new Date().toISOString(),
        version: 1,
        cloudSyncStatus: 'synced',
        backupCount: 1,
        vercelBlobTokenConfigured: false,
      }
    };
    this.saveState(defaultState);
    return defaultState;
  },

  // Simulação e integração com Vercel Blob
  async syncToVercelBlobBackground(state: AppState) {
    // Registra tentativa no console para rastreabilidade
    console.log('[DocaFlow Vercel Blob] Sincronizando snapshot de estado com armazenamento em nuvem...', {
      timestamp: new Date().toISOString(),
      docks: state.docks.length,
      vehicles: state.vehicles.length
    });
  }
};
