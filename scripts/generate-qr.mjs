// Gera o QR code de compartilhamento do app, em SVG, a partir da SHARE_URL.
// Uso: node scripts/generate-qr.mjs
//
// O QR é pré-gerado e commitado, em vez de desenhado em runtime, por três
// motivos: nenhuma dependência chega ao navegador, o arquivo entra no precache
// do service worker (o `globPatterns` já cobre `svg`) e aparece offline — que é
// o cenário de uso, mostrar o código para alguém dentro de uma loja sem sinal.
//
// A URL é LIDA de constants.ts, não repetida aqui: se as duas divergissem, o QR
// levaria a um lugar e o botão de copiar a outro, sem ninguém perceber.
import QRCode from 'qrcode';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const constantes = readFileSync(resolve('constants.ts'), 'utf8');
const achado = constantes.match(/export const SHARE_URL = '([^']+)'/);
if (!achado) throw new Error('SHARE_URL não encontrada em constants.ts');
const url = achado[1];

// Correção M: a URL tem 39 bytes e cabe na versão 3 (29x29) com folga. Não há
// logo sobreposto no centro — isso exigiria o nível H sem ganho nenhum de
// leitura, e este QR é escaneado por câmeras de celular barato.
let svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,          // quiet zone: sem ela muitos leitores falham
  color: { dark: '#000000', light: '#ffffff' },
});

// O `<desc>` é o que torna o arquivo verificável: um QR é ilegível em diff, e
// sem isso trocar de domínio sem regerar o código passaria despercebido até um
// usuário reclamar. O `tests/share.test.tsx` compara este texto com SHARE_URL.
svg = svg
  .replace(/<\?xml[^>]*\?>\s*/, '')
  .replace(/(<svg\b[^>]*>)/, `$1<desc>${url}</desc>`)
  .trim();

writeFileSync(resolve('public/qr-share.svg'), svg + '\n');
console.log('ok qr-share.svg →', url);
