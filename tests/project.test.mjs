import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { validateIssue, synchronizePages } from '../scripts/issue-storage.mjs';
import * as visuals from '../public/js/qr-generator.js';
import qrcode from '../public/js/vendor/qrcode.mjs';
import jsQR from 'jsqr';

const root = path.resolve(import.meta.dirname, '..');
const original = JSON.parse(fs.readFileSync(path.join(root, 'data/current_issue.json'), 'utf8'));

test('QR encodes a timestamped URL that an independent decoder can read', () => {
  const url = 'https://www.youtube.com/watch?v=v6awNopN5n4&t=865s';
  const qr = qrcode(0, 'M'); qr.addData(url); qr.make();
  const size = (qr.getModuleCount() + 8) * 6;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const row = Math.floor(y / 6) - 4, col = Math.floor(x / 6) - 4;
    if (row >= 0 && col >= 0 && row < qr.getModuleCount() && col < qr.getModuleCount() && qr.isDark(row, col)) {
      const offset = (y * size + x) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
    }
  }
  assert.equal(jsQR(pixels, size, size)?.data, url);
  assert.ok(visuals.generateQrSvg(url).includes(qr.createSvgTag({cellSize: 2, margin: 8, scalable: true}).split('>')[1]));
});

test('browser modules reference existing named exports', () => {
  for (const name of ['admin', 'main', 'magazine']) {
    const source = fs.readFileSync(path.join(root, `public/js/${name}.js`), 'utf8');
    const match = source.match(/import\s*\{([^}]+)\}\s*from '\.\/qr-generator.js'/);
    for (const key of match[1].split(',').map(s => s.trim()).filter(Boolean)) assert.ok(key in visuals, `${name}: ${key}`);
  }
  assert.match(visuals.generateQrSvg('https://www.youtube.com/watch?v=abc&t=865s'), /<svg/);
  assert.match(visuals.generatePollChartSvg({labels:['1주','2주'],datasets:[{label:'테스트',data:[1,2]}]}), /polyline/);
});

test('issue structure and article/page synchronization', () => {
  validateIssue(original);
  assert.throws(() => validateIssue({}), /50페이지/);
  const next = structuredClone(original);
  const a = next.articles[3];
  a.title = '수정한 제목'; a.lead = '수정한 리드';
  synchronizePages(original, next);
  assert.equal(next.pages[a.startPage - 1].title, '수정한 제목');
  assert.ok(next.pages.some(p => p.paragraphs?.includes('수정한 리드')));
});

test('isolated pipeline, static export and HTTP save/error handling', async () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'speaks-test-'));
  let child;
  try {
    for (const item of ['server.mjs', 'package.json', 'scripts', 'public', 'data']) {
      fs.cpSync(path.join(root, item), path.join(sandbox, item), { recursive: true, filter:src=>!path.basename(src).startsWith('.youtube-temp-') && path.basename(src)!=='.editorial.lock' });
    }
    // Cleanup must preserve source material not owned by the pipeline.
    fs.writeFileSync(path.join(sandbox, 'data/transcript.txt'), 'user transcript');
    execFileSync(process.execPath, ['scripts/run-pipeline.mjs', '--demo'], { cwd: sandbox });
    assert.equal(fs.readFileSync(path.join(sandbox, 'data/transcript.txt'), 'utf8'), 'user transcript');
    assert.ok(!fs.readdirSync(path.join(sandbox, 'data')).some(f => f.startsWith('.youtube-temp-')));
    validateIssue(JSON.parse(fs.readFileSync(path.join(sandbox, 'data/current_issue.json'), 'utf8')));
    execFileSync(process.execPath, ['scripts/export-static.mjs'], { cwd: sandbox });
    assert.ok(fs.existsSync(path.join(sandbox, 'dist/js/vendor/qrcode.mjs')));
    child = spawn(process.execPath, ['server.mjs'], { cwd: sandbox, env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'] });
    const ready = await new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => reject(new Error('Server startup timeout')), 10000);
      child.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:(\d+)\//);
        if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
      });
      child.on('error', reject);
    });
    const base = `http://127.0.0.1:${ready}`;
    for (const endpoint of ['/', '/magazine', '/admin', '/api/issue', '/js/vendor/qrcode.mjs']) assert.equal((await fetch(base + endpoint)).status, 200);
    const published=JSON.parse(fs.readFileSync(path.join(sandbox,'data/editions.json'),'utf8')).issues.find(i=>i.status==='published');
    const weekly=await fetch(base+'/api/editions/'+published.id+'.json');assert.equal(weekly.status,200);assert.equal((await weekly.json()).articleSnapshots.length,14);
    const pdf=await fetch(base+published.pdfUrl);assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');assert.ok((await pdf.arrayBuffer()).byteLength>100000);
    assert.equal((await fetch(base+'/api/editions/missing.json')).status,404);
    const post = (body, headers = {}) => fetch(base + '/api/issue/save', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body });
    assert.equal((await post('{')).status, 400);
    assert.equal((await post('null')).status, 400);
    assert.equal((await post('{"issue":{}}')).status, 400);
    assert.equal((await post('{}', { Origin: 'https://example.com' })).status, 403);
    assert.equal((await fetch(base + '/%2e%2e%5cpackage.json')).status, 403);
    const issue = await (await fetch(base + '/api/issue')).json();
    issue.articles[3].title = 'API 저장 검증';
    assert.equal((await post(JSON.stringify({ issue }))).status, 200);
    const saved = await (await fetch(base + '/api/issue')).json();
    assert.equal(saved.pages[10].title, 'API 저장 검증');
  } finally {
    if (child && child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
});
