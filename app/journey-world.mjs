import {
  POPULATION_PLANS,
  populationWeight,
  shoreAllows,
  constrainToShore,
} from './population.mjs';
import { MicroWorld, makeEntity, TILE } from './micro-world.mjs';
import { animalTarget } from './animal-steering.mjs';
import { decoyTarget } from './organic-decoy.mjs';
import { advanceRepulsion } from './contact-repulsion.mjs';
import { random, clamp } from './simulation.mjs';
import { projectileThreatMass } from './threat-scale.mjs';
import { cityLots, cityPlacement, constrainCity, cityDistrict, cityAllowsSpecies, cityBounds, cityOverlap, CITY_PLOTS } from './city-layout.mjs';
import { ORBITAL_EARTH } from './earth-landmark.mjs';
import {
  STAGE_SPECIES,
  STAGES,
  SPECIES_BY_ID,
  isDanger,
  stageStartMass,
} from './journey-data.mjs';
export function journeyEntity(s, x, y, seed, id) {
  const e = makeEntity(s, x, y, seed, id);
  e.final = s.kind === 'final';
  e.shotClock = 1.2 + (seed % 1) * 2;
  e.attack = 0;
  if (s.fixedHeading !== undefined) e.heading = s.fixedHeading;
  return e;
}
export class JourneyWorld extends MicroWorld {
  constructor(seed = 1834, journal = [], stage = 0) {
    super(seed, journal);
    this.stage = stage;
    this.projectiles = [];
    this.finalSpawned = false;
    this.finalEntity = null;
  }
  generate(cx, cy, time) {
    if (this.stage === 0) {
      const chunk = super.generate(cx, cy, time);
      const matter = STAGE_SPECIES[0].filter((s) => s.edibleMatter);
      chunk.entities = chunk.entities.map((e) => {
        // Keep nutrients and predators, and replace only existing food slots.
        if (e.kind === 'nutrient' || isDanger(SPECIES_BY_ID[e.kind])) return e;
        const rng = random(Math.floor(e.seed * 100000) ^ this.seed ^ 91827);
        if (rng() >= 0.35) return e;
        const pool =
          e.requiredMass <= stageStartMass(0)
            ? matter.filter((s) => s.r <= 15)
            : matter;
        return journeyEntity(
          pool[Math.floor(rng() * pool.length)],
          e.x,
          e.y,
          e.seed,
          e.id,
        );
      });
      return chunk;
    }
    let depleted = false;
    const list = STAGE_SPECIES[this.stage].filter(
      (s) => s.kind !== 'final' && !s.variantOf && !s.unique && !s.building &&
        (STAGES[this.stage].id!=='city'||cityAllowsSpecies(s,cityDistrict(cx,cy,this.seed))),
    );
    const small = list.filter(
        (s) =>
          journeyEntity(s, 0, 0, 0, 'starter').requiredMass <=
            stageStartMass(this.stage) && !isDanger(s) && s.id !== 'city-5',
      ),
      medium = list.filter((s) => !small.includes(s) && !isDanger(s)),
      danger = list.filter(isDanger);
    const hunters = danger.filter(s => s.kind === 'hunter');
    const hazards = danger.filter(s => s.kind !== 'hunter');
    const pondSmall = small.filter(s => !s.edibleMatter && s.id !== 'pond-0');
    const pondLarge = medium.filter(s => !s.edibleMatter && s.id !== 'pond-0');
    const rng = random(
        (this.seed ^
          Math.imul(cx | 0, 73856093) ^
          Math.imul(cy | 0, 19349663) ^
          Math.imul(this.stage, 917731)) >>>
          0,
      ),
      entities = [],
      occupied = STAGES[this.stage].id === 'planets' && cx === 1 && cy === 2
        ? [{ x: 700, y: 1270, r: SPECIES_BY_ID.earth.r }] : [],
      motes = [];
    const stageId = STAGES[this.stage].id,
      plan = POPULATION_PLANS[stageId];
    const weight = (s) => populationWeight(s, stageId, list);
    const pick = (arr) => {
      let roll = rng() * arr.reduce((n, s) => n + weight(s), 0);
      return arr.find((s) => (roll -= weight(s)) < 0) || arr.at(-1);
    };
    const [starters, plannedForage, threats] = plan.slots;
    const lots = stageId === 'city' ? cityLots(cx, cy, this.seed) : [];
    const cityOccupied=[];
    const forage = plannedForage - lots.length;
    for (const lot of lots) {
      const id = `city-lot:${cx}:${cy}:${lot.slot}`;
      const e = journeyEntity(SPECIES_BY_ID[lot.kind],lot.x,lot.y,rng()*6.28,id);
      occupied.push({x:e.x,y:e.y,r:e.r});
      const plot=CITY_PLOTS[lot.slot];
      cityOccupied.push({x:cx*600+plot.x,y:cy*600+plot.y,w:plot.w,h:plot.h});
      if ((this.journal.get(id)||0)>time) depleted=true;
      else entities.push(e);
    }
    const recovery = [...small].sort((a, b) => a.r - b.r)[0];
    const originalSlots=starters+forage+threats;
    const forageStart = originalSlots + (plan.extraSmall || 0);
    const slots = Array.from({length:forageStart+(plan.extraForage?.length||0)},(_,i)=>i);
    // Reserve room for the large stellar threat before placing surrounding
    // stars. Otherwise the enlarged accretion disc could never fit anywhere.
    if (stageId === 'stars') slots.unshift(...slots.splice(starters+forage));
    for (const i of slots) {
      let pool =
        i < starters ? small : i < starters + forage ? medium : danger;
      // Preserve the original thirteen slots and their IDs/RNG sequence. Add
      // peaceful animals after them; never turn the extra density into weeds
      // or additional hunters, and keep consumed slots stable across saves.
      if(stageId==='pond')pool=i<7?small:i<12?medium:i===12?danger:i<19?pondSmall:pondLarge;
      if (stageId === 'water' && i >= starters + forage)
        pool = i === starters + forage ? hunters : hazards;
      // One civilian car replaces a forage slot; never add population on top
      // of the existing budget or let random starter picks flood the roads.
      if (stageId === 'city') pool = pool.filter(s => s.id !== 'city-5');
      const pedestrians = plan.pedestrians || 0;
      // Append one extra small object after the existing slots so old objects,
      // journal IDs and random placement remain unchanged. Its modest radius
      // keeps the art readable and its normal size-based eating rule intact.
      const extraSmall=i>=originalSlots && i<forageStart;
      // Append intermediate food after all existing slots, preserving old RNG
      // placement and consumed IDs. These bounded sizes bridge the early gap.
      const extraForage=plan.extraForage?.[i-forageStart];
      const s = extraForage ? {...SPECIES_BY_ID[extraForage.id],...extraForage}
        : extraSmall ? {...pick(small),r:12,sizeFactors:[.85,1.15]}
        : i < pedestrians ? SPECIES_BY_ID[i % 7 === 0 ? 'city-0' : 'city-civilian-'+((i + Math.abs(cx*3+cy)) % 6)]
        : stageId === 'city' && i === starters ? SPECIES_BY_ID['city-5']
        : i === pedestrians ? recovery : pick(pool.length ? pool : list);
      const seed = rng() * 6.28,
        id = `${cx}:${cy}:${i}`;
      const candidate = journeyEntity(s, 0, 0, seed, id);
      const margin = Math.max(40, Math.min(220, candidate.r * 1.1 + 8));
      let cityAxis;
      let x = 0,
        y = 0,
        placed = false;
      for (let attempt = 0; attempt < 10; attempt++) {
        x = cx * TILE + margin + rng() * (TILE - 2 * margin);
        y = cy * TILE + margin + rng() * (TILE - 2 * margin);
        if (stageId === 'city') {
          const pos = cityPlacement(s,x,y,cx,cy,candidate.r,this.seed);
          if(!pos)continue;
          x=pos.x; y=pos.y; cityAxis=pos.axis;
          if(s.motion!=='rotor' && cityOccupied.some(b=>cityOverlap(b,cityBounds(s,{x,y,r:candidate.r}))))continue;
        }
        if (stageId === 'land' && !shoreAllows(s, x, y, candidate.r)) continue;
        if (
          occupied.some(
            (e) =>
              Math.hypot(e.x - x, e.y - y) < 0.9 * (e.r + candidate.r) + 12,
          )
        )
          continue;
        placed = true;
        break;
      }
      if (!placed) continue;
      // Consumed slots also reserve their geometry until regeneration, so eating
      // one object never moves or rerolls neighbouring objects on chunk reload.
      occupied.push({ x, y, r: candidate.r });
      if(stageId==='city'&&s.motion!=='rotor')cityOccupied.push(cityBounds(s,{x,y,r:candidate.r}));
      if (isDanger(s) && Math.hypot(x - 700, y - 970) < 310 + Math.max(0,candidate.r-150)) continue;
      if ((this.journal.get(id) || 0) > time) { depleted = true; continue; }
      const inhabitant =
        s.id === 'water-14' && seed >= Math.PI ? SPECIES_BY_ID['water-16'] : s;
      const entity = journeyEntity(inhabitant, x, y, seed, id);
      if (cityAxis) { entity.cityAxis=cityAxis; entity.heading=cityAxis==='x'?0:Math.PI/2; }
      entities.push(entity);
    }
    if (cx === 1 && cy === 1)
      for (let i = 0; i < 7; i++) {
        const id = `first:${i}`;
        const consumed=(this.journal.get(id) || 0) > time;
        if (consumed) { depleted = true; if(stageId!=='city')continue; }
        const a = i * 2.399,
          d = 105 + i * 20;
        const s=small[i % small.length];
        const e=journeyEntity(
            s,
            700 + Math.cos(a) * d,
            970 + Math.sin(a) * d,
            i,
            id,
          );
        if(stageId==='city') {
          let placed=false;
          for(let attempt=0;attempt<10;attempt++) {
            const pos=cityPlacement(s,cx*TILE+rng()*TILE,cy*TILE+rng()*TILE,cx,cy,e.r,this.seed);
            if(!pos)continue;
            const bounds=cityBounds(s,{...pos,r:e.r});
            if(cityOccupied.some(b=>cityOverlap(b,bounds)))continue;
            e.x=e.homeX=pos.x;e.y=e.homeY=pos.y;e.cityAxis=pos.axis;
            if(pos.axis)e.heading=pos.axis==='x'?0:Math.PI/2;
            // Reserve consumed arrival objects too, preserving neighbours.
            cityOccupied.push(bounds);placed=true;break;
          }
          if(!placed)continue;
        }
        if(!consumed)entities.push(e);
      }
    // Static street objects have their own RNG and stable IDs. Append them only
    // after arrival objects: existing people, buildings and threats never reroll.
    if(stageId==='city') {
      const streetRng=random((this.seed^Math.imul(cx,73856093)^Math.imul(cy,19349663)^0x51ee7)>>>0);
      for(const [slot,kind] of (plan.streetObjects||[]).entries()) {
        const id=`city-street:${cx}:${cy}:${slot}`,s=SPECIES_BY_ID[kind];
        const e=journeyEntity(s,0,0,streetRng()*6.28,id);
        for(let attempt=0;attempt<24;attempt++) {
          const pos=cityPlacement(s,cx*TILE+streetRng()*TILE,cy*TILE+streetRng()*TILE,cx,cy,e.r,this.seed);
          if(!pos)continue;
          const bounds=cityBounds(s,{...pos,r:e.r});
          if(cityOccupied.some(b=>cityOverlap(b,bounds)))continue;
          cityOccupied.push(bounds);
          e.x=e.homeX=pos.x;e.y=e.homeY=pos.y;
          if((this.journal.get(id)||0)>time)depleted=true;
          else entities.push(e);
          break;
        }
      }
    }
    if (stageId === 'land')
      for (const e of entities) constrainToShore(e, SPECIES_BY_ID[e.kind]);
    // One Earth at the arrival point. A consumed landmark remains consumed,
    // unlike renewable forage, including after chunk eviction and save/load.
    if (stageId === 'planets' && cx === 1 && cy === 2 && !this.journal.has('landmark:earth')) {
      entities.push(journeyEntity(SPECIES_BY_ID.earth, 700, 1270, 0, 'landmark:earth'));
    }
    for (let i = 0; i < 25; i++)
      motes.push({
        x: cx * TILE + rng() * TILE,
        y: cy * TILE + rng() * TILE,
        r: 0.4 + rng() * 1.4,
        phase: rng() * 6.28,
      });
    return { entities, motes, depleted };
  }
  /** @param {{left:number,right:number,top:number,bottom:number}|null} view */
  move(dt, time, p, stats, trail, view = null) {
    if (this.stage === 0) {
      super.move(dt, time, p, stats, trail);
      for (const e of this.entities) {
        const s = SPECIES_BY_ID[e.kind];
        if (s?.edibleMatter && !e.eaten) this.moveMatter(e, s, dt, time);
      }
      return;
    }
    for (const e of this.entities) {
      if (e.eaten) continue;
      const s = SPECIES_BY_ID[e.kind];
      if (!s) continue;
      if (e.repulsion && advanceRepulsion(e, dt, STAGES[this.stage].id === 'land'
        ? entity => constrainToShore(entity, s)
        : STAGES[this.stage].id === 'city' ? constrainCity : undefined)) continue;
      // Keep every entity resident and edible. Only suspend remote
      // motion outside the padded view and outside all attack/feeding reach.
      if (view && ['orbit','pond'].includes(STAGES[this.stage].id)
        && Math.hypot(e.x-p.x,e.y-p.y)>Math.max(460,p.radius*p.reachFactor+100)
        && (e.x+e.r<view.left || e.x-e.r>view.right || e.y+e.r<view.top || e.y-e.r>view.bottom)) continue;
      if (s.edibleMatter) {
        this.moveMatter(e, s, dt, time);
        continue;
      }
      e.escape = Math.max(0, (e.escape || 0) - dt);
      e.flash = Math.max(0, e.flash - dt * 2);
      e.attack = Math.max(0, (e.attack || 0) - dt * 2);
      const dx = p.x - e.x,
        dy = p.y - e.y,
        d = Math.hypot(dx, dy);
      if (d > 1100) continue;
      const edible = p.biomass >= e.requiredMass;
      const { x: tx, y: ty } = animalTarget(e, s, p, time, 340, 280, s.id==='orbit-0'?160:80);
      let speed = e.wound >= 1 ? 0 : s.speed;
      const step = Math.sin(time * (s.motion === 'insect' ? 16 : 8) + e.seed);
      if (s.motion === 'hop') speed *= 0.2 + 1.8 * Math.max(0, step);
      if (s.motion === 'squid') speed *= 0.5 + Math.max(0, step);
      if (
        stats.trailSlow &&
        trail.some((q) => Math.hypot(q.x - e.x, q.y - e.y) < q.r)
      )
        speed *= 1 - stats.trailSlow;
      const len = Math.max(1, Math.hypot(tx - e.x, ty - e.y));
      const oldX = e.x, oldY = e.y, distance = Math.min(len, speed * dt);
      e.x += ((tx - e.x) / len) * distance;
      e.y += ((ty - e.y) / len) * distance;
      e.x = clamp(e.x, e.homeX - 280, e.homeX + 280);
      e.y = clamp(e.y, e.homeY - 280, e.homeY + 280);
      if (STAGES[this.stage].id === 'land') constrainToShore(e, s);
      if (STAGES[this.stage].id === 'city') constrainCity(e);
      if (speed > 4 && Math.hypot(e.x - oldX, e.y - oldY) > 0.001) {
        const angle = Math.atan2(e.y - oldY, e.x - oldX);
        e.heading +=
          Math.atan2(Math.sin(angle - e.heading), Math.cos(angle - e.heading)) *
          Math.min(1, dt * 3);
      } else if (['spin', 'galaxy', 'cosmic'].includes(s.motion))
        e.heading += dt * (s.motion === 'spin' ? 0.06 : 0.025);
      if (s.kind === 'gravity' && !edible && d < 320 && d > 1) {
        p.x -= (dx / d) * (1 - d / 320) * 28 * dt;
        p.y -= (dy / d) * (1 - d / 320) * 28 * dt;
      }
      const aim=decoyTarget(e,s,p)||p, shotDx=aim.x-e.x, shotDy=aim.y-e.y,
        shotDistance=Math.hypot(shotDx,shotDy);
      if (s.shot && e.wound < 1 && shotDistance < 410 && shotDistance > aim.radius * 1.1) {
        e.shotClock = Math.max(0, (e.shotClock ?? s.shot.interval) - dt);
        if (e.shotClock === 0 && this.projectiles.length < 72) {
          e.shotClock = s.shot.interval;
          e.attack = 1;
          const angle = Math.atan2(shotDy, shotDx),
            v = s.shot.speed;
          this.projectiles.push({
            x: e.x + Math.cos(angle) * e.r * 0.65,
            y: e.y + Math.sin(angle) * e.r * 0.65,
            vx: Math.cos(angle) * v,
            vy: Math.sin(angle) * v,
            life: 4.5,
            damage: s.shot.damage,
            edibleAt: Math.min(s.shot.edibleAt, projectileThreatMass(e.requiredMass, s.shot.damage, s.shot.threatScale)),
            r: STAGES[this.stage].id === 'city' ? 3 : 6,
            plasma: STAGES[this.stage].id !== 'city',
          });
        }
      }
    }
  }
  moveMatter(e, s, dt, time) {
    e.escape = Math.max(0, (e.escape || 0) - dt);
    e.flash = Math.max(0, e.flash - dt * 2);
    if (!s.speed || e.wound >= 1) return;
    const roam=s.id==='orbit-matter-rock'?120:35;
    const tx = e.homeX + Math.sin(time * 0.1 + e.seed) * roam,
      ty = e.homeY + Math.cos(time * 0.09 + e.seed) * roam,
      distance = Math.max(1, Math.hypot(tx - e.x, ty - e.y)),
      step = Math.min(distance, s.speed * dt);
    e.x += ((tx - e.x) / distance) * step;
    e.y += ((ty - e.y) / distance) * step;
    // No animal steering or escape behaviour for loose matter.
    if (s.matterMotion === 'drift') e.heading += dt * 0.025;
    if (STAGES[this.stage].id === 'land') constrainToShore(e, s);
  }
  stream(x, y, time, force = false, radius = this.radius) {
    super.stream(x, y, time, force, radius);
    if (this.finalEntity && !this.entities.includes(this.finalEntity))
      this.entities.push(this.finalEntity);
  }
  ensureOrbitalForage(p, time) {
    if (STAGES[this.stage].id !== 'orbit' || p.dead) return 0;
    const earth=ORBITAL_EARTH;
    const reachable=e=>Math.hypot(e.x-earth.x,e.y-earth.y)<earth.limit-60 && Math.hypot(e.x-p.x,e.y-p.y)<850;
    const available=this.entities.filter(e=>!e.eaten && e.requiredMass<=p.biomass && reachable(e));
    if(available.length>=3)return 0;
    let restored=0;
    // Accelerate only exhausted, naturally occurring zero-threshold forage.
    // The finite orbit can never strand a wounded survivor below every food
    // threshold. Reuse existing IDs/slots; no extra permanent population.
    for(const [key,chunk]of this.chunks) {
      const [cx,cy]=key.split(':').map(Number),alive=new Set(chunk.entities.filter(e=>!e.eaten).map(e=>e.id));
      for(const e of this.generate(cx,cy,time+151).entities) {
        if(e.requiredMass!==0 || isDanger(SPECIES_BY_ID[e.kind]) || alive.has(e.id) || !reachable(e) || Math.hypot(e.x-p.x,e.y-p.y)<300)continue;
        if(!this.journal.has(e.id) && !chunk.entities.some(old=>old.id===e.id&&old.eaten))continue;
        this.journal.delete(e.id);
        chunk.entities=chunk.entities.filter(old=>old.id!==e.id);chunk.entities.push(e);alive.add(e.id);restored++;
        if(available.length+restored>=3)break;
      }
      if(available.length+restored>=3)break;
    }
    if(restored)this.stream(p.x,p.y,time,true);
    return restored;
  }
  spawnFinal(p) {
    if (this.stage !== STAGES.length - 1 || p.finalEaten) return;
    if (p.digestion.some((f) => f.final)) {
      this.finalSpawned = true;
      return;
    }
    if (this.finalSpawned && this.finalEntity && !this.finalEntity.eaten)
      return;
    const s = STAGE_SPECIES.at(-1).find((s) => s.kind === 'final');
    this.finalEntity = journeyEntity(
      s,
      p.x + 540,
      p.y - 160,
      0,
      'universe-final',
    );
    this.entities.push(this.finalEntity);
    this.finalSpawned = true;
  }
}
