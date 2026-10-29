/**
 * Ligação com o app Auditoria das Urnas (projeto 8.3, publicado no próprio endereço): logs, boletins e
 * Registro Digital do Voto de cada urna. Os dois projetos usam o código de município do TSE; o painel leva
 * o usuário ao app já nos locais de votação do município (ou da zona), pelo endereço #locais=UF/município/zona.
 */
export const AUDITORIA_URL = 'https://celsoalmeidalf.github.io/auditoria-urnas-2026/';

/** @param {string} chave "UF-código TSE" (ex.: "RR-3000"), como o painel identifica o município */
export function linkAuditoria(chave, zona) {
  const [uf, cd] = String(chave).split('-');
  if (!uf || !cd) return AUDITORIA_URL;
  return `${AUDITORIA_URL}#locais=${uf}/${cd.padStart(5, '0')}${zona ? `/${zona}` : ''}`;
}
