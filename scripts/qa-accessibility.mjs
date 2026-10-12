import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const url = process.env.QA_URL || 'http://127.0.0.1:4173/ImpostorGame/';
import { chromium } from 'playwright';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(url);await p.waitForSelector('[data-game="twit"]');
for(const screen of ['catalog','impostor','bomb','who-am-i','twit','stats','player','rules']) {
 if(['impostor','bomb','who-am-i','twit'].includes(screen)) {await p.goto(url+'#game/'+screen);await p.waitForSelector('[data-action="start"]');}
 if(screen==='stats'){await p.goto(url+'#stats');await p.waitForSelector('.stats-screen');}
 if(screen==='player'){await p.goto(url+'#game/impostor');await p.click('[data-action="add"]');}
 if(screen==='rules'){await p.keyboard.press('Escape');await p.click('[data-action="rules"]');}
 await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
 assert.deepEqual(r.violations, [], `${screen} accessibility violations`);
 console.log(screen, JSON.stringify(r.violations.map(v=>({id:v.id, nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
}
await b.close();
