import { UF_RATIO_BANDS, ratioBand } from '../../domain/models/DemographicBands.js';

const BAND_COLORS = { ALTA: '#FFD43B', JOVEM: '#5CC8F0', TIPICA: '#3DD68C' };
const bandColor = ratio => BAND_COLORS[ratioBand(ratio, UF_RATIO_BANDS)];

/**
 * Adapter para visualização com Chart.js
 * Isola a dependência gráfica da camada de domínio e aplicação.
 */
export class ElectionChartAdapter {
  constructor() {
    this._barChart = null;
    this._doughnutChart = null;
    this._ratioChart = null;
  }

  renderTopCollegesChart(canvasId, data) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (this._barChart) {
      this._barChart.data.labels = data.labels;
      this._barChart.data.datasets[0].data = data.ptVotes;
      this._barChart.data.datasets[1].data = data.plVotes;
      this._barChart.update();
      return;
    }

    if (typeof Chart === 'undefined') return;

    this._barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Lula (PT)',
            data: data.ptVotes,
            backgroundColor: '#E0464E',
            borderRadius: 6
          },
          {
            label: 'Flávio (PL)',
            data: data.plVotes,
            backgroundColor: '#2F6FE4',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#D6D6D6',
              font: { family: 'Inter', size: 12, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('pt-BR')} votos`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#333333' },
            ticks: { color: '#ADADAD', font: { family: 'Inter', size: 11 } }
          },
          y: {
            grid: { color: '#333333' },
            ticks: {
              color: '#ADADAD',
              font: { family: 'Inter', size: 11 },
              callback: val => (val / 1000000).toFixed(1) + 'M'
            }
          }
        }
      }
    });
  }

  renderUfDivisionChart(canvasId, data) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (this._doughnutChart) {
      this._doughnutChart.data.datasets[0].data = [data.ptCount, data.plCount];
      this._doughnutChart.update();
      return;
    }

    if (typeof Chart === 'undefined') return;

    this._doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['PT (Lula)', 'PL (Flávio)'],
        datasets: [
          {
            data: [data.ptCount, data.plCount],
            backgroundColor: ['#E0464E', '#2F6FE4'],
            borderWidth: 2,
            borderColor: '#1F1F1F'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#D6D6D6',
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              font: { family: 'Inter', size: 11 }
            }
          }
        }
      }
    });
  }

  renderDemographicRatioChart(canvasId, data) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) return;

    if (this._ratioChart) {
      this._ratioChart.data.labels = data.labels;
      this._ratioChart.data.datasets[0].data = data.ratios;
      this._ratioChart.data.datasets[0].backgroundColor = data.ratios.map(bandColor);
      this._ratioChart.update();
      return;
    }

    if (typeof Chart === 'undefined') return;

    this._ratioChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Razão Eleitores / População (%)',
            data: data.ratios,
            backgroundColor: data.ratios.map(bandColor),
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: ctx => ` Razão: ${ctx.raw.toFixed(2).replace('.', ',')}%`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#ADADAD', font: { family: 'Inter', size: 11 } }
          },
          y: {
            min: 50,
            max: 90,
            grid: { color: '#333333' },
            ticks: {
              color: '#ADADAD',
              font: { family: 'Inter', size: 11 },
              callback: val => val + '%'
            }
          }
        }
      }
    });
  }
}
