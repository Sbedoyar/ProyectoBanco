import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

// Scope of this feature: presentation changes must not alter the banking implementation.
const baseline=JSON.parse(readFileSync(new URL('./invariants.json',import.meta.url),'utf8'));
for(const {file,sha256} of baseline){
  const actual=createHash('sha256').update(readFileSync(resolve(file))).digest('hex');
  if(actual!==sha256)throw new Error(`Presentation boundary violated: ${file}`);
}
console.log(`Presentation boundary: ${baseline.length} backend and banking-logic files unchanged.`);
