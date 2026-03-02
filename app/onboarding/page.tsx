"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  validateName, validateHighSchool, validateGPA, validateSAT,
  validateDreamSchools, validateExtracurriculars, validateAwards,
} from "@/lib/validation";

// ─── GPA SCALES ───────────────────────────────────────────────────────────────

const GPA_SCALES = [
  { value: "4.0",  label: "4.0 scale",     desc: "Standard US unweighted",      example: "e.g. 3.8 / 4.0" },
  { value: "5.0",  label: "5.0 scale",     desc: "Weighted (AP/Honors boost)",  example: "e.g. 4.6 / 5.0" },
  { value: "6.0",  label: "6.0 scale",     desc: "Some US schools",             example: "e.g. 5.2 / 6.0" },
  { value: "7.0",  label: "7.0 scale",     desc: "Australia / New Zealand",     example: "e.g. 5.8 / 7.0" },
  { value: "9.0",  label: "9.0 CGPA",      desc: "India — many universities",   example: "e.g. 8.4 / 9.0" },
  { value: "10.0", label: "10.0 scale",    desc: "India / European unis",       example: "e.g. 8.9 / 10.0" },
  { value: "100",  label: "Percentage %",  desc: "Score out of 100",            example: "e.g. 92%" },
  { value: "12.0", label: "12.0 scale",    desc: "Quebec / some Canadian",      example: "e.g. 10.5 / 12.0" },
];

// ─── STEPS ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "name", emoji: "👋", type: "text",
    question: "What's your name?",
    subtitle: "This is how we'll greet you on your dashboard.",
    placeholder: "Jordan Lee",
  },
  {
    id: "school", emoji: "🏫", type: "text",
    question: "What school do you go to?",
    subtitle: "Helps us personalize your college recommendations.",
    placeholder: "Lincoln High School",
  },
  {
    id: "grade", emoji: "📅", type: "choice",
    question: "What grade are you in?",
    subtitle: "We'll tailor deadlines and advice to where you are.",
    choices: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
  },
  {
    id: "gpa_system", emoji: "📊", type: "gpascale",
    question: "What GPA scale does your school use?",
    subtitle: "We'll automatically convert your GPA for accurate US college comparisons.",
  },
  {
    id: "gpa", emoji: "🎯", type: "text",
    question: "What's your current GPA?",
    subtitle: "Enter it exactly as your school reports it.",
    placeholder: "e.g. 3.8",
  },
  {
    id: "sat", emoji: "📝", type: "text", optional: true,
    question: "Have you taken the SAT or ACT?",
    subtitle: "Enter your best score, or leave blank if you haven't tested yet.",
    placeholder: "e.g. SAT 1400, ACT 32, or leave blank",
  },
  {
    id: "dream_schools", emoji: "🌟", type: "text",
    question: "What are your dream schools?",
    subtitle: "Separate with commas. We'll calculate your real admission chances.",
    placeholder: "MIT, Stanford, UCLA...",
  },
  {
    id: "extracurriculars", emoji: "🏆", type: "textarea", optional: true,
    question: "What are your main extracurriculars?",
    subtitle: "Be specific — activities matter a lot for chancing. Include years and roles.",
    placeholder: "e.g. Debate team captain (3 yrs), Math club founder, Hospital volunteer 200+ hrs...",
  },
  {
    id: "awards", emoji: "🥇", type: "textarea", optional: true,
    question: "Any notable awards or honors?",
    subtitle: "Competitions, scholarships, recognition — include anything impressive.",
    placeholder: "e.g. National Merit Semifinalist, Regional Science Fair 1st place...",
  },
  {
    id: "rec_letters", emoji: "📬", type: "choice",
    question: "How strong are your letters of recommendation?",
    subtitle: "Think about how well your recommenders know and can advocate for you.",
    choices: [
      "Strong — they know me very well and are enthusiastic",
      "Good — solid relationship, positive letters expected",
      "Average — standard letters, nothing exceptional",
      "Not sure yet — haven't asked anyone",
    ],
  },
  {
    id: "interests", emoji: "💡", type: "multichoice",
    question: "What fields interest you most?",
    subtitle: "Select all that apply — helps us match scholarships and internships.",
    choices: ["Computer Science","Medicine","Business","Engineering","Arts","Law","Research","Entrepreneurship","Education","Social Sciences"],
  },
] as const;

type StepId = typeof STEPS[number]["id"];

