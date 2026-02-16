"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <main
      ref={containerRef}
      className="bg-black text-white overflow-x-hidden"
    >

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-lg border-b border-white/10">
        <div className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            StudentSuccess
          </h1>

          <div className="space-x-6 hidden md:block">
            <a href="#features" className="hover:text-blue-400 transition">
              Features
            </a>

            <a href="#pricing" className="hover:text-blue-400 transition">
              Pricing
            </a>

            <a href="/login" className="hover:text-blue-400 transition">
              Login
            </a>

            <a
              href="/signup"
              className="bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2 rounded-xl hover:opacity-90 transition"
            >
              Get Started
            </a>

            <a href="/contact" className="hover:text-blue-400 transition">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 relative pt-24">

        <motion.div
          style={{ scale, opacity }}
          className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-violet-900/30"
        />

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-extrabold leading-tight z-10"
        >
          The Future of <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Student Success
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl text-gray-400 mt-8 max-w-3xl z-10"
        >
          A powerful academic operating system designed to help high school
          students master productivity, college readiness, and opportunity discovery.
        </motion.p>
      </section>

      {/* IMMERSIVE SCROLL SECTION */}
      <ScrollSection
        id="features"
        title="Turn Notes Into Intelligence"
        description="Capture your notes. Transform them into AI-powered flashcards instantly."
      />

      <ScrollSection
        title="Own Your Time"
        description="Smart productivity tools built for deep focus and measurable progress."
      />

      <ScrollSection
        title="Engineer Your College Path"
        description="Track GPA. Analyze requirements. Visualize what your dream schools demand."
      />

      {/* BIG FEATURE BREAK */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 text-center bg-gradient-to-b from-black to-[#0b0f2a]">

        <motion.h2
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold leading-tight"
        >
          Built For <br />
          <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
            Ambition
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-12 grid md:grid-cols-3 gap-12 max-w-6xl"
        >
          <Feature
            title="Internship Intelligence"
            description="Curated opportunity feeds delivered daily."
          />
          <Feature
            title="Scholarship Engine"
            description="Advanced database with filtering and tracking."
          />
          <Feature
            title="Mentor Network"
            description="Guided research and curated mentorship pathways."
          />
        </motion.div>
      </section>

      {/* PRICING SECTION */}
      <section
        id="pricing"
        className="min-h-screen flex flex-col justify-center items-center px-6 bg-black text-center"
      >

        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold mb-16"
        >
          Choose Your Level
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl">

          <PricingCard
            title="Free"
            price="$0"
            features={[
              "Study Tools",
              "Basic College Planner",
              "GPA Tracking"
            ]}
          />

          <PricingCard
            title="Premium"
            price="$9/mo"
            features={[
              "Internship Alerts",
              "Scholarship Engine",
              "Advanced Analytics",
              "Mentor Network"
            ]}
            highlight
          />

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-t from-black to-[#140f2a]">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-extrabold leading-tight"
        >
          Start Building <br />
          Your Advantage.
        </motion.h2>

        <motion.a
          href="/signup"
          whileHover={{ scale: 1.1 }}
          className="mt-12 bg-gradient-to-r from-blue-500 to-violet-600 px-14 py-6 rounded-2xl text-xl font-semibold"
        >
          Get Started
        </motion.a>
      </section>

    </main>
  );
}

/* SCROLL SECTION */
function ScrollSection({ id, title, description }: any) {
  return (
    <section
      id={id}
      className="min-h-screen flex flex-col justify-center items-center px-6 text-center bg-black"
    >
      <motion.h2
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="text-5xl md:text-7xl font-bold leading-tight"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        viewport={{ once: true }}
        className="text-xl text-gray-400 mt-8 max-w-3xl"
      >
        {description}
      </motion.p>
    </section>
  );
}

/* FEATURE CARD */
function Feature({ title, description }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
    >
      <h3 className="text-2xl font-semibold mb-4">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
}

/* PRICING CARD */
function PricingCard({ title, price, features, highlight }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-12 rounded-3xl border ${
        highlight
          ? "border-blue-500 bg-gradient-to-br from-blue-900/20 to-violet-900/20"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h3 className="text-3xl font-semibold mb-4">{title}</h3>
      <p className="text-5xl font-bold mb-8">{price}</p>
      <ul className="space-y-3 text-gray-400">
        {features.map((f: string, i: number) => (
          <li key={i}>✔ {f}</li>
        ))}
      </ul>
    </motion.div>
  );
}
