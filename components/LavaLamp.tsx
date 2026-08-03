"use client";

import { useEffect, useRef } from "react";

/**
 * Lava lamp background — raw WebGL, no three.js.
 *
 * Modelled on how the real thing actually behaves rather than on "circles that
 * move", after reading up on it:
 *
 *  · It's a convection loop, not oscillation. Wax pools in a heated reservoir at
 *    the base, gains heat until it's less dense than the carrier fluid, plumes
 *    upward, sheds that heat at the top, grows denser and sinks back into the
 *    pool. Each blob carries a `temp` and buoyancy follows from it, so the cycle
 *    emerges — periods drift instead of repeating on a fixed sine.
 *  · Surface tension keeps blobs "cohesive and rounded rather than fragmenting",
 *    so the outline stays smooth. Irregularity comes from low-order asymmetric
 *    deformation — teardrop taper against the direction of travel, stretch while
 *    accelerating, necking where two masses meet — NOT from high-frequency
 *    radial bumps, which is what made an earlier pass look like an amoeba.
 *  · Blobs merge through an elongating neck; the smooth-min union gives that.
 *
 * Everything moves by force integration (buoyancy − drag + impulses), never by
 * lerping toward a target position. That's what stops the cursor interaction
 * feeling mechanical: wax takes an impulse, coasts, and settles on its own.
 */

const NB = 4;
const MAX_DPR = 1.5;

/* Worst-case outward growth, so shapes never clip the viewport edge. The
   radial wobble and the along-travel stretch stack multiplicatively. */
const WOBBLE_MAX = 0.09;
const STRETCH_MAX = 0.3;
const GROW_MAX = (1 + WOBBLE_MAX) * (1 + STRETCH_MAX);

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec3  uBlobs[${NB}];   // x, y (0..1, y up), radius (height units)
uniform vec3  uWob[${NB}];     // seed, velocity x, velocity y
uniform vec3  uPool;           // centre y, x radius scale, y radius
uniform vec2  uPtr;            // lagged cursor, 0..1
uniform vec2  uPtrV;           // cursor velocity, for the wake
uniform float uPtrR;           // cavity radius
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uAlpha;

/* iq's polynomial smooth min / max — k is the fusion radius */
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float smax(float a, float b, float k) {
  float h = clamp(0.5 - 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) + k * h * (1.0 - h);
}

/*
 * One mass of wax. Smooth-surfaced, because surface tension is what holds it
 * together — the asymmetry is all low-order:
 *   · stretched along travel, squashed across it (accelerating drop)
 *   · tapered on the trailing side (teardrop)
 *   · two very gentle harmonics so no two are identical
 */
float wax(vec2 p, vec2 c, float r, float seed, vec2 vel) {
  vec2 q = p - c;
  float sp = length(vel);
  float taper = 0.0;

  if (sp > 0.00001) {
    vec2 dir = vel / sp;
    vec2 nrm = vec2(-dir.y, dir.x);
    float s = 1.0 + min(sp * 6.0, ${STRETCH_MAX});
    q = dir * (dot(q, dir) / s) + nrm * (dot(q, nrm) * s);
    // trailing side pulls in — this is the teardrop
    taper = -0.16 * min(sp * 5.0, 1.0) * clamp(-dot(normalize(q + 1e-6), dir), 0.0, 1.0);
  }

  float a = atan(q.y, q.x);
  float wob =
      0.055 * sin(2.0 * a + uTime * 0.29 + seed)
    + 0.035 * sin(3.0 * a - uTime * 0.19 + seed * 2.1);

  return length(q) - r * (1.0 + wob + taper);
}

/* the heated reservoir at the base: a wide, flat pool the blobs rise out of
   and sink back into */
