/**
 * @file Program.js
 * @description Composition Root e Ponto de Entrada Canônico de STK-GOVERNO-BRAZIL
 * Arquitetura Hexagonal com Injeção de Dependências.
 */
import { ElectionRepository } from './infrastructure/repositories/ElectionRepository.js';
import { ElectionAnalysisService } from './application/services/ElectionAnalysisService.js';
import { ExportService } from './application/services/ExportService.js';
import { ElectionChartAdapter } from './infrastructure/charts/ElectionChartAdapter.js';
import { BrazilMapAdapter } from './infrastructure/maps/BrazilMapAdapter.js';
import { PwaAdapter } from './infrastructure/pwa/PwaAdapter.js';
import { ElectionUIController } from './ui/ElectionUIController.js';

export class Program {
  static main() {
    try {
      // 1. Camada de Infraestrutura
      const repository = new ElectionRepository();
      const chartAdapter = new ElectionChartAdapter();
      const mapAdapter = new BrazilMapAdapter();
      const pwaAdapter = new PwaAdapter();
      pwaAdapter.init();

      // 2. Camada de Aplicação
      const analysisService = new ElectionAnalysisService(repository);
      const exportService = new ExportService();

      // 3. Camada de UI / Apresentação
      const uiController = new ElectionUIController(analysisService, exportService, chartAdapter, mapAdapter, pwaAdapter);

      // 4. Inicialização do Ciclo de Vida
      uiController.init();

      // Objetos internos no console só em desenvolvimento (localhost ou ?debug)
      if (Program.isDevelopment()) {
        window.__STK_GOV__ = {
          repository,
          analysisService,
          exportService,
          uiController
        };
      }

      console.info('[STK-GOVERNO-BRAZIL] Aplicação inicializada com sucesso em Arquitetura Hexagonal.');
    } catch (error) {
      console.error('[STK-GOVERNO-BRAZIL] Falha crítica na inicialização do Program:', error);
      Program.showFatalError(error);
    }
  }

  static isDevelopment() {
    const { hostname, search } = window.location;
    return hostname === 'localhost' || hostname === '127.0.0.1' || new URLSearchParams(search).has('debug');
  }

  /**
   * Mostra o aviso estático do index.html em vez de deixar a página vazia
   */
  static showFatalError(error) {
    const box = document.getElementById('appFatalError');
    if (!box) return;
    const detail = document.getElementById('appFatalErrorDetail');
    if (detail) {
      detail.textContent = `Erro na inicialização: ${error?.message || error}. Recarregue a página; se persistir, veja o console do navegador.`;
    }
    box.hidden = false;
  }
}

// Inicialização automática ao carregar o DOM
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Program.main());
  } else {
    Program.main();
  }
}

export default Program;
