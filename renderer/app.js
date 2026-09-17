const ASPECT = 640 / 980;
const BUBBLE_MS = 6200;

const pet = document.getElementById("pet");
const sprite = document.getElementById("sprite");
const bubble = document.getElementById("bubble");
const bubbleText = document.getElementById("bubble-text");

const state = {
  size: Number(localStorage.getItem("berenice-size") || 1),
  x: 0.72,
  y: 0.62,
  anim: "idle_ready",
  frame: 0,
  dir: 1,
  onceDone: false,
  lineUntil: 0,
  phrases: [],
  anims: null,
  lastIds: [],
};

function frames(id) {
  return Array.from(
    { length: 12 },
    (_, i) => `./berenice/${id}/f${String(i).padStart(2, "0")}.webp`,
  );
}

function measure() {
  const h = Math.round(Math.min(620, Math.max(240, window.innerHeight * 0.52 * state.size)));
  const w = Math.round(h * ASPECT);
  return { w, h };
}

function place() {
  const { w, h } = measure();
  pet.style.width = w + "px";
  pet.style.height = h + "px";
  pet.style.left = `calc(${state.x * 100}% - ${w / 2}px)`;
  pet.style.top = `calc(${state.y * 100}% - ${h * 0.72}px)`;
  const side = state.x > 0.6 ? "left" : "right";
  bubble.dataset.side = side;
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function pick(list, exclude) {
  const pool = list.filter((id) => id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] || list[0];
}

function setAnim(id) {
  state.anim = id;
  state.frame = 0;
  state.dir = 1;
  state.onceDone = false;
  sprite.src = frames(id)[0];
}

function speak() {
  if (!state.phrases.length) return;
  const fresh = state.phrases.filter((p) => !state.lastIds.includes(p.id));
  const bag = fresh.length ? fresh : state.phrases;
  const phrase = bag[Math.floor(Math.random() * bag.length)];
  state.lastIds = [...state.lastIds, phrase.id].slice(-8);
  bubbleText.textContent = phrase.text;
  bubble.hidden = false;
  state.lineUntil = performance.now() + BUBBLE_MS;
  setAnim("talk_speak");
}

function wander(kind) {
  if (kind === "step") {
    state.x = clamp(state.x + (Math.random() * 0.24 - 0.12), 0.16, 0.86);
    state.y = clamp(state.y + (Math.random() * 0.16 - 0.08), 0.32, 0.82);
  } else {
    state.x = 0.2 + Math.random() * 0.6;
    state.y = 0.4 + Math.random() * 0.32;
  }
  place();
}

let acc = 0;
let last = performance.now();
function tick(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  const fps = state.anim === "talk_speak" ? 10 : 8;
  const sp = 1 / fps;
  const list = frames(state.anim);
  const once = state.anims.once.includes(state.anim);
  while (acc >= sp) {
    acc -= sp;
    if (once) {
      state.frame = Math.min(list.length - 1, state.frame + 1);
      if (state.frame >= list.length - 1 && !state.onceDone) {
        state.onceDone = true;
        if (performance.now() < state.lineUntil) setAnim("talk_speak");
        else setAnim(pick(state.anims.idleLoop, state.anim));
      }
    } else {
      state.frame += state.dir;
      if (state.frame >= list.length - 1) {
        state.dir = -1;
        state.frame = list.length - 1;
      } else if (state.frame <= 0) {
        state.dir = 1;
        state.frame = 0;
      }
    }
  }
  sprite.src = list[state.frame] || list[0];

  if (state.lineUntil && now >= state.lineUntil) {
    state.lineUntil = 0;
    bubble.hidden = true;
    setAnim(pick(state.anims.idleLoop));
  }
  requestAnimationFrame(tick);
}

function armFidget() {
  const delay = 2600 + Math.random() * 1800;
  setTimeout(() => {
    if (performance.now() < state.lineUntil) {
      armFidget();
      return;
    }
    if (Math.random() < 0.72) setAnim(pick(state.anims.fidget, state.anim));
    else setAnim(pick(state.anims.idleLoop, state.anim));
    armFidget();
  }, delay);
}

function armWander() {
  setTimeout(() => {
    wander(Math.random() < 0.38 ? "cross" : "step");
    armWander();
  }, 4500 + Math.random() * 3500);
}

function armTalk() {
  setTimeout(() => {
    if (performance.now() >= state.lineUntil) speak();
    armTalk();
  }, 28000 + Math.random() * 12000);
}

// Drag
let dragging = false;
let moved = false;
let sx = 0;
let sy = 0;
let ox = 0;
let oy = 0;
pet.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  dragging = true;
  moved = false;
  pet.classList.add("dragging");
  sx = e.clientX;
  sy = e.clientY;
  ox = state.x;
  oy = state.y;
  pet.setPointerCapture(e.pointerId);
});
pet.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - sx;
  const dy = e.clientY - sy;
  if (Math.hypot(dx, dy) > 7) moved = true;
  if (!moved) return;
  state.x = clamp(ox + dx / window.innerWidth, 0.16, 0.86);
  state.y = clamp(oy + dy / window.innerHeight, 0.28, 0.84);
  place();
});
pet.addEventListener("pointerup", () => {
  if (!dragging) return;
  dragging = false;
  pet.classList.remove("dragging");
  if (!moved) speak();
});

pet.addEventListener("mouseenter", () => window.desktop?.setIgnore(false));
pet.addEventListener("mouseleave", () => {
  if (!dragging) window.desktop?.setIgnore(true);
});
pet.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.desktop?.onTalk(() => speak());
window.desktop?.onSize((n) => {
  state.size = n;
  localStorage.setItem("berenice-size", String(n));
  place();
});
window.addEventListener("resize", place);

Promise.all([
  fetch("./phrases.json").then((r) => r.json()),
  fetch("./anims.json").then((r) => r.json()),
]).then(([phrases, anims]) => {
  state.phrases = phrases;
  state.anims = anims;
  place();
  setAnim("idle_ready");
  speak();
  requestAnimationFrame(tick);
  armFidget();
  armWander();
  armTalk();
});
