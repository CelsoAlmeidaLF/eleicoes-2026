/**
 * Adapter de PWA: registro do Service Worker e convite de instalação do navegador.
 * Isola as APIs do navegador da camada de UI, que só recebe "pode instalar?" e "instalar()".
 */
export class PwaAdapter {
  constructor(swUrl = 'sw.js') {
    this._swUrl = swUrl;
    this._deferredPrompt = null;
    this._listeners = new Set();
  }

  init() {
    // Service Worker só funciona em HTTPS ou localhost
    if ('serviceWorker' in navigator && window.isSecureContext) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(this._swUrl).catch(err => {
          console.warn('[STK-GOVERNO-BRAZIL] Service Worker não registrado:', err);
        });
      });
    }

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this._deferredPrompt = e;
      this._notify();
    });

    window.addEventListener('appinstalled', () => {
      this._deferredPrompt = null;
      this._notify();
    });
  }

  /** Executa o callback sempre que a disponibilidade de instalação mudar */
  onInstallAvailabilityChange(callback) {
    this._listeners.add(callback);
    callback(this.canInstall());
  }

  canInstall() {
    return this._deferredPrompt !== null;
  }

  async install() {
    if (!this._deferredPrompt) return false;
    const prompt = this._deferredPrompt;
    this._deferredPrompt = null;
    this._notify();
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    return outcome === 'accepted';
  }

  _notify() {
    this._listeners.forEach(cb => cb(this.canInstall()));
  }
}
