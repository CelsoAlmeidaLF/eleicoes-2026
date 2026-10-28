import { BRAZIL_MAP_PATHS } from './BrazilMapPaths.js';
import { escapeHtml as esc } from '../lib/escapeHtml.js';
/**
 * Adapter Cartográfico para o Mapa Geopolítico do Brasil em SVG
 * Implementação Hexagonal de Infraestrutura Visual
 */
export class BrazilMapAdapter {
  constructor() {
    this._container = null;
    this._svgElement = null;
    this._tooltip = null;
    this._currentStates = new Map();
    this._currentTurn = 2;
    this._onStateClick = null;
    this._stateElements = new Map();
  }

  /**
   * Inicializa e renderiza o SVG no container alvo
   * @param {string} containerId 
   * @param {Array<import('../../domain/models/StateElection.js').StateElection>} states 
   * @param {number} turn 
   * @param {Function} onStateClick 
   */
  render(containerId, states, turn = 2, onStateClick = null) {
    this._container = document.getElementById(containerId);
    if (!this._container) return;

    this._onStateClick = onStateClick;
    this._currentTurn = turn;
    this._cacheStates(states);
    this._ensureTooltip();

    // Monta o SVG do Mapa com escopo unívoco por container
    const svgHtml = `
      <svg id="brazilMapSvg_${containerId}" viewBox="0 0 1000 912" class="brazil-map-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="mapShadow_${containerId}" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
          </filter>
        </defs>
        <g id="statesGroup_${containerId}">
          ${BRAZIL_MAP_PATHS.map(p => `
            <path id="map_uf_${containerId}_${p.uf}"
                  data-uf="${p.uf}"
                  data-name="${p.name}"
                  d="${p.d}"
                  fill="#333333"
                  class="brazil-map-state" />
          `).join('')}
        </g>
      </svg>
    `;

    this._container.innerHTML = svgHtml;
    this._svgElement = this._container.querySelector(`#brazilMapSvg_${containerId}`);

    // Mapeia e vincula listeners
    BRAZIL_MAP_PATHS.forEach(p => {
      const el = this._container.querySelector(`[data-uf="${p.uf}"]`);
      if (el) {
        this._stateElements.set(p.uf, el);
        this._bindStateEvents(el, p.uf);
      }
    });

    this.update(states, turn);
  }

  _cacheStates(states) {
    this._currentStates.clear();
    if (Array.isArray(states)) {
      states.forEach(st => this._currentStates.set(st.uf, st));
    }
  }

  /**
   * Atualiza as cores e classes dos estados conforme o turno
   */
  update(states, turn = 2) {
    this._currentTurn = turn;
    this._cacheStates(states);

    this._stateElements.forEach((el, uf) => {
      const st = this._currentStates.get(uf);
      if (!st) return;

      const winner = st.getWinner(turn);
      const isVirada = st.virada && turn === 2;

      // Reseta classes dinâmicas
      el.classList.remove('state-winner-pt', 'state-winner-pl', 'state-virada-glow');

      if (winner === 'PT') {
        el.classList.add('state-winner-pt');
        el.setAttribute('fill', '#E0464E');
      } else {
        el.classList.add('state-winner-pl');
        el.setAttribute('fill', '#2F6FE4');
      }

      if (isVirada) {
        el.classList.add('state-virada-glow');
        el.setAttribute('stroke', '#ffdf00');
        el.setAttribute('stroke-width', '2.5');
      } else {
        el.removeAttribute('stroke');
        el.removeAttribute('stroke-width');
      }
    });
  }

  _ensureTooltip() {
    let tip = document.getElementById('brazilMapTooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'brazilMapTooltip';
      tip.className = 'map-tooltip hidden';
      document.body.appendChild(tip);
    }
    this._tooltip = tip;
  }

  _bindStateEvents(el, uf) {
    el.addEventListener('mouseenter', (e) => this._showTooltip(e, uf));
    el.addEventListener('mousemove', (e) => this._moveTooltip(e));
    el.addEventListener('mouseleave', () => this._hideTooltip());
    el.addEventListener('click', () => {
      if (typeof this._onStateClick === 'function') {
        this._onStateClick(uf);
      }
    });
  }

