"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  }

  return (
    <div style={s.root}>
      <motion.div
        animate={{ left: mousePos.x - 250, top: mousePos.y - 250 }}
        transition={{ type: "spring", damping: 25, stiffness: 150 }}
        style={s.cursorGlow}
      />

      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -80, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          style={{
            ...s.particle,
            left: `${5 + i * 8}%`,
            top: `${20 + (i % 4) * 20}%`,
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            background: i % 2 === 0 ? "#FF6B6B" : "#4ECDC4",
          }}
        />
      ))}

      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={s.leftPanel}
      >
        <a href="/" style={s.logo}>
          <span style={{ fontSize: 28, color: "#FF6B6B" }}>◈</span>
          <span style={s.logoText}>Apex</span>
        </a>

        <div style={s.leftContent}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <h2 style={s.leftTitle}>Welcome<br /><span style={{ color: "#FF6B6B" }}>back.</span></h2>
            <p style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", marginBottom: 60 }}>Your academic future is waiting.</p>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
            {[
              { val: "50K+", label: "Active Students" },
              { val: "$2M+", label: "Scholarships Found" },
              { val: "4.9★", label: "Avg Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                style={s.leftStat}
              >
                <div style={s.leftStatVal}>{stat.val}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={s.rightPanel}
      >
        <div style={s.formCard}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: "-1px", marginBottom: 10 }}>Sign In</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)" }}>
              New here?{" "}
              <a href="/signup" style={{ color: "#FF6B6B", textDecoration: "none", fontWeight: 600 }}>Create an account →</a>
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            {["G  Google", "⌘  Apple"].map((label) => (
              <motion.button key={label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={s.socialBtn}>
                {label}
              </motion.button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Email</label>
              <motion.input
                whileFocus={{ boxShadow: "0 0 0 2px rgba(255,107,107,0.4)" }}
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={s.label}>Password</label>
                <a href="/forgot" style={{ color: "#FF6B6B", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>Forgot?</a>
              </div>
              <motion.input
                whileFocus={{ boxShadow: "0 0 0 2px rgba(255,107,107,0.4)" }}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={s.input}
                required
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(255,107,107,0.35)" }}
              whileTap={{ scale: 0.98 }}
              style={s.submitBtn}
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ display: "inline-block" }}>◈</motion.span>
                    Signing in...
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign In →</motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", display: "flex", background: "#0A0A0F", color: "#fff", fontFamily: "'Syne', system-ui, sans-serif", overflow: "hidden", position: "relative" as const },
  cursorGlow: { position: "fixed" as const, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.06) 0%, transparent 70%)", pointerEvents: "none" as const, zIndex: 0 },
  particle: { position: "fixed" as const, borderRadius: "50%", pointerEvents: "none" as const, zIndex: 0 },
  leftPanel: { width: "45%", padding: "48px 60px", display: "flex", flexDirection: "column" as const, background: "linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(78,205,196,0.03) 100%)", borderRight: "1px solid rgba(255,255,255,0.06)", position: "relative" as const, zIndex: 10 },
  logo: { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" },
  logoText: { fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  leftContent: { flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "center" },
  leftTitle: { fontSize: 72, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 20 },
  leftStat: { display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 },
  leftStatVal: { fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#FF6B6B,#4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", position: "relative" as const, zIndex: 10 },
  formCard: { width: "100%", maxWidth: 440 },
  socialBtn: { flex: 1, padding: "13px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  label: { display: "block", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 },
  input: { width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const },
  submitBtn: { width: "100%", padding: "16px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", marginTop: 8, fontFamily: "inherit" },
};

