"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "@/shaders/hero";

/**
 * WebGL renderer for the hero photograph.
 *
 * Owns the GL context, the render loop and the uniform plumbing for
 * src/shaders/hero.ts. Everything expensive is conditional:
 *
 *   - dynamically imported, so no WebGL code reaches any other route
 *   - eligibility is decided by the caller (see useWebGLEligible); this
 *     component assumes it has already been cleared to run
 *   - the loop is suspended when the panel scrolls out of view and when the
 *     tab is hidden, so an idle background tab costs nothing
 *   - device pixel ratio is capped at 1.5 — beyond that the fill cost doubles
 *     for an effect measured in fractions of a pixel
 *   - context loss is handled by unmounting back to the static image rather
 *     than leaving a blank canvas
 *
 * `onReady` fires after the first frame is actually on screen. The caller
 * keeps the plain <img> visible until then, so there is never a blank panel
 * and the LCP element is a real image, not a canvas.
 */
export function HeroCanvas({
  src,
  onReady,
  onFail,
  className,
}: {
  src: string;
  onReady?: () => void;
  onFail?: () => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });

    if (!gl) {
      setFailed(true);
      onFail?.();
      return;
    }

    let disposed = false;
    let frame = 0;
    let visible = true;
    let ready = false;

    /* ── Program ──────────────────────────────────────────────────────── */

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // Surfaced only in development — in production this silently falls
        // back to the static image, which is the correct customer outcome.
        if (process.env.NODE_ENV === "development") {
          console.error("[hero shader]", gl.getShaderInfoLog(shader));
        }
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      setFailed(true);
      onFail?.();
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      onFail?.();
      return;
    }
    gl.useProgram(program);

    /* ── Geometry: one full-screen triangle pair ──────────────────────── */

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const uTexture = uniform("u_texture");
    const uResolution = uniform("u_resolution");
    const uImageSize = uniform("u_imageSize");
    const uPointer = uniform("u_pointer");
    const uPointerForce = uniform("u_pointerForce");
    const uTime = uniform("u_time");
    const uIntro = uniform("u_intro");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    /* ── Texture ──────────────────────────────────────────────────────── */

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(uTexture, 0);

    let imageSize: [number, number] = [1, 1];

    /* ── Sizing ───────────────────────────────────────────────────────── */

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const { clientWidth: w, clientHeight: h } = canvas;
      const width = Math.max(1, Math.round(w * dpr));
      const height = Math.max(1, Math.round(h * dpr));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    /* ── Pointer ──────────────────────────────────────────────────────── */
    // Smoothed on the CPU with a simple lerp: cheaper than doing it per-pixel,
    // and it keeps the pull from snapping when the cursor jumps.

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, force: 0, tForce: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      const inside =
        pointer.tx >= -0.25 && pointer.tx <= 1.25 && pointer.ty >= -0.25 && pointer.ty <= 1.25;
      pointer.tForce = inside ? 1 : 0;
    };
    const onPointerLeave = () => {
      pointer.tForce = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    /* ── Visibility: never render what nobody is looking at ───────────── */

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
      },
      { threshold: 0 },
    );
    intersection.observe(canvas);

    const onVisibilityChange = () => {
      if (document.hidden) visible = false;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    /* ── Context loss ─────────────────────────────────────────────────── */

    const onContextLost = (event: Event) => {
      event.preventDefault();
      disposed = true;
      cancelAnimationFrame(frame);
      setFailed(true);
      onFail?.();
    };
    canvas.addEventListener("webglcontextlost", onContextLost);

    /* ── Loop ─────────────────────────────────────────────────────────── */

    const start = performance.now();
    let intro = 0;

    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (disposed || !ready) return;
      if (!visible && intro >= 1) return; // let the intro finish even offscreen

      const elapsed = (now - start) / 1000;
      intro = Math.min(1, elapsed / 1.2);

      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
      pointer.force += (pointer.tForce - pointer.force) * 0.05;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uImageSize, imageSize[0], imageSize[1]);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPointerForce, pointer.force);
      gl.uniform1f(uTime, elapsed);
      gl.uniform1f(uIntro, intro);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    /* ── Load, then start ─────────────────────────────────────────────── */

    const image = new Image();
    image.decoding = "async";
    image.src = src;

    image
      .decode()
      .then(() => {
        if (disposed) return;
        imageSize = [image.naturalWidth, image.naturalHeight];
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        resize();
        ready = true;
        // One frame later the canvas has actually painted, so the caller can
        // cross-fade away the static image without a gap.
        requestAnimationFrame(() => !disposed && onReady?.());
      })
      .catch(() => {
        if (disposed) return;
        setFailed(true);
        onFail?.();
      });

    frame = requestAnimationFrame(render);

    /* ── Teardown ─────────────────────────────────────────────────────── */

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      // Delete the resources but leave the context alive.
      //
      // Calling WEBGL_lose_context.loseContext() here looks like thorough
      // cleanup and is actively harmful: a lost context stays lost, and
      // getContext() on the same canvas element afterwards hands back the same
      // dead context rather than a fresh one. Every subsequent mount then
      // fails to compile, with a null info log because there is no live
      // context to report against. React StrictMode remounts effects in
      // development, so this killed the shader on the very first load.
      //
      // The context is released with the canvas when React unmounts it.
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, onReady, onFail]);

  if (failed) return null;

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
