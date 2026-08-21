// debug-sazana-dom.js — 模拟 dom-test 跳色流程
const path = require('path');
const { JSDOM } = require(path.join('D:/DSH工作区/rakuviac-bathroom/scripts/node_modules', 'jsdom'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async function () {
  const dom = await JSDOM.fromFile(path.join('D:/DSH工作区/toto-sazana/web', 'index.html'), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true });
  const win = dom.window, doc = win.document;
  for (let i = 0; i < 40; i++) {
    if (win.SAZANA && win.SAZANA.wizard && doc.querySelectorAll('#wizStepper .wstep').length > 0) break;
    await sleep(150);
  }
  // 进入 wall step
  const wallStep = win.SAZANA.quote.DIMS.find(function (d) { return d.id === 'wall'; }).step;
  doc.querySelector('#wizStepper .wstep[data-step="' + wallStep + '"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await sleep(300);
  console.log('默认 wall_plan chips: ' + doc.querySelectorAll('#wizBody input[name="wall_plan"]').length);
  console.log('默认 dim_wall: ' + doc.querySelectorAll('#wizBody input[name="dim_wall"]').length);
  // 点击 FRONT_ACCENT
  const fa = doc.querySelector('#wizBody input[name="wall_plan"][data-wall-plan="FRONT_ACCENT"]');
  console.log('FRONT_ACCENT chip: ' + !!fa);
  fa.click();
  await sleep(300);
  console.log('点击后 sub.wall_plan: ' + win.SAZANA.quote.state.sub.wall_plan);
  console.log('点击后 dim_wall: ' + doc.querySelectorAll('#wizBody input[name="dim_wall"]').length);
  console.log('wizBody head: ' + doc.querySelector('#wizBody').textContent.slice(0, 150).replace(/\n/g, ' '));
  // 点击 ACC_PRE
  const acc = doc.querySelector('#wizBody input[name="dim_wall"][data-code="ACC_PRE"]');
  console.log('ACC_PRE: ' + !!acc);
  if (acc) {
    acc.click();
    await sleep(300);
    console.log('ACC_PRE 后 wall_surround chips: ' + doc.querySelectorAll('#wizBody input[name="wall_surround"]').length);
    console.log('wall_pattern chips: ' + doc.querySelectorAll('#wizBody input[name="wall_pattern"]').length);
    const wb = doc.querySelector('#wizBody');
    console.log('wall body: ' + wb.textContent.slice(0, 300).replace(/\n/g, ' '));
  }
  dom.window.close();
  process.exit(0);
})().catch(function (e) { console.error(e.message); process.exit(1); });
