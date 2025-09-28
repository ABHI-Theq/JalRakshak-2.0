import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  len: number;
  speedY: number;
  opacity: number;
  driftX: number;
}

export function RainBackground({ intensity = 0.5 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = Math.floor((rect?.width || window.innerWidth) * dpr);
      height = Math.floor((rect?.height || window.innerHeight) * dpr);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${Math.round(width / dpr)}px`;
      canvas.style.height = `${Math.round(height / dpr)}px`;
      spawnDrops();
    }

    function spawnDrops() {
      const count = Math.floor(((width * height) / (1000 * 1000)) * 300 * intensity + 40);
      const drops: Drop[] = [];
      for (let i = 0; i < count; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          len: Math.random() * 12 + 6,
          speedY: Math.random() * 1.2 + 1.1,
          opacity: Math.random() * 0.35 + 0.15,
          driftX: (Math.random() - 0.5) * 0.4,
        });
      }
      dropsRef.current = drops;
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = Math.max(1, 0.9 * dpr);
      ctx.strokeStyle = `hsla(210, 100%, 65%, 0.5)`;
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const drops = dropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.driftX * d.len, d.y + d.len * 2);
        ctx.stroke();
        d.y += d.speedY * dpr * 1.4;
        d.x += d.driftX * dpr;
        if (d.y > height + 20) {
          d.y = -20;
          d.x = Math.random() * width;
        }
      }
      ctx.restore();
      animationRef.current = requestAnimationFrame(step);
    }

    resize();
    step();
    window.addEventListener("resize", resize);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [dpr, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 -z-10 opacity-50 mix-blend-screen"
      aria-hidden="true"
    />
  );
}
