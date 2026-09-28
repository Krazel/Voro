// Deterministic natural-feeding pilot, forked from the full-campaign integration test.
import assert from 'node:assert/strict';
import {writeFileSync,readFileSync} from 'node:fs';
import {makeEngine} from '../tests/engine-fixture.mjs';
import {FINALE_SECONDS} from '../app/universe-finale.mjs';
import {newJourney,journeyLife} from '../app/journey-progress.mjs';
import {JourneyWorld} from '../app/journey-world.mjs';
import {STAGES,SPECIES_BY_ID,isDanger} from '../app/journey-data.mjs';
import {CAMPAIGN_PACING} from '../app/campaign-pacing.mjs';
if(process.env.VORO_PACING_COEFFICIENTS)for(const [id,v]of Object.entries(JSON.parse(process.env.VORO_PACING_COEFFICIENTS)))CAMPAIGN_PACING[id].biomass=v;
function fresh(stage=0,seed=41){const f=makeEngine(),g=f.game;g.progress=newJourney(seed);g.progress.stage=stage;g.life=journeyLife(g.progress);g.world=new JourneyWorld(seed,[],stage);g.seed();g.action('start');while(g.birth>0){let dt=Math.min(g.birth,1/60);g.time+=dt;g.update(dt);}return f;}
function step(g,n=1,render=false){for(let i=0;i<n;i++){g.time+=1/30;g.update(1/30);if(render)g.render();}}
let report;const originalLog=console.log;console.log=(...a)=>{originalLog(...a);if(a[0]==='Journey result')report=JSON.parse(a[1]);};
  const { game: g } = fresh(0, Number(process.argv[3]||41));
  let target = null,
    previous = -1;
  const timings = [];
  let deaths = 0;
  for (let frame = 0; frame < 30 * 7200 && !g.progress.completed; frame++) {
    if (g.life.dead) {
      deaths++;
      console.log(
        'Death in ' +
          STAGES[g.progress.stage].id +
          ' at ' +
          Math.round(g.life.elapsed) +
          ' s',
      );
      assert.ok(deaths < 3, 'too many deaths');
      g.action('retry');
      target = null;
    }
    if (g.progress.stage !== previous) {
      previous = g.progress.stage;
      target = null;
      timings.push({
        stage: STAGES[previous].id,
        at: Math.round(g.progress.totalTime),
      });
      console.log(
        'Entered ' +
          STAGES[previous].id +
          ' at ' +
          Math.round(g.progress.totalTime) +
          ' s',
      );
    }
    if (g.progress.offer.length) {
      const order = [
        'yield',
        'speed',
        'digest',
        'slots',
        'shield',
        'pull',
        'tentacleReach',
        'tentacles',
        'combo',
        'reach',
        'dash',
        'turn',
        'recycle',
        'spikes',
      ];
      g.choose(
        order.find((id) => g.progress.offer.includes(id)) ||
          g.progress.offer[0],
      );
    }
    const p = g.life;
    if (!target || target.eaten || frame % 30 === 0) {
      const enemies = g.world.entities.filter(
        (e) =>
          !e.eaten &&
          e.requiredMass > p.biomass &&
          isDanger(SPECIES_BY_ID[e.kind]),
      );
      const score = (e) => {
        let score = Math.hypot(e.x - p.x, e.y - p.y);
        for (const other of enemies) {
          const d = Math.hypot(e.x - other.x, e.y - other.y),
            danger = p.radius + other.r + 90;
          if (d < danger) score += (danger - d) * 5;
        }
        return score;
      };
      const eligible = g.world.entities.filter(
        (e) => !e.eaten && e.requiredMass <= p.biomass,
      );
      target =
        eligible.find((e) => e.final) ||
        eligible.sort((a, b) => score(a) - score(b))[0];
    }
    if (target && !g.transition) {
      const dx = target.x - p.x,
        dy = target.y - p.y,
        len = Math.max(1, Math.hypot(dx, dy));
      let x = dx / len,
        y = dy / len;
      for (const enemy of g.world.entities) {
        if (
          enemy.eaten ||
          enemy.requiredMass <= p.biomass ||
          !isDanger(SPECIES_BY_ID[enemy.kind])
        )
          continue;
        const ex = p.x - enemy.x,
          ey = p.y - enemy.y,
          d = Math.max(1, Math.hypot(ex, ey)),
          safe = p.radius + enemy.r + 120;
        if (d < safe) {
          const avoid = 3 * (1 - d / safe);
          x += (ex / d) * avoid;
          y += (ey / d) * avoid;
          if (d < safe - 65) g.action('dash');
        }
      }
      if (Math.hypot(x, y) < 0.4) {
        const a = Math.atan2(dy, dx) + Math.PI / 2;
        x = Math.cos(a);
        y = Math.sin(a);
      }
      for (const b of g.world.projectiles) {
        const bx = p.x - b.x,
          by = p.y - b.y,
          bd = Math.max(1, Math.hypot(bx, by));
        if (bd < p.radius + 70 && p.biomass < b.edibleAt) {
          x += (-b.vy / Math.max(1, Math.hypot(b.vx, b.vy))) * 1.2;
          y += (b.vx / Math.max(1, Math.hypot(b.vx, b.vy))) * 1.2;
        }
      }
      g.padInput = { x, y };
    } else g.padInput = { x: 0, y: 0 };
    step(g);
    if (frame % 600 === 0) g.render();
  }
  assert.equal(g.progress.completed, true, 'full campaign finished');
  assert.equal(g.progress.stage, 9);
  assert.equal(g.life.finalEaten, true);
  assert.deepEqual(
    timings.map((t) => t.stage),
    STAGES.map((s) => s.id),
  );
  step(g, Math.ceil(FINALE_SECONDS * 30) + 1, true);
  g.publish();
  assert.equal(g.ending, 0);
  assert.equal(g.progress.offer.length, 0);
  const position = g.life.x;
  g.action('dash');
  step(g, 10);
  assert.equal(g.life.x, position);
  console.log(
    'Journey result',
    JSON.stringify({
      timings,
      seconds: Math.round(g.progress.totalTime + g.life.elapsed),
      deaths,
      upgrades: g.progress.level,
    }),
  );
  g.destroy();
writeFileSync('design/quality-pacing-2026-09-28/pacing-'+(process.argv[2]||'candidate')+'.json',JSON.stringify({...report,coefficients:CAMPAIGN_PACING,assumption:'Efficient deterministic pilot, 30Hz simulation, immediate choices; multiply by 30min/16.53min as tentative human reference'},null,2));
