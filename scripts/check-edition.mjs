import fs from 'node:fs';
import path from 'node:path';
import {fixtureEdition} from '../tests/fixtures/edition.mjs';
import {buildEdition} from './build-edition.mjs';
const root=path.resolve(import.meta.dirname,'..');
const result=await buildEdition(root,fixtureEdition(),{testOnly:true});
console.log(JSON.stringify(result,null,2));
fs.writeFileSync(path.join(root,'output/pdf/integration-proof/result.json'),JSON.stringify(result,null,2));
