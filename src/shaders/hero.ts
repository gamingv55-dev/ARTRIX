/**
 * ═══════════════════════════════════════════════════════════════════════
 * HERO DISPLACEMENT SHADER
 *
 * Applied to one image, in one place: the hero panel. It warps the photograph
 * by well under one percent — a slow ambient drift, plus a localised pull that
 * follows the cursor — with a chromatic split scaled by the displacement, so
 * the fringing only appears exactly where the surface is moving.
 *
 * The intent is that nobody consciously notices it. The photograph should read
 * as very slightly alive, the way cloth is never quite still. If it announces
 * itself as an effect the amplitude is too high.
 *
 * Written as raw WebGL2 rather than through Three.js or R3F: this is a single
 * textured quad, and pulling in a scene graph, a camera and a renderer to draw
 * two triangles would cost ~150 KB for abstractions none of which are used.
 * Uniforms are documented in HeroCanvas.tsx, which owns the render loop.
 * ═══════════════════════════════════════════════════════════════════════
 */

export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  // a_position is a full-screen triangle pair in clip space; UV is derived
  // rather than supplied so there is only one attribute buffer to manage.
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColour;

uniform sampler2D u_texture;
uniform vec2  u_resolution;   // canvas size in device pixels
uniform vec2  u_imageSize;    // natural size of the texture
uniform vec2  u_pointer;      // 0..1 within the canvas, smoothed on the CPU
uniform float u_pointerForce; // 0..1, falls to 0 when the pointer leaves
uniform float u_time;         // seconds
uniform float u_intro;        // 0..1 reveal progress on first paint

// ── Value noise ────────────────────────────────────────────────────────────
// Three octaves is enough for a drift this slow, and it is a great deal
// cheaper than simplex for an effect nobody is meant to resolve.

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f); // smoothstep interpolation

  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    total += noise(p) * amplitude;
    p *= 2.02;          // non-integer lacunarity avoids a visible grid
    amplitude *= 0.5;
  }
  return total;
}

// Reproduces CSS object-fit: cover, so the canvas crops the photograph
// identically to the <img> it replaces and swapping between them is invisible.
vec2 coverUv(vec2 uv, vec2 canvas, vec2 image) {
  float canvasAspect = canvas.x / canvas.y;
  float imageAspect  = image.x / image.y;
  vec2 scale = canvasAspect > imageAspect
    ? vec2(1.0, imageAspect / canvasAspect)
    : vec2(canvasAspect / imageAspect, 1.0);
  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = coverUv(v_uv, u_resolution, u_imageSize);

  // Ambient drift: two noise fields sampled at an offset so x and y are
  // decorrelated, otherwise the whole frame slides diagonally.
  float t = u_time * 0.045;
  float nx = fbm(uv * 2.6 + vec2(t, 0.0)) - 0.5;
  float ny = fbm(uv * 2.6 + vec2(0.0, t) + 21.7) - 0.5;
  vec2 drift = vec2(nx, ny) * 0.0042;

  // Pointer pull: a soft gaussian well that drags the surface toward the
  // cursor. Aspect-corrected so the falloff stays circular on a tall panel.
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  float dist = length((v_uv - u_pointer) * aspect);
  float well = exp(-dist * dist * 7.0) * u_pointerForce;
  vec2 pull = normalize(v_uv - u_pointer + 1e-5) * well * -0.014;

  vec2 offset = drift + pull;

  // Chromatic split proportional to how much this pixel actually moved, so
  // the fringing is invisible at rest and never exceeds about a pixel.
  float magnitude = length(offset);
  vec2 split = offset * (0.42 + magnitude * 8.0);

  float r = texture(u_texture, uv + offset + split * 0.35).r;
  float g = texture(u_texture, uv + offset).g;
  float b = texture(u_texture, uv + offset - split * 0.35).b;

  vec3 colour = vec3(r, g, b);

  // Intro: a soft wipe from the bottom matching the CSS frame reveal, so the
  // canvas arrives with the same gesture as every other image on the page.
  float edge = smoothstep(u_intro - 0.18, u_intro + 0.02, 1.0 - v_uv.y);
  float alpha = 1.0 - edge;

  outColour = vec4(colour, alpha);
}
`;
