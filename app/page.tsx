"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const NAV_LINKS = ["Features", "Pricing", "About"];

const FEATURES = [
  { icon: "🧠", title: "AI Note Intelligence", desc: "Paste your notes. Get flashcards, summaries, and quiz questions instantly.", color: "#FF6B6B" },
  { icon: "⏱", title: "Smart Scheduler", desc: "Drag-and-drop planner with Pomodoro timers and focus streaks.", color: "#4ECDC4" },
  { icon: "🎓", title: "College Chancing", desc: "Input your stats. See your real odds at any school in the US.", color: "#45B7D1" },
  { icon: "💼", title: "Internship Feed", desc: "Curated high school opportunities, refreshed daily.", color: "#96CEB4" },
  { icon: "💰", title: "Scholarship Engine", desc: "Filter thousands of scholarships by deadline, amount, and fit.", color: "#FFEAA7" },
  { icon: "🌐", title: "Mentor Network", desc: "Connect with mentors from top universities and companies.", color: "#DDA0DD" },
];

const STATS = [
  { val: "50K+", label: "Students" },
  { val: "$2M+", label: "Scholarships Found" },
  { val: "98%", label: "Acceptance Rate" },
  { val: "4.9★", label: "App Rating" },
];

const SCHOOLS = [
  { name: "MIT", chance: 12, color: "#FF6B6B" },
  { name: "Stanford", chance: 8, color: "#FF8E53" },
  { name: "UCLA", chance: 67, color: "#4ECDC4" },
  { name: "UMich", chance: 82, color: "#45B7D1" },
  { name: "Purdue", chance: 91, color: "#96CEB4" },
];

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div style={s.root}>
      {/* Cursor glow */}
      <motion.div
        animate={{ left: mousePos.x - 200, top: mousePos.y - 200 }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        style={s.cursorGlow}
      />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={s.nav}
      >
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={{ fontSize: 28, color: "#FF6B6B" }}>◈</span>
            <span style={s.logoText}>Apex</span>
          </div>
          <div style={s.navLinks}>
            {NAV_LINKS.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} style={s.navLink}>{link}</a>
            ))}
            <a href="/login" style={s.navLink}>Login</a>
            <a href="/signup" style={s.navCta}>Get Started →</a>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section ref={heroRef} style={s.hero}>
        <motion.div style={{ ...s.heroBg, y: yParallax }} />

        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            style={{
              ...s.orb,
              width: 60 + i * 40,
              height: 60 + i * 40,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              background: f.color + "33",
              border: `1px solid ${f.color}44`,
            }}
            animate={{ y: [0, -30, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}

        <div style={s.heroContent}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={s.badge}
          >
            ✦ The #1 Student Operating System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={s.heroTitle}
          >
            Your Entire<br />
            <span style={s.heroGradient}>Academic Life.</span><br />
            One Dashboard.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={s.heroSub}
          >
            Plan. Study. Apply. Succeed. Apex is the all-in-one hub built for high school students who are serious about their future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={s.heroCtas}
          >
            <motion.a href="/signup" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={s.ctaPrimary}>
              Start Free →
            </motion.a>
            <motion.a href="#features" whileHover={{ scale: 1.03 }} style={s.ctaSecondary}>
              ▶ See How It Works
            </motion.a>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={s.scrollIndicator}>
          ↓
        </motion.div>
      </section>

      {/* STATS */}
      <section style={s.statsBar}>
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{ textAlign: "center" }}
          >
            <div style={s.statVal}>{stat.val}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" style={s.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <div style={s.sectionTag}>EVERYTHING YOU NEED</div>
          <h2 style={s.sectionTitle}>Six Tools.<br />One Superpower.</h2>
        </motion.div>

        <div style={s.featuresGrid}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => setActiveFeature(i)}
              onHoverEnd={() => setActiveFeature(null)}
              style={{
                ...s.featureCard,
                border: activeFeature === i ? `1px solid ${f.color}88` : "1px solid rgba(255,255,255,0.08)",
                boxShadow: activeFeature === i ? `0 20px 60px ${f.color}22` : "none",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 20, color: f.color }}>{f.icon}</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: f.color, opacity: activeFeature === i ? 1 : 0, transition: "opacity 0.3s" }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CHANCER PREVIEW */}
      <section style={s.chancerSection}>
        <div style={s.chancerInner}>
          <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={s.sectionTag}>COLLEGE CHANCING</div>
            <h2 style={s.sectionTitle}>Know Your Real Odds.<br /><span style={{ color: "#4ECDC4" }}>Before You Apply.</span></h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "20px 0 36px" }}>
              Enter your GPA, test scores, ECs, and essays. Get data-backed admission probability for every school on your list.
            </p>
            <motion.a href="/signup" whileHover={{ scale: 1.05 }} style={s.ctaPrimary}>Try Chancer Free →</motion.a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
                <span style={{ fontWeight: 700 }}>📊 Your College List</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>GPA: 3.9 | SAT: 1480</span>
              </div>
              {SCHOOLS.map((school, i) => (
                <motion.div key={school.name} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
                  <span style={{ width: 70, fontSize: 14, fontWeight: 600 }}>{school.name}</span>
                  <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${school.chance}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }} viewport={{ once: true }} style={{ height: "100%", borderRadius: 100, background: school.color }} />
                  </div>
                  <span style={{ color: school.color, fontWeight: 700, minWidth: 40 }}>{school.chance}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "120px 32px", maxWidth: 900, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={s.sectionTag}>PRICING</div>
          <h2 style={s.sectionTitle}>Simple. Fair. Powerful.</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {[
            { name: "Free", price: "$0", sub: "Forever free", features: ["Study Tools", "Basic Planner", "GPA Tracker", "3 College Chances/mo"], cta: "Get Started", highlight: false },
            { name: "Apex Pro", price: "$9", sub: "per month", features: ["Everything in Free", "Unlimited Chancing", "Scholarship Engine", "Internship Feed", "AI Note Tools", "Mentor Access"], cta: "Go Pro →", highlight: true },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              style={{ padding: 48, borderRadius: 28, position: "relative" as const, border: plan.highlight ? "1px solid #FF6B6B88" : "1px solid rgba(255,255,255,0.1)", background: plan.highlight ? "linear-gradient(135deg,#FF6B6B11,#4ECDC411)" : "rgba(255,255,255,0.03)" }}
            >
              {plan.highlight && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", padding: "6px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" as const }}>⭐ Most Popular</div>
              )}
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-2px" }}>{plan.price}</span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>/{plan.sub}</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 24 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ padding: "8px 0", fontSize: 15, color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: plan.highlight ? "#FF6B6B" : "#4ECDC4" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <motion.a href="/signup" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} style={{ ...s.ctaPrimary, background: plan.highlight ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.1)", marginTop: 32, display: "block", textAlign: "center" as const }}>
                {plan.cta}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "160px 32px", textAlign: "center" as const, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,107,0.08) 0%, transparent 70%)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 24 }}>
            Your future is being<br /><span style={{ color: "#FF6B6B" }}>decided right now.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 40, fontSize: 20 }}>50,000 students already building their edge. Join them.</p>
          <motion.a href="/signup" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} style={{ ...s.ctaPrimary, fontSize: 22, padding: "20px 60px" }}>
            Start Building Your Advantage →
          </motion.a>
        </motion.div>
      </section>

      <footer style={{ padding: "60px 32px", textAlign: "center" as const, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={s.logo}>
          <span style={{ fontSize: 28, color: "#FF6B6B" }}>◈</span>
          <span style={s.logoText}>Apex</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", marginTop: 16 }}>© 2025 Apex Student Hub. Built for ambition.</p>
      </footer>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Syne', system-ui, sans-serif", background: "#0A0A0F", color: "#fff", overflowX: "hidden" as const, minHeight: "100vh" },
  cursorGlow: { position: "fixed" as const, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)", pointerEvents: "none" as const, zIndex: 0 },
  nav: { position: "fixed" as const, top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  navInner: { maxWidth: 1200, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoText: { fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  navLinks: { display: "flex", alignItems: "center", gap: 32 },
  navLink: { color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 15, fontWeight: 500 },
  navCta: { background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", color: "#fff", textDecoration: "none", padding: "10px 22px", borderRadius: 100, fontSize: 15, fontWeight: 600 },
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", position: "relative" as const, overflow: "hidden", textAlign: "center" as const, padding: "120px 32px 80px" },
  heroBg: { position: "absolute" as const, inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(255,107,107,0.12) 0%, transparent 70%)", pointerEvents: "none" as const },
  orb: { position: "absolute" as const, borderRadius: "50%", pointerEvents: "none" as const },
  heroContent: { position: "relative" as const, zIndex: 10, maxWidth: 900 },
  badge: { display: "inline-block", padding: "8px 20px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 100, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", color: "#FF6B6B", marginBottom: 32 },
  heroTitle: { fontSize: "clamp(52px,8vw,96px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 28 },
  heroGradient: { background: "linear-gradient(135deg,#FF6B6B 0%,#4ECDC4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 20, color: "rgba(255,255,255,0.55)", maxWidth: 600, margin: "0 auto 48px", lineHeight: 1.7 },
  heroCtas: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const },
  ctaPrimary: { background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", color: "#fff", textDecoration: "none", padding: "16px 36px", borderRadius: 100, fontSize: 17, fontWeight: 700, display: "inline-block", cursor: "pointer" },
  ctaSecondary: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", textDecoration: "none", padding: "16px 36px", borderRadius: 100, fontSize: 17, fontWeight: 600, display: "inline-block" },
  scrollIndicator: { position: "absolute" as const, bottom: 40, fontSize: 24, color: "rgba(255,255,255,0.3)" },
  statsBar: { display: "flex", justifyContent: "center", gap: 80, padding: "60px 32px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" as const },
  statVal: { fontSize: 48, fontWeight: 900, background: "linear-gradient(135deg,#FF6B6B,#4ECDC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" },
  statLabel: { fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  featuresSection: { padding: "120px 32px", maxWidth: 1200, margin: "0 auto" },
  sectionTag: { fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "#FF6B6B", marginBottom: 16 },
  sectionTitle: { fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1.1 },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 },
  featureCard: { padding: 40, borderRadius: 24, background: "rgba(255,255,255,0.03)", position: "relative" as const, overflow: "hidden", cursor: "default", transition: "border 0.3s, box-shadow 0.3s" },
  chancerSection: { padding: "120px 32px", background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)" },
  chancerInner: { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" },
};
