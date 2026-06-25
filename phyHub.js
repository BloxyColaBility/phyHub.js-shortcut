const Phy = {
  l: t => console.log(t),
  a: a => window.alert(a),
  q: s => document.querySelector(s),
  qa: s => document.querySelectorAll(s),
  id: i => document.getElementById(i),
  tag: t => document.getElementsByTagName(t),
  class: c => document.getElementsByClassName(c),
  get: s => s.startsWith('#')? Phy.id(s.slice(1)) : s.startsWith('.')? [...Phy.class(s.slice(1))] : Phy.q(s),
  add: (t, p = document.body) => {const e = document.createElement(t); p.appendChild(e); return e},
  del: e => e && e.remove(),
  empty: e => {while (e.firstChild) e.removeChild(e.firstChild)},
  html: (e, h) => h === undefined? e.innerHTML : (e.innerHTML = h, e),
  text: (e, t) => t === undefined? e.textContent : (e.textContent = t, e),
  val: (e, v) => v === undefined? e.value : (e.value = v, e),
  attr: (e, k, v) => v === undefined? e.getAttribute(k) : e.setAttribute(k, v),
  data: (e, k, v) => v === undefined? e.dataset[k] : (e.dataset[k] = v, e),
  properties: (e, p) => {
    for (let k in p) {
      if (k === 'x' || k === 'left') e.style.left = p[k] + 'px';
      else if (k === 'y' || k === 'top') e.style.top = p[k] + 'px';
      else if (k === 'w' || k === 'width') e.style.width = p[k] + 'px';
      else if (k === 'h' || k === 'height') e.style.height = p[k] + 'px';
      else if (k === 'text') e.textContent = p[k];
      else if (k === 'html') e.innerHTML = p[k];
      else if (k === 'class') e.className = p[k];
      else if (k === 'id') e.id = p[k];
      else if (k === 'val') e.value = p[k];
      else e.style[k] = p[k];
    }
    return e;
  },
  css: (e, s) => Object.assign(e.style, s),
  style: e => getComputedStyle(e),
  hasClass: (e, c) => e.classList.contains(c),
  addClass: (e, c) => e.classList.add(...c.split(' ')),
  delClass: (e, c) => e.classList.remove(...c.split(' ')),
  toggleClass: (e, c) => e.classList.toggle(c),
  on: (e, v, f, o) => e.addEventListener(v, f, o),
  off: (e, v, f) => e.removeEventListener(v, f),
  emit: (e, v, d) => e.dispatchEvent(new CustomEvent(v, {detail: d})),
  once: (e, v, f) => {const w = t => {f(t); e.removeEventListener(v, w)}; e.addEventListener(v, w)},
  ready: f => document.readyState!== 'loading'? f() : document.addEventListener('DOMContentLoaded', f),
  pos: e => {
    const r = e.getBoundingClientRect();
    return {x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width/2, cy: r.top + r.height/2, top: r.top, left: r.left, right: r.right, bottom: r.bottom};
  },
  offset: e => {let x = 0, y = 0; while(e) {x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent} return {x, y}},
  scroll: (e, x, y) => x === undefined? {x: e.scrollLeft, y: e.scrollTop} : (e.scrollLeft = x, e.scrollTop = y),
  scrollTo: (e, y, d = 300) => Phy.animate(e, {scrollTop: y}, d),
  collides: (a, b) => {
    if (!a ||!b) return false;
    const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    return!(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  },
  contains: (a, b) => {
    const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    return r1.left <= r2.left && r1.right >= r2.right && r1.top <= r2.top && r1.bottom >= r2.bottom;
  },
  overlap: (a, b) => {
    if (!Phy.collides(a, b)) return 0;
    const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    return (Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left)) * (Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
  },
  dist: (a, b) => {
    const p1 = Phy.pos(a), p2 = Phy.pos(b), dx = p2.cx - p1.cx, dy = p2.cy - p1.cy;
    return Math.sqrt(dx*dx + dy*dy);
  },
  angle: (a, b) => {
    const p1 = Phy.pos(a), p2 = Phy.pos(b);
    return Math.atan2(p2.cy - p1.cy, p2.cx - p1.cx) * 180 / Math.PI;
  },
  inside: (e, x, y) => {
    const r = e.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  },
  center: e => {const p = Phy.pos(e); e.style.left = `calc(50% - ${p.w/2}px)`; e.style.top = `calc(50% - ${p.h/2}px)`},
  bounds: e => {const p = Phy.pos(e); return {minX: p.x, minY: p.y, maxX: p.x + p.w, maxY: p.y + p.h}},
  drag: (e, o = {}) => {
    let offX = 0, offY = 0, down = false;
    e.style.position = 'absolute'; e.style.userSelect = 'none'; e.style.touchAction = 'none';
    const start = ev => {
      down = true;
      const t = ev.touches? ev.touches: ev, r = e.getBoundingClientRect();
      offX = t.clientX - r.left; offY = t.clientY - r.top;
      if (o.start) o.start(e, ev);
    };
    const move = ev => {
      if (!down) return;
      const t = ev.touches? ev.touches: ev;
      e.style.left = t.clientX - offX + 'px'; e.style.top = t.clientY - offY + 'px';
      if (o.move) o.move(e, ev);
      if (o.collideWith) o.collideWith.forEach(t => {if (Phy.collides(e, t) && o.onCollide) o.onCollide(e, t)});
      if (o.contain) {
        const p = Phy.pos(o.contain), c = Phy.pos(e);
        if (c.x < p.x) e.style.left = p.x + 'px';
        if (c.y < p.y) e.style.top = p.y + 'px';
        if (c.x + c.w > p.x + p.w) e.style.left = p.x + p.w - c.w + 'px';
        if (c.y + c.h > p.y + p.h) e.style.top = p.y + p.h - c.h + 'px';
      }
      if (o.snap) {
        const g = o.snap, p = Phy.pos(e);
        e.style.left = Math.round(p.x / g) * g + 'px';
        e.style.top = Math.round(p.y / g) * g + 'px';
      }
    };
    const end = ev => {if (down && o.end) o.end(e, ev); down = false};
    e.onmousedown = start; document.onmousemove = move; document.onmouseup = end;
    e.ontouchstart = start; document.ontouchmove = move; document.ontouchend = end;
    return e;
  },
  _anims: new Map(),
  stop: e => {const a = Phy._anims.get(e); if (a) cancelAnimationFrame(a); Phy._anims.delete(e)},
  stopAll: () => {Phy._anims.forEach(v => cancelAnimationFrame(v)); Phy._anims.clear()},
  animate: (e, p, d = 300, z = 'ease', o = {}) => {
    Phy.stop(e);
    return new Promise(r => {
      const s = performance.now(), sp = Phy.pos(e), ss = {};
      for (let k in p) {
        if (k === 'x' || k === 'left') ss.left = sp.x;
        if (k === 'y' || k === 'top') ss.top = sp.y;
        if (k === 'w' || k === 'width') ss.width = sp.w;
        if (k === 'h' || k === 'height') ss.height = sp.h;
        if (k === 'rotate') ss.rotate = parseFloat(Phy.style(e).transform.replace(/[^0-9.-]/g, '')) || 0;
        if (k === 'opacity') ss.opacity = parseFloat(Phy.style(e).opacity) || 1;
        if (k === 'scale') ss.scale = 1;
        if (k === 'scrollTop') ss.scrollTop = e.scrollTop;
      }
      const ez = {linear: t => t, ease: t => t < 0.5? 2*t*t : -1+(4-2*t)*t, easeIn: t => t*t, easeOut: t => t*(2-t), bounce: t => {const n1 = 7.5625, d1 = 2.75; return t < 1/d1? n1*t*t : t < 2/d1? n1*(t -= 1.5/d1)*t + 0.75 : t < 2.5/d1? n1*(t -= 2.25/d1)*t + 0.9375 : n1*(t -= 2.625/d1)*t + 0.984375}, elastic: t => t === 0? 0 : t === 1? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI)};
      const ef = ez[z] || ez.ease;
      e.style.position = 'absolute';
      const fr = n => {
        let t = Math.min(1, (n - s) / d), es = ef(t);
        for (let k in p) {
          let sv = ss[k === 'x'? 'left' : k === 'y'? 'top' : k === 'w'? 'width' : k === 'h'? 'height' : k];
          let ev = p[k], cv = sv + (ev - sv) * es;
          if (k === 'x' || k === 'left') e.style.left = cv + 'px';
          if (k === 'y' || k === 'top') e.style.top = cv + 'px';
          if (k === 'w' || k === 'width') e.style.width = cv + 'px';
          if (k === 'h' || k === 'height') e.style.height = cv + 'px';
          if (k === 'rotate') e.style.transform = `rotate(${cv}deg)`;
          if (k === 'scale') e.style.transform = `scale(${cv})`;
          if (k === 'opacity') e.style.opacity = cv;
          if (k === 'scrollTop') e.scrollTop = cv;
        }
        if (o.collideWith) o.collideWith.forEach(tg => {
          if (Phy.collides(e, tg) && o.onCollide) {
            o.onCollide(e, tg);
            if (o.stopOnCollide) {Phy.stop(e); r(e); return}
          }
        });
        if (t < 1 && Phy._anims.has(e)) Phy._anims.set(e, requestAnimationFrame(fr));
        else {Phy._anims.delete(e); if (o.done) o.done(e); r(e)}
      };
      Phy._anims.set(e, requestAnimationFrame(fr));
    });
  },
  onCollide: (a, b, cb, i = 16) => {
    const c = setInterval(() => {
      if (!document.body.contains(a) ||!document.body.contains(b)) {clearInterval(c); return}
      if (Phy.collides(a, b)) cb(a, b);
    }, i);
    return c;
  },
  offCollide: i => clearInterval(i),
  clone: e => e.cloneNode(true),
  parent: e => e.parentNode,
  children: e => [...e.children],
  siblings: e => [...e.parentNode.children].filter(c => c!== e),
  next: e => e.nextElementSibling,
  prev: e => e.previousElementSibling,
  first: e => e.firstElementChild,
  last: e => e.lastElementChild,
  find: (e, s) => e.querySelector(s),
  findAll: (e, s) => e.querySelectorAll(s),
  closest: (e, s) => e.closest(s),
  hide: e => e.style.display = 'none',
  show: (e, d = 'block') => e.style.display = d,
  toggle: e => e.style.display = Phy.style(e).display === 'none'? 'block' : 'none',
  fadeIn: (e, d = 300) => {e.style.opacity = 0; Phy.show(e); return Phy.animate(e, {opacity: 1}, d)},
  fadeOut: (e, d = 300) => Phy.animate(e, {opacity: 0}, d).then(() => Phy.hide(e)),
  slideUp: (e, d = 300) => {const h = Phy.pos(e).h; return Phy.animate(e, {h: 0}, d).then(() => {Phy.hide(e); e.style.height = h + 'px'})},
  slideDown: (e, d = 300) => {const h = Phy.pos(e).h; e.style.height = 0; Phy.show(e); return Phy.animate(e, {h}, d)},
  wait: ms => new Promise(r => setTimeout(r, ms)),
  loop: (f, ms) => setInterval(f, ms),
  stopLoop: i => clearInterval(i),
  debounce: (f, w = 300) => {let t; return (...a) => {clearTimeout(t); t = setTimeout(() => f(...a), w)}},
  throttle: (f, w = 300) => {let t = 0; return (...a) => {const n = Date.now(); if (n - t >= w) {t = n; f(...a)}}},
  rand: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  randFloat: (min, max) => Math.random() * (max - min) + min,
  pick: a => a[Math.floor(Math.random() * a.length)],
  shuffle: a => {for (let i = a.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]} return a},
  each: (a, f) => a.forEach(f),
  map: (a, f) => a.map(f),
  filter: (a, f) => a.filter(f),
  reduce: (a, f, i) => a.reduce(f, i),
  find: (a, f) => a.find(f),
  clamp: (n, min, max) => Math.min(Math.max(n, min), max),
  lerp: (a, b, t) => a + (b - a) * t,
  mapRange: (n, a, b, c, d) => c + (d - c) * ((n - a) / (b - a)),
  deg: r => r * 180 / Math.PI,
  rad: d => d * Math.PI / 180,
  dist2: (x1, y1, x2, y2) => Math.sqrt((x2-x1)**2 + (y2-y1)**2),
  angle2: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI,
  _physics: [],
  physics: (e, o = {}) => {
    e._phy = {vx: o.vx || 0, vy: o.vy || 0, ax: o.ax || 0, ay: o.ay || 0.5, bounce: o.bounce || 0.7, friction: o.friction || 0.98, mass: o.mass || 1, rot: o.rot || 0, vr: o.vr || 0};
    e.style.position = 'absolute';
    if (!Phy._physics.length) {
      const update = () => {
        Phy._physics.forEach(el => {
          if (!document.body.contains(el)) return;
          const p = el._phy;
          p.vx += p.ax; p.vy += p.ay; p.rot += p.vr;
          p.vx *= p.friction; p.vy *= p.friction; p.vr *= p.friction;
          const pos = Phy.pos(el);
          let nx = pos.x + p.vx, ny = pos.y + p.vy;
          if (o.bounds) {
            const b = Phy.pos(o.bounds);
            if (nx < b.x) {nx = b.x; p.vx *= -p.bounce; p.vr += p.vx * 0.1}
            if (nx + pos.w > b.x + b.w) {nx = b.x + b.w - pos.w; p.vx *= -p.bounce; p.vr += p.vx * 0.1}
            if (ny < b.y) {ny = b.y; p.vy *= -p.bounce}
            if (ny + pos.h > b.y + b.h) {ny = b.y + b.h - pos.h; p.vy *= -p.bounce; p.vx *= 0.9}
          }
          el.style.left = nx + 'px'; el.style.top = ny + 'px';
          if (p.rot) el.style.transform = `rotate(${p.rot}deg)`;
          if (o.collideWith) o.collideWith.forEach(t => {
            if (Phy.collides(el, t)) {
              const tp = t._phy;
              if (tp) {
                const dx = Phy.pos(el).cx - Phy.pos(t).cx, dy = Phy.pos(el).cy - Phy.pos(t).cy;
                const ang = Math.atan2(dy, dx);
                p.vx = Math.cos(ang) * 5; p.vy = Math.sin(ang) * 5;
                tp.vx = -Math.cos(ang) * 5; tp.vy = -Math.sin(ang) * 5;
              } else {
                p.vx *= -p.bounce; p.vy *= -p.bounce; p.vr += p.vx * 0.2;
              }
              if (o.onCollide) o.onCollide(el, t);
            }
          });
        });
        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    }
    Phy._physics.push(e);
    return e;
  },
  stopPhysics: e => {Phy._physics = Phy._physics.filter(x => x!== e); delete e._phy},
  applyForce: (e, fx, fy) => {if (e._phy) {e._phy.vx += fx / e._phy.mass; e._phy.vy += fy / e._phy.mass}},
  particles: (x, y, o = {}) => {
    const c = o.count || 20, col = o.color || '#f00', sz = o.size || 5, life = o.life || 1000, gr = o.gravity || 0.2;
    for (let i = 0; i < c; i++) {
      const p = Phy.add('div');
      Phy.properties(p, {x, y, w: sz, h: sz, background: col, borderRadius: '50%', position: 'fixed', pointerEvents: 'none', zIndex: 9999});
      const ang = Math.random() * Math.PI * 2, vel = Phy.rand(2, 8);
      Phy.physics(p, {vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - Phy.rand(2, 5), ay: gr, friction: 0.97});
      Phy.animate(p, {opacity: 0, scale: 0}, life, 'easeOut').then(() => Phy.del(p));
    }
  },
  _sounds: {},
  sound: (name, url) => {
    if (url) {Phy._sounds[name] = new Audio(url); return}
    return Phy._sounds[name];
  },
  play: (name, vol = 1, loop = false) => {
    const s = Phy._sounds[name];
    if (s) {s.volume = vol; s.loop = loop; s.currentTime = 0; s.play()}
  },
  stopSound: name => {const s = Phy._sounds[name]; if (s) {s.pause(); s.currentTime = 0}},
  beep: (freq = 440, dur = 200, vol = 0.1, type = 'sine') => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq; gain.gain.value = vol;
    osc.start(); osc.stop(ctx.currentTime + dur / 1000);
  },
  mouse: {x: 0, y: 0, down: false},
  key: {},
  keyDown: k => Phy.key[k],
  fetch: async (url, o = {}) => {
    const r = await fetch(url, o);
    return o.type === 'json'? r.json() : o.type === 'text'? r.text() : r;
  },
  getJSON: url => Phy.fetch(url, {type: 'json'}),
  post: (url, data) => Phy.fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data), type: 'json'}),
  store: {
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    get: k => JSON.parse(localStorage.getItem(k)),
    del: k => localStorage.removeItem(k),
    clear: () => localStorage.clear()
  },
  cookie: {
    set: (k, v, d = 7) => {const e = new Date(Date.now() + d * 864e5).toUTCString(); document.cookie = `${k}=${encodeURIComponent(v)}; expires=${e}; path=/`},
    get: k => document.cookie.split('; ').find(r => r.startsWith(k + '='))?.split('=')[1],
    del: k => document.cookie = `${k}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
  url: {
    param: k => new URLSearchParams(location.search).get(k),
    params: () => Object.fromEntries(new URLSearchParams(location.search)),
    hash: () => location.hash.slice(1)
  },
  copy: t => navigator.clipboard.writeText(t),
  paste: () => navigator.clipboard.readText(),
  fullscreen: e => e.requestFullscreen(),
  exitFullscreen: () => document.exitFullscreen(),
  vibrate: p => navigator.vibrate(p),
  webgl: (canvas, o = {}) => {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    gl.clearColor(o.r || 0, o.g || 0, o.b || 0, o.a || 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
  },
  canvas: (w = 300, h = 150) => {
    const c = Phy.add('canvas');
    c.width = w; c.height = h;
    return {el: c, ctx: c.getContext('2d')};
  },
  _game: null,
  game: (o = {}) => {
    if (Phy._game) return Phy._game;
    const canvas = o.canvas || Phy.add('canvas');
    canvas.width = o.w || window.innerWidth;
    canvas.height = o.h || window.innerHeight;
    const ctx = canvas.getContext('2d');
    const g = {
      canvas, ctx, w: canvas.width, h: canvas.height,
      fps: o.fps || 60, frame: 0, time: 0, last: 0,
      entities: [], running: false,
      add: e => {g.entities.push(e); return e},
      remove: e => {g.entities = g.entities.filter(x => x!== e)},
      clear: () => ctx.clearRect(0, 0, g.w, g.h),
      rect: (x, y, w, h, c) => {ctx.fillStyle = c; ctx.fillRect(x, y, w, h)},
      circle: (x, y, r, c) => {ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()},
      text: (t, x, y, c = '#fff', s = 16) => {ctx.fillStyle = c; ctx.font = s + 'px sans-serif'; ctx.fillText(t, x, y)},
      sprite: (img, x, y, w, h) => {ctx.drawImage(img, x, y, w, h)},
      start: () => {
        g.running = true;
        const loop = t => {
          if (!g.running) return;
          g.time = t; g.frame++;
          const dt = (t - g.last) / 1000; g.last = t;
          if (o.update) o.update(dt);
          g.clear();
          if (o.draw) o.draw(ctx);
          g.entities.forEach(e => {if (e.update) e.update(dt); if (e.draw) e.draw(ctx)});
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },
      stop: () => {g.running = false},
      entity: (x = 0, y = 0) => ({
        x, y, vx: 0, vy: 0, w: 10, h: 10, color: '#fff',
        update: null, draw: null,
        move: function() {this.x += this.vx; this.y += this.vy},
        collides: function(e) {
          return!(this.x + this.w < e.x || this.x > e.x + e.w || this.y + this.h < e.y || this.y > e.y + e.h);
        }
      })
    };
    Phy._game = g;
    return g;
  },
  _init: (() => {
    Phy.on(document, 'mousemove', e => {Phy.mouse.x = e.clientX; Phy.mouse.y = e.clientY});
    Phy.on(document, 'touchmove', e => {Phy.mouse.x = e.touches.clientX; Phy.mouse.y = e.touches.clientY});
    Phy.on(document, 'mousedown', () => Phy.mouse.down = true);
    Phy.on(document, 'mouseup', () => Phy.mouse.down = false);
    Phy.on(document, 'touchstart', () => Phy.mouse.down = true);
    Phy.on(document, 'touchend', () => Phy.mouse.down = false);
    Phy.on(document, 'keydown', e => Phy.key[e.key] = true);
    Phy.on(document, 'keyup', e => Phy.key[e.key] = false);
  })()
};
const P = Phy;