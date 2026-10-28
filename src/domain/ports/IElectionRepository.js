/**
 * Port de Repositório Eleitoral (Hexagonal Architecture)
 */
export class IElectionRepository {
  getAllStates() {
    throw new Error('Método getAllStates() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  getStateByUf(uf) {
    throw new Error('Método getStateByUf(uf) deve ser implementado pelo Adapter de Infraestrutura.');
  }

  /** Totais dos votos no exterior por turno ({ t1, t2 }); não pertencem a nenhuma UF */
  getExterior() {
    throw new Error('Método getExterior() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  /** Prova de origem das fontes (hashes SHA-256, links e datas de obtenção) */
  getProvenance() {
    throw new Error('Método getProvenance() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  /** Carrega a base municipal sob demanda; resolve quando getMunicipalities() estiver disponível */
  loadMunicipalities() {
    throw new Error('Método loadMunicipalities() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  isMunicipalitiesLoaded() {
    throw new Error('Método isMunicipalitiesLoaded() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  /** Carrega as zonas eleitorais sob demanda */
  loadZones() {
    throw new Error('Método loadZones() deve ser implementado pelo Adapter de Infraestrutura.');
  }

  /** Zonas (ZoneElection[]) de um município pela chave TSE; [] se ainda não carregadas */
  getZones(tseKey) {
    throw new Error('Método getZones(tseKey) deve ser implementado pelo Adapter de Infraestrutura.');
  }

  getMunicipalities() {
    throw new Error('Método getMunicipalities() deve ser implementado pelo Adapter de Infraestrutura.');
  }
}
