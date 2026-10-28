import { IElectionRepository } from '../../domain/ports/IElectionRepository.js';
import { StateElection } from '../../domain/models/StateElection.js';
import { MunicipalityElection } from '../../domain/models/MunicipalityElection.js';
import { ZoneElection } from '../../domain/models/ZoneElection.js';
import { BRAZIL_DATA, EXTERIOR_DATA, PROVENANCE } from '../data/BrazilElectionData.js';
import { Enumerable } from '../lib/stk-pkt-linq.js';

// A base municipal (~1 MB) só é baixada quando a aba Municipal é aberta
const loadMunicipalitiesData = () =>
  import('../data/BrazilMunicipalitiesData.js').then(mod => mod.MUNICIPALITIES_DATA);

// Zonas eleitorais (~730 KB): baixadas só ao abrir o detalhe de um município
const loadZonesData = () =>
  import('../data/BrazilZonesData.js').then(mod => ({ fields: mod.ZONE_FIELDS, zones: mod.ZONES_DATA }));

/** Converte o vetor compacto do arquivo gerado em objeto nomeado */
const unpackTurn = (fields, values) => (values ? Object.fromEntries(fields.map((f, i) => [f, values[i]])) : null);

/**
 * Repositório de Microdados Eleitorais com LINQ Fluente
 */
export class ElectionRepository extends IElectionRepository {
  constructor(statesRaw = BRAZIL_DATA, exteriorRaw = EXTERIOR_DATA, municipalitiesLoader = loadMunicipalitiesData, provenance = PROVENANCE, zonesLoader = loadZonesData) {
    super();
    this._states = Enumerable.from(statesRaw)
      .select(d => new StateElection(d))
      .toArray();

    this._exterior = exteriorRaw;
    this._provenance = provenance;
    this._municipalitiesLoader = municipalitiesLoader;
    this._municipalitiesPromise = null;
    this._municipalities = null;
    this._zonesLoader = zonesLoader;
    this._zonesPromise = null;
    this._zones = null;
  }

  loadZones() {
    if (!this._zonesPromise) {
      this._zonesPromise = Promise.resolve(this._zonesLoader())
        .then(({ fields, zones }) => {
          this._zones = { fields, zones };
        })
        .catch(err => {
          this._zonesPromise = null;
          throw err;
        });
    }
    return this._zonesPromise;
  }

  getZones(tseKey) {
    if (!this._zones || !tseKey) return [];
    const { fields, zones } = this._zones;
    return (zones[tseKey] ?? []).map(z => new ZoneElection({
      zona: z.z,
      t1: unpackTurn(fields, z.t1),
      t2: unpackTurn(fields, z.t2)
    }));
  }

  getExterior() {
    return this._exterior;
  }

  getProvenance() {
    return this._provenance;
  }

  loadMunicipalities() {
    if (!this._municipalitiesPromise) {
      this._municipalitiesPromise = Promise.resolve(this._municipalitiesLoader())
        .then(raw => {
          this._municipalities = Enumerable.from(raw)
            .select(d => new MunicipalityElection(d))
            .toArray();
        })
        .catch(err => {
          // Permite nova tentativa após falha de rede
          this._municipalitiesPromise = null;
          throw err;
        });
    }
    return this._municipalitiesPromise;
  }

  isMunicipalitiesLoaded() {
    return this._municipalities !== null;
  }

  getAllStates() {
    return Enumerable.from(this._states);
  }

  getStateByUf(uf) {
    if (!uf) return null;
    const target = String(uf).trim().toUpperCase();
    return Enumerable.from(this._states)
      .firstOrDefault(s => s.uf === target, null);
  }

  getMunicipalities() {
    return Enumerable.from(this._municipalities ?? []);
  }
}