float pool(vec2 p, float aspect) {
  vec2 q = (p - vec2(aspect * 0.5, uPool.x)) / vec2(aspect * uPool.y, uPool.z);
  return (length(q) - 1.0) * min(aspect * uPool.y, uPool.z);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float d = pool(p, aspect);
  for (int i = 0; i < ${NB}; i++) {
    vec2 c = vec2(uBlobs[i].x * aspect, uBlobs[i].y);
    d = smin(d, wax(p, c, uBlobs[i].z, uWob[i].x, uWob[i].yz), 0.11);
  }

  /* the cursor shoves liquid aside. the cavity is stretched into a wake along
     the direction of travel, so a fast sweep ploughs a channel rather than
     punching a circular hole */
  if (uPtrR > 0.0005) {
    vec2 q = p - vec2(uPtr.x * aspect, uPtr.y);
    float sp = length(uPtrV);
    if (sp > 0.0001) {
      vec2 dir = uPtrV / sp;
      vec2 nrm = vec2(-dir.y, dir.x);
      float s = 1.0 + min(sp * 2.2, 1.3);
      q = dir * (dot(q, dir) / s) + nrm * (dot(q, nrm) * s);
    }
    d = smax(d, -(length(q) - uPtrR), 0.1);
  }

  float mask = 1.0 - smoothstep(-0.004, 0.011, d);
  if (mask <= 0.0) discard;

  float depth = clamp(0.5 + 2.4 * (-d), 0.0, 1.0);
  vec3 col = mix(uColorA, uColorB, depth * (0.35 + 0.65 * uv.y));

  float a = mask * uAlpha;
  gl_FragColor = vec4(col * a, a);   // premultiplied
}
`;

type Blob = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseR: number;
  /** 0 = cold and dense (sinks), 1 = hot and buoyant (rises) */
  temp: number;
  /** the convection column this blob belongs to; it drifts back toward it */
  lane: number;
  seed: number;
};

/* pool geometry, shared with the shader */
const POOL_Y = -0.07;
const POOL_RX = 0.6;
const POOL_RY = 0.2;
/** roughly where the pool surface sits, so blobs know when they're home */
const POOL_TOP = POOL_Y + POOL_RY;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("lava shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function hexToRgb(h: string, fallback: string): readonly [number, number, number] {
  const v = (h || fallback).trim().replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0.5, 0.5, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** wax colour comes off the ink ramp: black on light, white on dark */
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  return {
    a: hexToRgb(cs.getPropertyValue("--lava-a"), "#0a0908"),
    b: hexToRgb(cs.getPropertyValue("--lava-b"), "#3a372c"),
    alpha: parseFloat(cs.getPropertyValue("--lava-alpha")) || 0.15,
  };
}

export function LavaLamp({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return; // no GL: the page just keeps its flat background

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("lava link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "uRes"),
      time: gl.getUniformLocation(prog, "uTime"),
      blobs: gl.getUniformLocation(prog, "uBlobs"),
      wob: gl.getUniformLocation(prog, "uWob"),
      pool: gl.getUniformLocation(prog, "uPool"),
      ptr: gl.getUniformLocation(prog, "uPtr"),
      ptrV: gl.getUniformLocation(prog, "uPtrV"),
      ptrR: gl.getUniformLocation(prog, "uPtrR"),
      colorA: gl.getUniformLocation(prog, "uColorA"),
      colorB: gl.getUniformLocation(prog, "uColorB"),
      alpha: gl.getUniformLocation(prog, "uAlpha"),
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.uniform3f(U.pool, POOL_Y, POOL_RX, POOL_RY);

    const applyPalette = () => {
      const pal = readPalette();
      gl.uniform3f(U.colorA, pal.a[0], pal.a[1], pal.a[2]);
      gl.uniform3f(U.colorB, pal.b[0], pal.b[1], pal.b[2]);
      gl.uniform1f(U.alpha, pal.alpha);
    };
    applyPalette();

    const themeWatch = new MutationObserver(applyPalette);
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // staggered so they don't all launch together
    const blobs: Blob[] = Array.from({ length: NB }, (_, i) => {
      const baseR = 0.085 + ((i * 41) % 9) / 240;
      const lane = 0.22 + (i / (NB - 1)) * 0.56;
      return {
        lane,
        x: lane,
        y: POOL_TOP + i * 0.16,
        vx: 0,
        vy: 0,
        r: baseR,
        baseR,
        temp: 0.55 + i * 0.1,
        seed: i * 12.9898,
      };
    });

    const bData = new Float32Array(NB * 3);
    const wData = new Float32Array(NB * 3);

    /* real cursor, plus a lagged copy. the lag is what makes the wax feel
       viscous — it resists the cursor instead of tracking it exactly */
    const ptr = { x: 0.5, y: 0.5, lx: 0.5, ly: 0.5, vx: 0, vy: 0, on: 0, r: 0 };
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX / window.innerWidth;
      ptr.y = 1 - e.clientY / window.innerHeight; // GL y is up
      ptr.on = 1;
    };
    const onLeave = () => {
      ptr.on = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    let aspect = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      aspect = w / h;
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      // drawing buffer is DPR-scaled; the element must stay at CSS size
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const step = (dt: number) => {
      t += dt;

      // ── cursor: lagged position + its own velocity, both smoothed ────────
      const pk = 1 - Math.exp(-dt * 5.5);
      const plx = ptr.lx;
      const ply = ptr.ly;
      ptr.lx += (ptr.x - ptr.lx) * pk;
      ptr.ly += (ptr.y - ptr.ly) * pk;
      const rawVx = (ptr.lx - plx) / Math.max(dt, 0.0001);
      const rawVy = (ptr.ly - ply) / Math.max(dt, 0.0001);
      // smooth the velocity too, so the wake decays instead of snapping off
      const vk = 1 - Math.exp(-dt * 3.2);
      ptr.vx += (rawVx - ptr.vx) * vk;
      ptr.vy += (rawVy - ptr.vy) * vk;

      const speed = Math.hypot(ptr.vx, ptr.vy);
      // cavity swells with how fast you're moving, and drains slowly
      const targetR = ptr.on ? 0.075 + Math.min(speed * 0.16, 0.05) : 0;
      ptr.r += (targetR - ptr.r) * (1 - Math.exp(-dt * (targetR > ptr.r ? 5 : 2)));

      for (let i = 0; i < NB; i++) {
        const b = blobs[i];

        // ── thermodynamics: gain heat low, lose it high ──────────────────
        const heat = Math.max(0, 1 - (b.y - POOL_TOP) / 0.3);
        const cool = Math.max(0, (b.y - 0.55) / 0.45);
        b.temp += (heat * 0.5 - cool * 0.55 - 0.02) * dt;
        b.temp = Math.min(1, Math.max(0, b.temp));

        // ── buoyancy: hotter than neutral rises, colder sinks ────────────
        b.vy += (b.temp - 0.5) * 0.34 * dt;

        // lazy horizontal convection, different drift per blob
        b.vx += Math.sin(t * 0.11 + b.seed) * 0.02 * dt;

        /* Very weak pull back to its column. Without this a cursor sweep herds
           every blob to one side and the composition never recovers — real wax
           stays in a rough column because the convection cell holds it there. */
        b.vx += (b.lane - b.x) * 0.09 * dt;

        // ── cursor impulse: a push, not a repositioning ──────────────────
        if (ptr.on) {
          const dx = (b.x - ptr.lx) * aspect;
          const dy = b.y - ptr.ly;
          const dist = Math.hypot(dx, dy) || 0.00001;
          const R = 0.4;
          if (dist < R) {
            const f = (1 - dist / R) ** 2 * (0.5 + Math.min(speed * 1.4, 1.6));
            b.vx += (dx / dist / aspect) * f * 0.55 * dt;
            b.vy += (dy / dist) * f * 0.55 * dt;
          }
        }

        // ── viscous drag: high, so nothing ever moves quickly ────────────
        const drag = Math.exp(-dt * 1.5);
        b.vx *= drag;
        b.vy *= drag;

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // ── soft walls: damped, so wax settles against them like liquid ──
        const rEff = b.r * GROW_MAX;
        const mx = rEff / aspect;
        if (b.x < mx) {
          b.x = mx;
          b.vx = Math.abs(b.vx) * 0.25;
        } else if (b.x > 1 - mx) {
          b.x = 1 - mx;
          b.vx = -Math.abs(b.vx) * 0.25;
        }
        if (b.y < rEff) {
          b.y = rEff;
          b.vy = Math.abs(b.vy) * 0.2;
        } else if (b.y > 1 - rEff) {
          b.y = 1 - rEff;
          b.vy = -Math.abs(b.vy) * 0.2;
        }

        // slight swell when hot, like the real thing expanding
        const target = b.baseR * (1 + b.temp * 0.1);
        b.r += (target - b.r) * (1 - Math.exp(-dt * 1.2));

        bData[i * 3] = b.x;
        bData[i * 3 + 1] = b.y;
        bData[i * 3 + 2] = b.r;
        wData[i * 3] = b.seed;
        wData[i * 3 + 1] = b.vx;
        wData[i * 3 + 2] = b.vy;
      }
    };

    const draw = () => {
      gl.uniform1f(U.time, t);
      gl.uniform3fv(U.blobs, bData);
      gl.uniform3fv(U.wob, wData);
      gl.uniform2f(U.ptr, ptr.lx, ptr.ly);
      gl.uniform2f(U.ptrV, ptr.vx, ptr.vy);
      gl.uniform1f(U.ptrR, ptr.r);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      raf = requestAnimationFrame(frame);
      if (!activeRef.current || document.hidden) return;
      resize();
      step(dt);
      draw();
    };

    if (reduced.matches) {
      // settle the sim without animating, then paint one frame
      for (let i = 0; i < 240; i++) step(1 / 30);
      draw();
    } else {
      // warm up so the first visible frame isn't a neat row of blobs
      for (let i = 0; i < 300; i++) step(1 / 30);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="lava" data-on={active} aria-hidden="true" />;
}