// ─── VALIDATORS MAP ───────────────────────────────────────────────────────────

function runValidator(stepId: StepId, value: string, gpaScale: string): string | null {
  switch (stepId) {
    case "name":            return validateName(value);
    case "school":          return validateHighSchool(value);
    case "gpa":             return validateGPA(value, gpaScale);
    case "sat":             return value.trim() ? validateSAT(value) : null;
    case "dream_schools":   return validateDreamSchools(value);
    case "extracurriculars":return value.trim() ? validateExtracurriculars(value) : null;
    case "awards":          return value.trim() ? validateAwards(value) : null;
    default:                return null;
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [textValue, setTextValue] = useState("");
  const [selectedScale, setSelectedScale] = useState("4.0");
  const [singleChoice, setSingleChoice] = useState("");
  const [multiChoices, setMultiChoices] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isOptional = "optional" in currentStep && currentStep.optional;
  const gpaScale = (answers.gpa_system as string) || selectedScale || "4.0";
  const scaleInfo = GPA_SCALES.find(s => s.value === gpaScale);
  const progress = ((step + 1) / STEPS.length) * 100;

  // GPA placeholder updates dynamically to match selected scale
  const placeholder =
    currentStep.id === "gpa"
      ? (scaleInfo?.example?.replace("e.g. ", "") || "3.8")
      : "placeholder" in currentStep ? currentStep.placeholder : "";

  // Live validation as user types (only after first blur)
  function handleTextChange(val: string) {
    setTextValue(val);
    if (touched) {
      setError(runValidator(currentStep.id as StepId, val, gpaScale));
    }
  }

  function handleBlur() {
    setTouched(true);
    setError(runValidator(currentStep.id as StepId, textValue, gpaScale));
  }

  function canAdvance(): boolean {
    switch (currentStep.type) {
      case "text":
      case "textarea":
        if (isOptional && !textValue.trim()) return true;
        if (!textValue.trim()) return false;
        return !runValidator(currentStep.id as StepId, textValue, gpaScale);
      case "choice":    return singleChoice.length > 0;
      case "gpascale":  return true;
      case "multichoice": return multiChoices.length > 0;
      default: return false;
    }
  }

  function handleNext() {
    // Force validation on click before advancing
    if (currentStep.type === "text" || currentStep.type === "textarea") {
      const err = isOptional && !textValue.trim()
        ? null
        : runValidator(currentStep.id as StepId, textValue, gpaScale);
      if (err) { setError(err); setTouched(true); return; }
    }

    // Save answer
    let value: string | string[];
    if (currentStep.type === "multichoice") value = multiChoices;
    else if (currentStep.type === "gpascale") value = selectedScale;
    else if (currentStep.type === "choice") value = singleChoice;
    else value = textValue;

    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);

    if (isLast) { handleSave(newAnswers); return; }

    setDirection(1);
    setStep(s => s + 1);
    setTextValue(""); setSingleChoice(""); setMultiChoices([]);
    setError(null); setTouched(false);
  }

  function handleBack() {
    if (step === 0) return;
    const prevStep = STEPS[step - 1];
    const prev = answers[prevStep.id];
    if (Array.isArray(prev)) setMultiChoices(prev);
    else { setTextValue((prev as string) || ""); setSingleChoice((prev as string) || ""); }
    setDirection(-1); setStep(s => s - 1);
    setError(null); setTouched(false);
  }

  function handleSkip() {
    setAnswers(prev => ({ ...prev, [currentStep.id]: "" }));
    setDirection(1); setStep(s => s + 1);
    setTextValue(""); setSingleChoice(""); setMultiChoices([]);
    setError(null); setTouched(false);
  }

  async function handleSave(finalAnswers: Record<string, string | string[]>) {
    if (!user) return;
    setSaving(true);

    const dreamRaw = finalAnswers.dream_schools as string || "";
    const dreamSchools = dreamRaw.split(",").map(s => s.trim()).filter(Boolean);

    const recRaw = finalAnswers.rec_letters as string || "";
    const recStrength = recRaw.startsWith("Strong") ? "Strong"
      : recRaw.startsWith("Good") ? "Good"
      : recRaw.startsWith("Average") ? "Average" : "Unknown";

    const gpaScaleVal = (finalAnswers.gpa_system as string) || "4.0";
    const rawGpaNum   = parseFloat(finalAnswers.gpa as string) || 0;
    const scaleNum    = parseFloat(gpaScaleVal);
    const normalizedGpa = rawGpaNum > 0
      ? (scaleNum !== 4.0 ? ((rawGpaNum / scaleNum) * 4.0).toFixed(2) : rawGpaNum.toFixed(2))
      : "";

    await supabase.from("profiles").upsert({
      id: user.id,
      name: finalAnswers.name,
      school: finalAnswers.school,
      grade: finalAnswers.grade,
      gpa: finalAnswers.gpa,
      gpa_scale: gpaScaleVal,
      gpa_normalized: normalizedGpa,
      gpa_type: "weighted",
      sat: finalAnswers.sat || "",
      dream_schools: dreamSchools,
      extracurriculars: finalAnswers.extracurriculars || "",
      awards: finalAnswers.awards || "",
      rec_letter_strength: recStrength,
      interests: finalAnswers.interests || [],
      onboarded: true,
    });

    router.push("/dashboard");
  }

  // Animation variants
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 56 : -56 }),
    center: { opacity: 1, x: 0 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -56 : 56 }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", fontFamily: "'Syne', system-ui, sans-serif", overflow: "hidden", position: "relative" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-30%", left: "-20%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,107,0.07) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Top bar */}
      <div style={{ position: "relative", zIndex: 1, padding: "24px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
          <span style={{ fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Apex</span>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Step {step + 1} of {STEPS.length}</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 40px", marginBottom: 10 }}>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 100 }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(135deg,#FF6B6B,#4ECDC4)", borderRadius: 100 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ width: i <= step ? 7 : 4, height: i <= step ? 7 : 4, borderRadius: "50%", transition: "all 0.3s",
              background: i < step ? "#4ECDC4" : i === step ? "#FF6B6B" : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 130px)", padding: "20px 40px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ width: "100%", maxWidth: 620, textAlign: "center" }}>

            {/* Emoji */}
            <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05, type: "spring", stiffness: 220 }}
              style={{ fontSize: 52, marginBottom: 16 }}>{currentStep.emoji}</motion.div>

            {/* Label */}
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", color: "#FF6B6B", marginBottom: 12, textTransform: "uppercase" as const }}>
              Question {step + 1}
              {isOptional && <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.28)", fontWeight: 600, fontSize: 10 }}>• Optional</span>}
            </div>

            {/* Question */}
            <h2 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.2, marginBottom: 8 }}>
              {currentStep.question}
            </h2>
            {"subtitle" in currentStep && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, marginBottom: 26 }}>{currentStep.subtitle}</p>}

            {/* ── Text input ── */}
            {(currentStep.type === "text") && (
              <div>
                <input
                  autoFocus
                  value={textValue}
                  onChange={e => handleTextChange(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={e => e.key === "Enter" && canAdvance() && handleNext()}
                  placeholder={placeholder}
                  style={{
                    width: "100%", padding: "16px 22px", borderRadius: 16, fontSize: 18,
                    fontFamily: "inherit", outline: "none", textAlign: "center",
                    boxSizing: "border-box" as const, transition: "border-color 0.2s",
                    color: "#fff",
                    background: error ? "rgba(255,107,107,0.06)" : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${error ? "rgba(255,107,107,0.55)" : touched && !error && textValue ? "rgba(78,205,196,0.45)" : "rgba(255,255,255,0.11)"}`,
                  }}
                />

                {/* GPA normalized live preview */}
                {currentStep.id === "gpa" && textValue && !error && (() => {
                  const sc = parseFloat(gpaScale);
                  const raw = parseFloat(textValue);
                  if (!isNaN(raw) && !isNaN(sc) && sc !== 4.0 && raw > 0 && raw <= sc) {
                    const norm = ((raw / sc) * 4.0).toFixed(2);
                    return (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 10, padding: "8px 16px", background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.2)", borderRadius: 10, fontSize: 13, color: "#4ECDC4", display: "inline-block" }}>
                        ✓ Converts to <strong>{norm} / 4.0</strong> for US college comparison
                      </motion.div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* ── Textarea ── */}
            {currentStep.type === "textarea" && (
              <textarea
                autoFocus
                value={textValue}
                onChange={e => handleTextChange(e.target.value)}
                onBlur={handleBlur}
                placeholder={"placeholder" in currentStep ? currentStep.placeholder : ""}
                style={{
                  width: "100%", padding: "16px 20px", borderRadius: 16, fontSize: 14,
                  fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
                  resize: "vertical" as const, minHeight: 110, lineHeight: 1.7,
                  color: "#fff", transition: "border-color 0.2s",
                  background: error ? "rgba(255,107,107,0.06)" : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${error ? "rgba(255,107,107,0.55)" : touched && !error && textValue ? "rgba(78,205,196,0.45)" : "rgba(255,255,255,0.11)"}`,
                }}
              />
            )}

            {/* ── Inline error ── */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }} transition={{ duration: 0.2 }}
                  style={{ marginTop: 10, padding: "10px 16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 12, fontSize: 13, color: "#FF9090", display: "flex", alignItems: "flex-start", gap: 8, textAlign: "left" as const }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Single choice ── */}
            {currentStep.type === "choice" && "choices" in currentStep && (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {currentStep.choices.map(choice => (
                  <motion.button key={choice} whileHover={{ scale: 1.02, x: 3 }} whileTap={{ scale: 0.98 }} onClick={() => setSingleChoice(choice)}
                    style={{ padding: "15px 20px", borderRadius: 14, fontSize: 14, fontWeight: singleChoice === choice ? 700 : 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
                      background: singleChoice === choice ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${singleChoice === choice ? "rgba(255,107,107,0.5)" : "rgba(255,255,255,0.08)"}`,
                      color: singleChoice === choice ? "#FF9090" : "rgba(255,255,255,0.65)" }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${singleChoice === choice ? "#FF6B6B" : "rgba(255,255,255,0.2)"}`,
                      background: singleChoice === choice ? "#FF6B6B" : "transparent" }}>
                      {singleChoice === choice && <span style={{ fontSize: 9, color: "#fff" }}>✓</span>}
                    </span>
                    {choice}
                  </motion.button>
                ))}
              </div>
            )}

            {/* ── GPA scale grid ── */}
            {currentStep.type === "gpascale" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {GPA_SCALES.map(scale => (
                  <motion.button key={scale.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedScale(scale.value)}
                    style={{ padding: "14px 16px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const, transition: "all 0.15s",
                      background: selectedScale === scale.value ? "rgba(78,205,196,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${selectedScale === scale.value ? "rgba(78,205,196,0.45)" : "rgba(255,255,255,0.08)"}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selectedScale === scale.value ? "#4ECDC4" : "#fff", marginBottom: 2 }}>{scale.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginBottom: 2 }}>{scale.desc}</div>
                    <div style={{ fontSize: 11, fontStyle: "italic" as const, color: selectedScale === scale.value ? "#4ECDC4" : "rgba(255,255,255,0.22)" }}>{scale.example}</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* ── Multi choice ── */}
            {currentStep.type === "multichoice" && "choices" in currentStep && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {currentStep.choices.map(choice => {
                  const active = multiChoices.includes(choice);
                  return (
                    <motion.button key={choice} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => setMultiChoices(prev => active ? prev.filter(c => c !== choice) : [...prev, choice])}
                      style={{ padding: "13px 16px", borderRadius: 14, fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                        background: active ? "rgba(255,107,107,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${active ? "rgba(255,107,107,0.45)" : "rgba(255,255,255,0.08)"}`,
                        color: active ? "#FF9090" : "rgba(255,255,255,0.6)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 5, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
                        border: `2px solid ${active ? "#FF6B6B" : "rgba(255,255,255,0.2)"}`,
                        background: active ? "#FF6B6B" : "transparent", color: "#fff" }}>
                        {active ? "✓" : ""}
                      </span>
                      {choice}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* ── Navigation ── */}
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
              {step > 0 && (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleBack}
                  style={{ padding: "14px 26px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ← Back
                </motion.button>
              )}
              <motion.button whileHover={canAdvance() ? { scale: 1.04 } : {}} whileTap={canAdvance() ? { scale: 0.97 } : {}} onClick={handleNext}
                disabled={saving || !canAdvance()}
                style={{ padding: "14px 42px", border: "none", borderRadius: 100, fontSize: 15, fontWeight: 700, fontFamily: "inherit", transition: "all 0.2s",
                  background: canAdvance() ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)",
                  color: canAdvance() ? "#fff" : "rgba(255,255,255,0.2)",
                  cursor: canAdvance() ? "pointer" : "not-allowed" }}>
                {saving ? "Saving..." : isLast ? "Go to Dashboard →" : "Next →"}
              </motion.button>
            </div>

            {/* ── Skip ── */}
            {isOptional && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleSkip}
                style={{ display: "block", margin: "12px auto 0", background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Skip this question →
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
