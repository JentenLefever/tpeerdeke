// Deploy-hulp: pakt deploy-bundle.json (pad -> base64) uit vóór de build, zodat een deploy in één API-call kan.
// Zonder bundel (lokaal) doet dit niets.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const f = 'deploy-bundle.json';
if (existsSync(f)) {
  const b = JSON.parse(readFileSync(f, 'utf8'));
  for (const [p, d] of Object.entries(b)) {
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, Buffer.from(d, 'base64'));
  }
  console.log('deploy-bundle: ' + Object.keys(b).length + ' bestanden');
}
