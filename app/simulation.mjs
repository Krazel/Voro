export const WORLD = { width: 1400, height: 1700 };
export const GOAL = 18;
export const INITIAL_MASS = 8;
export const EVOLUTION_MASS = INITIAL_MASS + GOAL;
export const MAX_MASS = 48;
export const DIGEST_SECONDS = 1.65;
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function random(seed = 701) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
/** @typedef {{dx:number,dy:number,progress:number,done:boolean,rod:boolean,rotation:number,value:number,kind:string,r:number,final:boolean,recycled:boolean}} Digestion */
export function createLife(options = {}) {
  return {
    goalMass: options.goalMass ?? EVOLUTION_MASS,
    maxMass: options.maxMass ?? MAX_MASS,
    speedFactor: options.speedFactor ?? 1,
    cooldownFactor: options.cooldownFactor ?? 1,
    damageFactor: options.damageFactor ?? 1,
    digestFactor: options.digestFactor ?? 1,
    attraction: options.attraction ?? 0,
    unbounded: options.unbounded ?? false,
    reachFactor: options.reachFactor ?? 1,
    absorptionSlots: options.absorptionSlots ?? 5,
    yieldFactor: options.yieldFactor ?? 1,
    growthFactor: options.growthFactor ?? 1,
    steeringFactor: options.steeringFactor ?? 1,
    adaptationGained: 0,
    finalRequired: options.finalRequired ?? false,
    finalEaten: false,
    x: 700,
    y: 970,
    vx: 0,
    vy: 0,
    eaten: 0,
    biomass: INITIAL_MASS,
    elapsed: 0,
    cooldown: 0,
    boost: 0,
    digestion: /** @type {Digestion[]} */ ([]),
    evolved: false,
    evolution: 0,
    complete: false,
    free: false,
    dead: false,
    discovered: false,
    radius: 48,
    invulnerable: 0,
    hurt: 0,
    hitAngle: 0,
    feedPulse: 0,
    knockX: 0,
    knockY: 0,
  };
}
// Area, HUD diameter and collision size all derive from the same biomass.
export const radiusForMass = (mass) =>
  48 * Math.sqrt(Math.max(0, mass) / INITIAL_MASS);
export const sizeForMass = (mass) =>
  40 * Math.sqrt(Math.max(0, mass) / INITIAL_MASS);
export function integrate(life, dt, input) {
  dt = clamp(dt, 0, 0.04);
  life.hurt = Math.max(0, life.hurt - dt * 1.7);
  life.feedPulse = Math.max(0, life.feedPulse - dt * 1.4);
  life.radius +=
    (radiusForMass(life.biomass) - life.radius) *
    (1 - Math.exp(-dt * (life.hurt > 0 ? 7 : 2.8)));
  const mature = life.biomass >= life.goalMass;
  life.evolved = mature;
  life.evolution = clamp(
    life.evolution + (mature ? dt * 0.6 : -dt * 1.4),
    0,
    1,
  );
  if (life.dead) return;
  life.elapsed += dt;
  life.cooldown = Math.max(0, life.cooldown - dt);
  life.boost = Math.max(0, life.boost - dt);
  life.invulnerable = Math.max(0, life.invulnerable - dt);
  const length = Math.hypot(input.x, input.y);
  const speed =
    (life.evolved ? 145 : 125) * life.speedFactor * (life.boost > 0 ? 2.8 : 1);
  const blend = 1 - Math.exp(-dt * 4.4 * life.steeringFactor);
  life.vx +=
    ((length > 0 ? (input.x / Math.max(1, length)) * speed : 0) - life.vx) *
    blend;
  life.vy +=
    ((length > 0 ? (input.y / Math.max(1, length)) * speed : 0) - life.vy) *
    blend;
  life.x += (life.vx + life.knockX) * dt;
  life.y += (life.vy + life.knockY) * dt;
  if (!life.unbounded) {
    life.x = clamp(life.x, 100, WORLD.width - 100);
    life.y = clamp(life.y, 130, WORLD.height - 130);
  }
  life.knockX *= Math.exp(-dt * 5);
  life.knockY *= Math.exp(-dt * 5);
}
export function impulse(life) {
  if (life.cooldown > 0 || life.complete || life.dead) return false;
  life.boost = 0.42;
  life.cooldown = 3.5 * life.cooldownFactor;
  return true;
}
export function digest(life, dt) {
  if (life.dead) return 0;
  let count = 0;
  for (const f of life.digestion) {
    f.progress += (dt * life.digestFactor) / DIGEST_SECONDS;
    if (f.progress >= 1 && !f.done) {
      f.done = true;
      life.eaten++;
      life.biomass = Math.min(
        life.maxMass,
        life.biomass +
          f.value * (f.recycled ? 1 : life.yieldFactor * life.growthFactor),
      );
      if (!f.recycled) life.adaptationGained += f.value;
      if (f.final) life.finalEaten = true;
      life.feedPulse = 1;
      count++;
    }
  }
  life.digestion = life.digestion.filter((f) => !f.done);
  life.evolved = life.biomass >= life.goalMass;
  if (
    life.evolved &&
    life.evolution >= 1 &&
    !life.discovered &&
    (!life.finalRequired || life.finalEaten)
  ) {
    life.discovered = true;
    if (!life.free) life.complete = true;
  }
  return count;
}
export function beginAbsorb(life, food) {
  if (
    life.dead ||
    food.eaten ||
    life.complete ||
    life.biomass < (food.requiredMass || 0) ||
    life.digestion.length >= life.absorptionSlots ||
    Math.hypot(food.x - life.x, food.y - life.y) >
      life.radius * 1.12 * life.reachFactor
  )
    return false;
  food.eaten = true;
  life.digestion.push({
    dx: food.x - life.x,
    dy: food.y - life.y,
    progress: 0,
    done: false,
    rod: !!food.rod,
    rotation: food.seed || 0,
    value: food.value || 1,
    kind: food.kind || 'nutrient',
    r: food.r || (food.rod ? 7 : 4.5),
    final: !!food.final,
    recycled: !!food.recycled,
  });
  return true;
}
/** Contact damage removes current mass, interrupts digestion and gives an escape window. */
export function takeDamage(life, source, fraction = 0.25) {
  if (life.dead || life.complete || life.invulnerable > 0) return 0;
  const lost = Math.min(
    life.biomass,
    Math.max(2, life.biomass * clamp(fraction, 0, 1)) * life.damageFactor,
  );
  life.biomass = Math.max(0, life.biomass - lost);
  life.evolved = life.biomass >= life.goalMass;
  life.invulnerable = 2;
  life.hurt = 1;
  life.hitAngle = Math.atan2(source.y - life.y, source.x - life.x);
  life.knockX = -Math.cos(life.hitAngle) * 360;
  life.knockY = -Math.sin(life.hitAngle) * 360;
  life.boost = 0;
  life.digestion = [];
  life.feedPulse = 0;
  if (life.biomass === 0) {
    life.dead = true;
    life.vx = 0;
    life.vy = 0;
    life.knockX = 0;
    life.knockY = 0;
  }
  return lost;
}
// A damped membrane node. Render never mutates these values.
export function springNode(value, velocity, target, dt) {
  const acceleration = (target - value) * 100 - velocity * 13;
  velocity += acceleration * dt;
  value += velocity * dt;
  return { value: clamp(value, 0.28, 1.95), velocity };
}
