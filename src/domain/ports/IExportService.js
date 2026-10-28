/**
 * Port de Serviço de Exportação (Hexagonal Architecture)
 */
export class IExportService {
  exportToCsv(states, exterior) {
    throw new Error('Método exportToCsv(states, exterior) deve ser implementado pelo Adapter de Aplicação.');
  }

  exportMunicipalitiesCsv(municipalities, filename) {
    throw new Error('Método exportMunicipalitiesCsv(municipalities, filename) deve ser implementado pelo Adapter de Aplicação.');
  }

  generateShareText(summaryData, viradas) {
    throw new Error('Método generateShareText(summaryData, viradas) deve ser implementado pelo Adapter de Aplicação.');
  }
}
