import { useEffect, useRef } from 'react';
import { Shield, Eye, Lock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import CountUp from 'react-countup';

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void; key?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const mouse = { x: -999, y: -999 };

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * 2400,
      y: Math.random() * 1400,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.45 + 0.1,
      c: [
        '225,29,72',
        '219,39,119',
        '244,63,94',
        '217,70,239',
      ][Math.floor(Math.random() * 4)]
    }));

    const waves = [
      { amp: 60, freq: 0.007, sp: 0.22, ph: 0, a: 0.04, c: '225,29,72' },
      { amp: 38, freq: 0.011, sp: 0.38, ph: 2, a: 0.028, c: '219,39,119' },
      { amp: 80, freq: 0.005, sp: 0.16, ph: 4, a: 0.022, c: '244,63,94' },
    ];

    const stars = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 0.9 + 0.2,
      a: Math.random() * 0.2 + 0.04,
      twinkle: Math.random() * Math.PI * 2,
      c: ['225,29,72', '219,39,119', '244,63,94'][Math.floor(Math.random() * 3)]
    }));

    let t = 0;
    let animationFrameId: number;

    function draw() {
      if (!ctx) return;

      ctx.fillStyle = 'rgba(12,6,7,0.25)';
      ctx.fillRect(0, 0, W, H);

      t += 0.012;

      stars.forEach(s => {
        s.twinkle += 0.022;
        const alpha = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.c},${alpha})`;
        ctx.fill();
      });

      waves.forEach(w => {
        w.ph += w.sp * 0.012;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = H * 0.55
            + Math.sin(x * w.freq + w.ph) * w.amp
            + Math.cos(x * w.freq * 0.55 + w.ph * 0.65) * w.amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${w.c},${w.a})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      pts.forEach(p => {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) { p.vx += (dx / d) * 0.05; p.vy += (dy / d) * 0.05; }
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fill();
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(225,29,72,${0.055 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      pts.forEach(p => {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(225,29,72,${0.07 * (1 - d / 160)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      const sy = ((t * 26) % (H + 80)) - 40;
      const sg = ctx.createLinearGradient(0, sy - 30, 0, sy + 30);
      sg.addColorStop(0, 'rgba(225,29,72,0)');
      sg.addColorStop(0.5, 'rgba(225,29,72,0.016)');
      sg.addColorStop(1, 'rgba(225,29,72,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, sy - 30, W, 60);

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const cursorEl = document.getElementById('cursor');
    const ringEl = document.getElementById('cursorRing');
    if (!cursorEl || !ringEl) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let animFrame: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursorEl.style.left = mx - 4 + 'px';
      cursorEl.style.top = my - 4 + 'px';
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animR = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ringEl.style.left = rx - 18 + 'px';
      ringEl.style.top = ry - 18 + 'px';
      animFrame = requestAnimationFrame(animR);
    };
    animR();

    const hoverElements = document.querySelectorAll('button,a,.landing-card,.tag,.node');
    const handleMouseEnter = () => cursorEl.classList.add('big');
    const handleMouseLeave = () => cursorEl.classList.remove('big');

    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

    const gridEl = document.querySelector('.grid-lines') as HTMLElement;
    const handleScroll = () => {
      if (gridEl) gridEl.style.backgroundPositionY = (window.scrollY * 0.25) + 'px';
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
      hoverElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-container">
      <style>{`
        .landing-container {
          --bg:       #0c0607;
          --bg2:      #1a0a0d;
          --surface:  #1c0e11;
          --border:   rgba(225,29,72,0.12);
          --text:     #fef2f2;
          --muted:    #a8a29e;
          --accent:   #e11d48;
          --accent2:  #db2777;
          --accent3:  #f43f5e;
          --accentSoft: rgba(225,29,72,0.12);
          --accentSoft2: rgba(219,39,119,0.10);
          background: var(--bg);
          color: var(--text); cursor: default;
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }
        .landing-container * { box-sizing: border-box; margin: 0; padding: 0; }
        #bgCanvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

        .cursor {
          width: 8px; height: 8px; background: var(--accent); display: none;
          border-radius: 50%; position: fixed; pointer-events: none;
          z-index: 9999; mix-blend-mode: multiply;
          transition: width .2s, height .2s;
        }
        .cursor.big { width: 22px; height: 22px; }
        .cursor-ring {
          width: 36px; height: 36px;
          border: 1.5px solid rgba(225,29,72,0.4);
          border-radius: 50%; position: fixed; pointer-events: none; z-index: 9998; display: none;
        }

        .landing-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px;
          background: rgba(12,6,7,0.85); backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
          animation: navDrop .9s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes navDrop { from{transform:translateY(-100%);opacity:0} to{transform:none;opacity:1} }
        .nav-logo {
          width: 36px; height: 36px;
          border: 1.5px solid rgba(225,29,72,0.35);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 14px; color: var(--accent);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(225,29,72,0)}
          50%    {box-shadow:0 0 18px 5px rgba(225,29,72,0.18)}
        }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a {
          color: var(--muted); text-decoration: none; font-size: 13px;
          letter-spacing: .02em; transition: color .25s; position: relative;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: -3px; left: 0; right: 0;
          height: 1.5px; background: var(--accent);
          transform: scaleX(0); transform-origin: left; transition: transform .3s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 14px;
          border: 1px solid rgba(225,29,72,0.25); border-radius: 20px;
          font-size: 12px; color: var(--accent);
          background: rgba(225,29,72,0.06);
        }
        .nav-badge::before {
          content: ''; width: 6px; height: 6px; background: var(--accent);
          border-radius: 50%; animation: blink 1.8s infinite;
        }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        .btn-create {
          font-size: 13px; color: var(--text); background: none; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color .2s;
        }
        .btn-create:hover { color: var(--accent); }

        .hero {
          position: relative; z-index: 1; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden; padding: 120px 48px 80px;
        }
        .aurora {
          position: absolute; border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
          filter: blur(90px); pointer-events: none; will-change: transform, border-radius;
        }
        .aurora-1 {
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(225,29,72,0.18) 0%, transparent 70%);
          top: -8%; right: -4%;
          animation: morph1 14s ease-in-out infinite alternate;
        }
        .aurora-2 {
          width: 550px; height: 480px;
          background: radial-gradient(ellipse, rgba(219,39,119,0.13) 0%, transparent 70%);
          bottom: 0; left: -4%;
          animation: morph2 17s ease-in-out infinite alternate;
        }
        .aurora-3 {
          width: 420px; height: 420px;
          background: radial-gradient(ellipse, rgba(244,63,94,0.10) 0%, transparent 70%);
          top: 40%; left: 38%;
          animation: morph3 11s ease-in-out infinite alternate;
        }
        @keyframes morph1 {
          0%  {border-radius:60% 40% 70% 30%/50% 60% 40% 50%;transform:translate(0,0) scale(1)}
          40% {border-radius:40% 60% 30% 70%/60% 40% 70% 30%;transform:translate(-40px,30px) scale(1.08)}
          100%{border-radius:50% 50% 40% 60%/40% 50% 60% 50%;transform:translate(-10px,40px) scale(1.04)}
        }
        @keyframes morph2 {
          0%  {border-radius:50% 50% 60% 40%/60% 40% 50% 50%;transform:translate(0,0) scale(1)}
          60% {border-radius:30% 70% 40% 60%/50% 50% 70% 30%;transform:translate(30px,-30px) scale(1.1)}
          100%{border-radius:70% 30% 60% 40%/40% 60% 30% 70%;transform:translate(-20px,20px) scale(.9)}
        }
        @keyframes morph3 {
          0%  {border-radius:40% 60% 50% 50%/50% 40% 60% 50%;transform:translate(0,0)}
          100%{border-radius:60% 40% 40% 60%/60% 50% 40% 50%;transform:translate(-30px,30px) scale(1.15)}
        }

        .grid-lines {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(225,29,72,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(225,29,72,0.055) 1px, transparent 1px);
          background-size: 80px 80px;
          animation: gridMove 10s linear infinite;
        }
        @keyframes gridMove { from{background-position:0 0} to{background-position:80px 80px} }

        .node {
          position: absolute; display: flex; flex-direction: column;
          align-items: flex-start; gap: 2px;
        }
        .node-icon {
          width: 32px; height: 32px;
          border: 1px solid rgba(225,29,72,0.2);
          border-radius: 8px; display: flex; align-items: center;
          justify-content: center; font-size: 12px; color: var(--accent);
          margin-bottom: 6px;
          background: rgba(28,14,17,0.85);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(225,29,72,0.12);
          animation: iconGlow 3s ease-in-out infinite;
        }
        @keyframes iconGlow {
          0%,100%{box-shadow:0 2px 12px rgba(225,29,72,0.1)}
          50%    {box-shadow:0 4px 24px rgba(225,29,72,0.28)}
        }
        .node-dot {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--text); font-family: 'Syne', sans-serif; font-weight: 600;
        }
        .node-dot::before { content: '•'; color: var(--accent); font-size: 16px; }
        .node-val { font-size: 11px; color: var(--muted); padding-left: 16px; }
        .node-cortex { top: 20%; left: 7%; animation: nf1 7s ease-in-out infinite; }
        .node-quant  { top: 20%; right: 7%; animation: nf2 9s ease-in-out infinite; }
        .node-aelf   { top: 54%; left: 5%; animation: nf3 8s ease-in-out infinite; }
        .node-meeton { top: 54%; right: 5%; animation: nf4 6s ease-in-out infinite; }
        @keyframes nf1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes nf2{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
        @keyframes nf3{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes nf4{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}

        .connector {
          position: absolute; height: 1px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(225,29,72,0.2), transparent);
          overflow: visible;
        }
        .connector::after {
          content: ''; position: absolute; top: -3px; left: 0;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent); box-shadow: 0 0 10px rgba(225,29,72,0.6);
          animation: travel 4s linear infinite;
        }
        .connector-b::after {
          animation-delay: -2s; animation-duration: 5s;
          background: var(--accent2); box-shadow: 0 0 10px rgba(219,39,119,0.6);
        }
        @keyframes travel {
          0%  {left:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{left:100%;opacity:0}
        }
        .conn-top { width: 65%; top: 24%; left: 17%; }
        .conn-mid { width: 65%; top: 58%; left: 17%; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 18px;
          border: 1px solid rgba(225,29,72,0.2); border-radius: 20px;
          font-size: 13px; color: var(--muted); margin-bottom: 32px;
          background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
          box-shadow: 0 2px 16px rgba(225,29,72,0.08);
          animation: fadeUp 1s cubic-bezier(.16,1,.3,1) .2s both;
        }
        .hero-badge-icon {
          width: 18px; height: 18px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; font-size: 9px; color: #fff;
          animation: rotateBadge 4s linear infinite;
        }
        @keyframes rotateBadge { to{transform:rotate(360deg)} }
        .hero-badge span { color: var(--accent); font-weight: 600; }

        .hero-headline {
          font-family: 'Syne', sans-serif; font-size: clamp(44px,6vw,82px);
          font-weight: 800; line-height: 1.04; text-align: center;
          letter-spacing: -.03em; max-width: 820px; color: var(--text);
          animation: fadeUp 1s cubic-bezier(.16,1,.3,1) .35s both;
        }
        .hero-headline em {
          font-style: normal;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s ease-in-out infinite;
        }
        @keyframes shimmer { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.25)} }

        .hero-sub {
          margin-top: 20px; font-size: 15px; color: var(--muted);
          text-align: center; max-width: 460px; line-height: 1.7;
          animation: fadeUp 1s cubic-bezier(.16,1,.3,1) .5s both;
        }
        .hero-actions {
          display: flex; gap: 12px; margin-top: 40px;
          animation: fadeUp 1s cubic-bezier(.16,1,.3,1) .65s both;
        }
        .btn-primary {
          padding: 13px 28px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; border: none; border-radius: 24px;
          font-size: 13px; font-weight: 700;
          font-family: 'Syne', sans-serif; cursor: none;
          display: flex; align-items: center; gap: 8px;
          transition: transform .25s, box-shadow .25s; position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(225,29,72,0.35);
        }
        .btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%); transition: transform .5s;
        }
        .btn-primary:hover::before { transform: translateX(100%); }
        .btn-primary:hover { transform: scale(1.04); box-shadow: 0 8px 32px rgba(225,29,72,0.45); }

        .btn-secondary {
          padding: 13px 28px; background: rgba(28,14,17,0.9); color: var(--text);
          border: 1px solid var(--border); border-radius: 24px; font-size: 13px;
          font-family: 'Syne', sans-serif; cursor: default;
          transition: background .25s, border-color .25s, box-shadow .25s;
          box-shadow: 0 2px 12px rgba(225,29,72,0.06);
        }
        .btn-secondary:hover { background: rgba(28,14,17,1); border-color: rgba(225,29,72,0.3); box-shadow: 0 4px 20px rgba(225,29,72,0.12); }

        .hero-chart {
          position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: flex-end; gap: 3px; height: 110px; opacity: .2;
        }
        .bar {
          width: 2px;
          background: linear-gradient(to top, var(--accent), rgba(219,39,119,0.3));
          border-radius: 2px; transition: height .8s ease;
        }
        .scroll-hint {
          position: absolute; bottom: 28px; left: 48px;
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: var(--muted);
          animation: fadeUp 1s ease 1.2s both;
        }
        .scroll-btn {
          width: 28px; height: 28px; border: 1px solid var(--border); border-radius: 50%;
          background: rgba(28,14,17,0.8);
          display: flex; align-items: center; justify-content: center; font-size: 12px;
          animation: scrollBounce 2s ease-in-out infinite;
          box-shadow: 0 2px 8px rgba(30,40,80,0.08);
        }
        @keyframes scrollBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}
        .defi-label { position: absolute; bottom: 50px; right: 48px; font-size: 12px; color: var(--muted); }
        .defi-label span { display: block; width: 24px; height: 1px; background: var(--muted); margin-top: 6px; opacity: .4; }

        .stats-strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 16px 0; background: rgba(12,6,7,0.7); overflow: hidden;
          backdrop-filter: blur(16px);
        }
        .stats-strip::before,.stats-strip::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 140px; z-index: 2;
        }
        .stats-strip::before { left: 0; background: linear-gradient(to right, rgba(12,6,7,1), transparent); }
        .stats-strip::after  { right: 0; background: linear-gradient(to left, rgba(12,6,7,1), transparent); }
        .stats-track { display: flex; gap: 80px; white-space: nowrap; animation: statsSlide 35s linear infinite; }
        .stat-ticker-item {
          display: flex; align-items: center; gap: 12px;
          font-family: 'Syne', sans-serif; flex-shrink: 0;
        }
        .stat-ticker-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;}
        .stat-ticker-value { font-size: 20px; color: var(--text); font-weight: 800; display: flex; align-items: baseline; }
        .stat-ticker-value span { color: var(--accent); }
        @keyframes statsSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .logos-strip {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 28px 0; background: rgba(12,6,7,0.6); overflow: hidden;
        }
        .logos-strip::before,.logos-strip::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 140px; z-index: 2;
        }
        .logos-strip::before { left: 0; background: linear-gradient(to right, var(--bg), transparent); }
        .logos-strip::after  { right: 0; background: linear-gradient(to left, var(--bg), transparent); }
        .logos-track { display: flex; gap: 64px; white-space: nowrap; animation: logoSlide 22s linear infinite; }
        .logo-item {
          display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--muted);
          font-family: 'Syne', sans-serif; font-weight: 600; opacity: .55; flex-shrink: 0;
          transition: opacity .3s, color .3s;
        }
        .logo-item:hover { opacity: 1; color: var(--accent); }
        @keyframes logoSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .section { position: relative; z-index: 1; padding: 110px 48px; max-width: 1200px; margin: 0 auto; }
        .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: .15em; color: var(--accent); margin-bottom: 12px; font-weight: 600; }
        .section-title { font-family: 'Syne', sans-serif; font-size: clamp(32px,4vw,54px); font-weight: 800; letter-spacing: -.025em; line-height: 1.08; max-width: 560px; color: var(--text); }
        .section-sub { margin-top: 14px; font-size: 15px; color: var(--muted); max-width: 420px; line-height: 1.7; }

        .insights-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 52px; }
        .landing-card {
          background: #1c0e11;
          border: 1px solid var(--border);
          border-radius: 20px; padding: 30px;
          transition: border-color .4s, transform .4s, box-shadow .4s;
          position: relative; overflow: hidden;
          box-shadow: 0 2px 16px rgba(225,29,72,0.06);
        }
        .landing-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 80% 0%, rgba(225,29,72,0.06), transparent 60%);
          opacity: 0; transition: opacity .4s;
        }
        .landing-card:hover {
          border-color: rgba(225,29,72,0.3); transform: translateY(-5px);
          box-shadow: 0 20px 60px rgba(225,29,72,0.12);
        }
        .landing-card:hover::before { opacity: 1; }
        .card-big { grid-column: span 2; }
        .stat-num {
          font-family: 'Syne', sans-serif; font-size: 54px; font-weight: 800;
          letter-spacing: -.04em; line-height: 1;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }
        .card-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-top: 20px; margin-bottom: 6px; color: var(--text); }
        .card-text  { font-size: 13px; color: var(--muted); line-height: 1.6; }
        .mini-bars  { display: flex; align-items: flex-end; gap: 4px; height: 60px; margin-top: 20px; }
        .mini-bar   {
          flex: 1; border-radius: 3px 3px 0 0;
          background: linear-gradient(to top, rgba(225,29,72,0.8), rgba(219,39,119,0.2));
          transition: height 1s ease;
        }
        .tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .tag {
          padding: 4px 12px; border: 1px solid var(--border); border-radius: 12px;
          font-size: 11px; color: var(--muted); transition: border-color .2s, color .2s, background .2s;
          background: var(--bg);
        }
        .tag:hover { border-color: var(--accent); color: var(--accent); background: var(--accentSoft); }
        .tag.active { border-color: rgba(225,29,72,0.35); color: var(--accent); background: var(--accentSoft); }
        .pair-nums { display: flex; gap: 32px; margin-top: 16px; }
        .pair-num { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 700; color: var(--text); }
        .pair-num small { font-size: 12px; color: var(--muted); font-weight: 400; display: block; margin-top: 2px; }

        .wallet-section {
          position: relative; z-index: 1; padding: 110px 48px;
          border-top: 1px solid var(--border);
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);
        }
        .wallet-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: center; }
        .wallet-ui {
          background: #1c0e11; border: 1px solid var(--border);
          border-radius: 26px; padding: 36px; position: relative; overflow: hidden;
          animation: walletFloat 6s ease-in-out infinite;
          box-shadow: 0 8px 48px rgba(225,29,72,0.12);
        }
        @keyframes walletFloat {
          0%,100%{transform:translateY(0);box-shadow:0 8px 48px rgba(225,29,72,0.12)}
          50%{transform:translateY(-10px);box-shadow:0 24px 64px rgba(225,29,72,0.2)}
        }
        .wallet-ui::before {
          content: ''; position: absolute; top: -80px; right: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%);
          animation: walletGlow 4s ease-in-out alternate infinite;
        }
        @keyframes walletGlow{from{opacity:.5}to{opacity:1}}
        .wallet-label { font-size: 11px; color: var(--muted); margin-bottom: 8px; letter-spacing: .1em; text-transform: uppercase; }
        .wallet-balance {
          font-family: 'Syne', sans-serif; font-size: 50px; font-weight: 800; letter-spacing: -.03em;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: balancePulse 3s ease-in-out infinite;
        }
        @keyframes balancePulse {
          0%,100%{filter:brightness(1)} 50%{filter:brightness(1.15)}
        }
        .wallet-stats { display: flex; gap: 12px; margin-top: 16px; }
        .ws {
          flex: 1; background: var(--bg); border: 1px solid var(--border);
          border-radius: 14px; padding: 14px; transition: border-color .3s, box-shadow .3s;
        }
        .ws:hover { border-color: rgba(225,29,72,0.3); box-shadow: 0 4px 16px rgba(225,29,72,0.1); }
        .ws-label { font-size: 10px; color: var(--muted); letter-spacing: .08em; }
        .ws-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-top: 4px; color: var(--text); }
        .wallet-ring {
          width: 180px; height: 180px; border-radius: 50%;
          border: 1.5px solid rgba(225,29,72,0.15);
          margin: 28px auto; position: relative;
          display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle, rgba(225,29,72,0.04) 0%, transparent 70%);
        }
        .wallet-ring::before {
          content: ''; position: absolute; inset: 10px; border-radius: 50%;
          border: 1px solid rgba(225,29,72,0.15);
          animation: ringPulse 2s ease-in-out infinite;
        }
        @keyframes ringPulse{0%,100%{border-color:rgba(225,29,72,0.15)}50%{border-color:rgba(225,29,72,0.5)}}
        .ring-arc {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: var(--accent); border-right-color: var(--accent);
          animation: spinArc 3s linear infinite;
        }
        .ring-arc-2 {
          position: absolute; inset: 6px; border-radius: 50%;
          border: 1.5px solid transparent;
          border-bottom-color: rgba(219,39,119,0.6);
          animation: spinArc 5s linear infinite reverse;
        }
        @keyframes spinArc{to{transform:rotate(360deg)}}
        .ring-inner { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; text-align: center; color: var(--muted); position: relative; z-index: 1; }
        .tags-scroll { display: flex; gap: 8px; margin-top: 20px; flex-wrap: wrap; }

        .cta-section {
          position: relative; z-index: 1; padding: 130px 48px; text-align: center; overflow: hidden;
          background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%);
        }
        .cta-section::before {
          content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 700px; height: 500px;
          background: radial-gradient(ellipse, rgba(225,29,72,0.1) 0%, transparent 70%);
          animation: ctaGlow 6s ease-in-out infinite alternate;
        }
        @keyframes ctaGlow{from{transform:translateX(-50%) scale(1)}to{transform:translateX(-50%) scale(1.15)}}
        .cta-title {
          font-family: 'Syne', sans-serif; font-size: clamp(36px,5vw,66px);
          font-weight: 800; letter-spacing: -.03em;
          max-width: 640px; margin: 0 auto 36px; line-height: 1.05; color: var(--text);
        }

        .footer-bar {
          position: relative; z-index: 1; border-top: 1px solid var(--border);
          padding: 24px 48px; display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: var(--muted); background: #1c0e11;
        }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { color: var(--muted); text-decoration: none; transition: color .2s; }
        .footer-links a:hover { color: var(--accent); }

        .reveal {
          opacity: 0; transform: translateY(32px);
          transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);
        }
        .reveal.visible { opacity: 1; transform: none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
      `}</style>

      <canvas id="bgCanvas" ref={canvasRef}></canvas>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>

      <nav className="landing-nav">
        <div className="nav-logo"><Eye className="w-5 h-5" /></div>
        <ul className="nav-links">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Compliance</a></li>
          <li><div className="nav-badge">Protection ↗</div></li>
        </ul>
        <div><button className="btn-create" onClick={onEnterApp}>⊕ Open Dashboard</button></div>
      </nav>

      <section className="hero">
        <div className="aurora aurora-1"></div>
        <div className="aurora aurora-2"></div>
        <div className="aurora aurora-3"></div>
        <div className="grid-lines"></div>

        <div className="node node-cortex">
          <div className="node-icon">△</div>
          <div className="node-dot">Cortex</div>
          <div className="node-val">AI Engine</div>
        </div>
        <div className="node node-quant">
          <div className="node-icon">✦</div>
          <div className="node-dot">ML Models</div>
          <div className="node-val">98.5%</div>
        </div>
        <div className="node node-aelf">
          <div className="node-icon">⊕</div>
          <div className="node-dot">Real-time</div>
          <div className="node-val">&lt;50ms</div>
        </div>
        <div className="node node-meeton">
          <div className="node-icon">◇</div>
          <div className="node-dot">Coverage</div>
          <div className="node-val">100+</div>
        </div>

        <div className="connector conn-top"></div>
        <div className="connector connector-b conn-mid"></div>

        <div className="hero-badge">
          <div className="hero-badge-icon">A</div>
          Enterprise-Grade Fraud Protection <span>→</span>
        </div>
        <h1 className="hero-headline">AI-Powered <em>Fraud Detection</em> & Prevention</h1>
        <p className="hero-sub">Protect your financial transactions with real-time ML-driven fraud detection, compliance management, and advanced threat intelligence.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onEnterApp}>Get Started ↗</button>
          <button className="btn-secondary" onClick={onEnterApp}>View Demo</button>
        </div>
        <div className="hero-chart" id="heroChart">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bar" style={{ height: `${28 + Math.random() * 60}px` }}></div>
          ))}
        </div>
        <div className="scroll-hint" style={{ bottom: '90px' }}><div className="scroll-btn">↓</div> 02/03 · Scroll down</div>
        <div className="defi-label" style={{ bottom: '80px' }}>Fraud Prevention<span></span></div>
        <div className="stats-strip">
          <div className="stats-track">
            {[1, 2].map((group) => (
              <div key={group} style={{ display: 'flex', gap: '80px' }}>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Total Protected</div>
                  <div className="stat-ticker-value text-[var(--accent)]">
                    <span>₹</span><CountUp end={847} duration={2} delay={0.2} separator="," /><span>M+</span>
                  </div>
                </div>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Nodes Analyzed</div>
                  <div className="stat-ticker-value">
                    <CountUp end={1.2} decimals={1} duration={2} delay={0.4} /><span>M+</span>
                  </div>
                </div>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Detection Rate</div>
                  <div className="stat-ticker-value text-[var(--emerald-400)]">
                    <CountUp end={99.98} decimals={2} duration={2} delay={0.6} /><span>%</span>
                  </div>
                </div>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Threats Blocked</div>
                  <div className="stat-ticker-value">
                    <CountUp end={843000} duration={2.5} delay={0.8} separator="," /><span>+</span>
                  </div>
                </div>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Avg Inference</div>
                  <div className="stat-ticker-value">
                    <CountUp end={45} duration={1.5} delay={1.0} /><span>ms</span>
                  </div>
                </div>
                <div className="stat-ticker-item">
                  <div className="stat-ticker-label">Events Processed</div>
                  <div className="stat-ticker-value">
                    <CountUp end={2.4} decimals={1} duration={2} delay={1.2} /><span>B+</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="logos-strip">
        <div className="logos-track">
          <div className="logo-item">▲ SecureBank</div>
          <div className="logo-item">✳ TrustPay</div>
          <div className="logo-item">◼ PayGuard</div>
          <div className="logo-item">◎ RiskShield</div>
          <div className="logo-item">— VeriFraud</div>
          <div className="logo-item">↗ SecureNet</div>
          <div className="logo-item">⬡ FraudDetect</div>
          <div className="logo-item">▲ SecureBank</div>
          <div className="logo-item">✳ TrustPay</div>
          <div className="logo-item">◼ PayGuard</div>
          <div className="logo-item">◎ RiskShield</div>
          <div className="logo-item">— VeriFraud</div>
          <div className="logo-item">↗ SecureNet</div>
          <div className="logo-item">⬡ FraudDetect</div>
        </div>
      </div>

      <div className="section">
        <p className="section-label reveal">Capabilities</p>
        <h2 className="section-title reveal">Comprehensive Fraud Protection</h2>
        <p className="section-sub reveal">Enterprise-grade fraud detection powered by advanced machine learning and real-time analytics.</p>
        <div className="insights-grid">
          <div className="landing-card card-big reveal">
            <div className="stat-num">98.2%</div>
            <div className="stat-label">Fraud Detection Accuracy</div>
            <div className="tag-row">
              <div className="tag active">AI-Powered</div>
              <div className="tag">Real-time</div>
              <div className="tag">Adaptive</div>
            </div>
            <div className="mini-bars">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="mini-bar" style={{ height: `${12 + Math.random() * 48}px` }}></div>
              ))}
            </div>
          </div>
          <div className="landing-card reveal">
            <div className="card-title">Real-Time Monitoring</div>
            <div className="card-text">Process millions of transactions per second with sub-millisecond fraud detection.</div>
            <div className="mini-bars">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mini-bar" style={{ height: `${12 + Math.random() * 48}px` }}></div>
              ))}
            </div>
          </div>
          <div className="landing-card reveal">
            <div className="card-title">Threat Intelligence</div>
            <div className="card-text">Stay ahead of emerging fraud patterns with collaborative threat sharing.</div>
          </div>
          <div className="landing-card reveal" style={{ background: 'linear-gradient(135deg,#1a0a0d,#1c0e11)' }}>
            <div className="tag-row">
              <div className="tag active">PCI-DSS</div>
              <div className="tag">GDPR</div>
              <div className="tag">RBI</div>
            </div>
            <div className="pair-nums">
              <div className="pair-num">100<small>Compliance</small></div>
              <div className="pair-num">24/7<small>Monitoring</small></div>
            </div>
          </div>
          <div className="landing-card reveal">
            <div className="card-title">Case Management</div>
            <div className="card-text">Streamlined investigation workflow with automated escalation.</div>
          </div>
          <div className="landing-card reveal">
            <div className="card-title">Analytics Dashboard</div>
            <div className="card-text">Comprehensive insights with customizable reports and visualizations.</div>
          </div>
        </div>
      </div>

      <div className="wallet-section">
        <div className="wallet-inner">
          <div>
            <p className="section-label reveal">Features</p>
            <h2 className="section-title reveal">Enterprise Security</h2>
            <p className="section-sub reveal">Built for financial institutions requiring robust fraud prevention and compliance.</p>
            <div style={{ marginTop: '32px' }} className="reveal"><button className="btn-primary" onClick={onEnterApp}>Start Free Trial</button></div>
            <div className="tags-scroll reveal" style={{ marginTop: '24px' }}>
              <div className="tag active">Multi-Layer Security</div>
              <div className="tag active">◆ SOC 2 Certified</div>
              <div className="tag active">● 99.99% Uptime</div>
              <div className="tag">24/7 Support</div>
              <div className="tag">Custom Rules</div>
              <div className="tag">API Integration</div>
              <div className="tag">White-label</div>
            </div>
          </div>
          <div className="wallet-ui reveal">
            <div className="wallet-label">Fraud Prevention System</div>
            <div className="wallet-balance">₹847M+</div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>Fraud Prevented This Month</p>
            <div className="wallet-stats">
              <div className="ws"><div className="ws-label">BLOCKED</div><div className="ws-val">12.4k</div><div style={{ fontSize: '11px', color: 'var(--muted)' }}>Transactions</div></div>
              <div className="ws"><div className="ws-label">FLAGGED</div><div className="ws-val">3.2k</div><div style={{ fontSize: '11px', color: 'var(--muted)' }}>Review Needed</div></div>
              <div className="ws"><div className="ws-label">CLEARED</div><div className="ws-val">1.2M</div><div style={{ fontSize: '11px', color: 'var(--muted)' }}>Approved</div></div>
            </div>
            <div className="wallet-ring">
              <div className="ring-arc"></div>
              <div className="ring-arc-2"></div>
              <div className="ring-inner">98.2%<br /><span style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700 }}>Accuracy</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
              <span>← Blocked<br />High Risk</span><span>Flagged<br />Review</span><span>Cleared ✓<br />Low Risk</span>
            </div>
          </div>
        </div>
      </div>

      <section className="cta-section">
        <h2 className="cta-title reveal">Start Protecting Your Transactions Today</h2>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <button className="btn-primary" onClick={onEnterApp}>Get Started ↗</button>
          <button className="btn-secondary" onClick={onEnterApp}>Schedule Demo</button>
        </div>
      </section>

      <footer className="footer-bar">
        <div>◎ Argus Eye · Enterprise Fraud Protection · 2026</div>
        <div className="footer-links">
          <a href="#">Support</a><a href="#">Privacy</a><a href="#">𝕏</a><a href="#">in</a>
        </div>
      </footer>
    </div>
  );
}