  _showTooltip(e, uf) {
    const st = this._currentStates.get(uf);
    if (!st || !this._tooltip) return;

    const turn = this._currentTurn;
    const winner = st.getWinner(turn);
    const margin = st.getWinningMargin(turn);
    const isPT = winner === 'PT';

    const pLula = turn === 1 ? st.t1LulaPct.toFixed(1) : st.t2LulaPct.toFixed(1);
    const pFlavio = turn === 1 ? st.t1FlavioPct.toFixed(1) : st.t2FlavioPct.toFixed(1);
    const vLula = (turn === 1 ? st.t1Lula : st.t2Lula).toLocaleString('pt-BR');
    const vFlavio = (turn === 1 ? st.t1Flavio : st.t2Flavio).toLocaleString('pt-BR');

    this._tooltip.innerHTML = `
      <div class="space-y-2 font-mono text-xs">
        <div class="flex items-center justify-between border-b border-borderDark pb-1.5 gap-4">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-amber-400 text-sm">${esc(st.uf)}</span>
            <span class="text-white font-medium font-sans">${esc(st.name)}</span>
          </div>
          <span class="badge-status ${isPT ? 'badge-pt' : 'badge-pl'}">${esc(winner)} Venceu</span>
        </div>

        <div class="space-y-1 text-[11px]">
          <div class="flex justify-between items-center gap-3">
            <span class="text-ptRed-400 font-bold">Lula (PT):</span>
            <span class="text-white font-bold">${pLula}% <span class="text-slate-400 font-normal">(${vLula})</span></span>
          </div>
          <div class="flex justify-between items-center gap-3">
            <span class="text-plBlue-400 font-bold">Flávio (PL):</span>
            <span class="text-white font-bold">${pFlavio}% <span class="text-slate-400 font-normal">(${vFlavio})</span></span>
          </div>
          <div class="flex justify-between items-center gap-3 border-t border-slate-800 pt-1">
            <span class="text-slate-400">Vantagem (${turn}ºT):</span>
            <span class="font-bold ${isPT ? 'text-ptRed-400' : 'text-plBlue-400'}">+${margin.toLocaleString('pt-BR')} (${esc(winner)})</span>
          </div>
        </div>

        <div class="border-t border-slate-800 pt-1 text-[10px] text-slate-400 flex justify-between gap-3">
          <span>Eleitores: <strong class="text-slate-200">${st.elec.toLocaleString('pt-BR')}</strong></span>
          <span>Pop: <strong class="text-slate-200">${st.pop.toLocaleString('pt-BR')}</strong></span>
        </div>

        ${st.virada ? '<div class="text-[10px] text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 rounded px-1.5 py-0.5 text-center">Estado Decisivo de Virada no 2ºT</div>' : ''}
        
        <div class="text-[9px] text-emerald-400/80 text-center pt-0.5">Clique para auditoria completa</div>
      </div>
    `;

    this._tooltip.classList.remove('hidden');
    this._moveTooltip(e);
  }

  _moveTooltip(e) {
    if (!this._tooltip) return;
    const offset = 15;
    let left = e.clientX;
    let top = e.clientY - offset;

    // Proteção contra bordas da viewport
    const tipRect = this._tooltip.getBoundingClientRect();
    if (left + tipRect.width / 2 > window.innerWidth - 10) {
      left = window.innerWidth - tipRect.width / 2 - 10;
    } else if (left - tipRect.width / 2 < 10) {
      left = tipRect.width / 2 + 10;
    }

    if (top - tipRect.height < 10) {
      top = e.clientY + offset + tipRect.height;
    }

    this._tooltip.style.left = `${left}px`;
    this._tooltip.style.top = `${top}px`;
  }

  _hideTooltip() {
    if (this._tooltip) {
      this._tooltip.classList.add('hidden');
    }
  }

  /**
   * Destaca estados no mapa por partido
   */
  filterParty(party) {
    this._stateElements.forEach((el, uf) => {
      const st = this._currentStates.get(uf);
      if (!st) return;
      const winner = st.getWinner(this._currentTurn);
      if (party === 'ALL' || winner === party) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      } else {
        el.style.opacity = '0.2';
        el.style.transform = 'scale(0.99)';
      }
    });
  }

  /**
   * Destaca estados no mapa por macrorregião
   */
  filterRegion(region) {
    this._stateElements.forEach((el, uf) => {
      const st = this._currentStates.get(uf);
      if (!st) return;
      if (region === 'ALL' || st.region === region) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
      } else {
        el.style.opacity = '0.2';
        el.style.transform = 'scale(0.99)';
      }
    });
  }
}
