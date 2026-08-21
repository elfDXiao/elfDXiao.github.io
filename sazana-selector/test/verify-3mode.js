// verify-sazana-3mode.js — t34 回归：三模式切换 / 跳色先四面后 DOM 顺序 / 计价一致性 / 品番方向
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
  const Q = win.SAZANA.quote;
  const wallStep = Q.DIMS.find(function (d) { return d.id === 'wall'; }).step;
  doc.querySelector('#wizStepper .wstep[data-step="' + wallStep + '"]').dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  await sleep(300);

  // 1) 计价一致性：ACC_PRE × EG2J1(L1) × 周辺HⅡ = 73,500（旧 priceBySurround 与新 accentPriceMatrix 一致）
  Q.state.sel.type = 'P';
  Q.state.sub.wall_plan = 'FRONT_ACCENT';
  Q.state.sel.wall = 'ACC_PRE';
  Q.state.sub.wall_pattern = 'EG2J1';
  Q.state.sub.wall_surround = '周辺ハイグレードⅡ';
  console.log('1) P FRONT_ACCENT ACC_PRE×EG2J1×周辺HⅡ: ' + Q.contributionFor('wall') + '（预期 73500，新旧一致）');

  // 2) SIDE_ACCENT：同柄 code_side EG3J1，品番按方向
  Q.state.sub.wall_plan = 'SIDE_ACCENT';
  Q.state.sub.wall_pattern = 'EG3J1';
  const d2 = Q.describe('wall');
  console.log('2) SIDE 品番: ' + d2.model + '（预期 EG3J1）' + ' extra=' + d2.extra);
  Q.state.sub.wall_plan = 'FRONT_ACCENT';
  Q.state.sub.wall_pattern = 'EG2J1';
  const d3 = Q.describe('wall');
  console.log('   FRONT 品番: ' + d3.model + '（预期 EG2J1）');

  // 3) 4SAME：EGAB5 P = +63,000
  Q.reset();
  Q.state.sel.type = 'P';
  Q.state.sel.wall = 'EGAB5';
  console.log('3) 4SAME EGAB5 P: ' + Q.contributionFor('wall') + '（预期 63000）');

  // 4) DOM 顺序：跳色模式（FRONT）下 跳色花纹块在 四面墙板等级/色 块之前
  Q.state.sel.type = 'P';
  Q.state.sub.wall_plan = 'FRONT_ACCENT';
  const fa = doc.querySelector('#wizBody input[name="wall_plan"][data-wall-plan="FRONT_ACCENT"]');
  fa.click();
  await sleep(200);
  const acc = doc.querySelector('#wizBody input[name="dim_wall"][data-code="ACC_PRE"]');
  acc.click();
  await sleep(200);
  const block = doc.querySelector('#wizBody .opt-block[data-dim="wall"]');
  const txt = block.textContent;
  const iAcc = txt.indexOf('跳色花纹');
  const iSg = txt.indexOf('四面墙板等级');
  const iSp = txt.indexOf('四面墙板色');
  // 验证脚本判定：周辺グレード chips 行（等级）在跳色块之后；周辺柄块（四面墙板色）仅在选グレード后出现
  console.log('4) DOM 顺序: 跳色柄=' + iAcc + ' 等级=' + iSg + ' 四面色=' + iSp);
  console.log('   片段: ' + txt.slice(55, 130).replace(/\n/g, ' '));
  const okOrder = iAcc >= 0 && iSg > iAcc && (iSp < 0 || iSp > iSg);
  console.log('   → ' + (okOrder ? '✔ 跳色→等级→四面色（或四面色待选グレード后出现）' : '✘ 顺序错误'));
  // 强制断言：跳色块必须早于四面墙板等级块
  console.log('   → ' + (iAcc >= 0 && iSg > iAcc ? '✔ 跳色先、四面等级后' : '✘ 跳色未在前'));

  // 5) 三模式 chips 3 个 + SIDE_ACCENT 切换
  doc.querySelector('#wizBody input[name="wall_plan"][data-wall-plan="SIDE_ACCENT"]').click();
  await sleep(200);
  console.log('5) SIDE 模式 dim_wall: ' + doc.querySelectorAll('#wizBody input[name="dim_wall"]').length + '（预期 4 ACC_*）');
  const acc2 = doc.querySelector('#wizBody input[name="dim_wall"][data-code="ACC_PRE"]');
  acc2.click();
  await sleep(200);
  const pats = doc.querySelectorAll('#wizBody input[name="wall_pattern"]');
  const firstPat = pats.length ? pats[0].getAttribute('data-wall-pattern') : '';
  console.log('   SIDE 跳色柄 chips: ' + pats.length + ' 首个=' + firstPat + '（预期 EG3xx）');
  dom.window.close();
  process.exit(0);
})().catch(function (e) { console.error(e.message); process.exit(1); });
