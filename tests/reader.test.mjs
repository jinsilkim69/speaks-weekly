import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import * as visuals from '../public/js/qr-generator.js';

test('every article button opens a nonempty reader, including the cover', async () => {
  const html = fs.readFileSync(new URL('../public/legacy-preview.html', import.meta.url), 'utf8');
  const issue = JSON.parse(fs.readFileSync(new URL('../data/current_issue.json', import.meta.url), 'utf8'));
  const dom = new JSDOM(html, { url: 'https://example.com/', runScripts: 'outside-only' });
  try {
    Object.assign(dom.window, visuals);
    dom.window.fetch = async url => ({ ok: true, json: async () => url.includes('live-feed') ? {items:[]} : issue });
    const source = fs.readFileSync(new URL('../public/js/main.js', import.meta.url), 'utf8').replace(/import\s*\{[^}]+\}\s*from[^;]+;/, '');
    dom.window.eval(source);
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.ok(dom.window.document.querySelector('.issue-number-badge'), 'bottom section renders without throwing');
    const triggers = [...dom.window.document.querySelectorAll('[data-open-idx]')];
    assert.ok(triggers.length > 10);
    for (const trigger of triggers) {
      trigger.click();
      assert.equal(dom.window.document.querySelector('#reader-modal').getAttribute('aria-hidden'), 'false');
      assert.ok(dom.window.document.querySelector('.reader-body-text').textContent.trim().length > 100);
      dom.window.document.querySelector('#close-modal-btn').click();
    }
  } finally { dom.window.close(); }
});

test('ebook renders all planned pages and uses real article titles in its table of contents', async () => {
  const html = fs.readFileSync(new URL('../public/magazine.html', import.meta.url), 'utf8');
  const issue = JSON.parse(fs.readFileSync(new URL('../data/current_issue.json', import.meta.url), 'utf8'));
  const dom = new JSDOM(html, {url:'https://example.com/magazine?p=11',runScripts:'outside-only'});
  try {
    Object.assign(dom.window, visuals);
    dom.window.fetch = async () => ({ok:true,json:async()=>issue});
    const source = fs.readFileSync(new URL('../public/js/magazine.js', import.meta.url),'utf8').replace(/import\s*\{[^}]+\}\s*from[^;]+;/g,'');
    dom.window.eval(source);
    await new Promise(resolve=>setTimeout(resolve,30));
    assert.equal(dom.window.document.querySelectorAll('.mag-page').length,50);
    assert.ok(dom.window.document.querySelector('#toc-list-container').textContent.includes(issue.articles[3].title));
    assert.ok(dom.window.document.querySelector('#page-item-10').textContent.includes(issue.articles[3].lead));
  } finally { dom.window.close(); }
});
