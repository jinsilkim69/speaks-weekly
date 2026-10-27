import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {validateOfficialDirectory} from '../scripts/official-links.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/official-links.json',import.meta.url),'utf8')),programs=JSON.parse(fs.readFileSync(new URL('../data/programs.json',import.meta.url),'utf8')).programs;
test('official directory rejects rewritten titles, foreign URLs, duplicate entries and guessed broadcast days',()=>{
 assert.equal(validateOfficialDirectory(data,programs),data);
 for(const change of [d=>d.entries[0].title+=' 편집',d=>d.entries[0].url='https://example.com/',d=>d.entries.push(d.entries[0]),d=>d.entries[0].displayDate='2026-01-01',d=>d.entries[0].videoUrl='javascript:alert(1)']){const copy=structuredClone(data);change(copy);assert.throws(()=>validateOfficialDirectory(copy,programs));}
});
