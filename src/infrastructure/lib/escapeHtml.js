/**
 * Escape central para todo texto vindo de dados que entra em innerHTML.
 * Números formatados não precisam; nomes, siglas e rótulos sempre passam por aqui.
 */
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
