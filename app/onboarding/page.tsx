"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    id: "name",
    question: "What's your name?",
    placeholder: "Jordan Lee",
    type: "text",
  },
  {
    id: "school",
    question: "What school do you go to?",
    placeholder: "Lincoln High School",
    type: "text",
  },
  {
    id: "grade",
    question: "What grade are you in?",
    type: "choice",
    choices: ["9th Grade", "10th Grade", "11th Grade", "12th Grade"],
  },
  {
    id: "gpa",
    question: "What's your current GPA?",
    placeholder: "3.8",
    type: "text",
  },
  {
    id: "sat",
    question: "Have you taken the SAT? If so, what's your score?",
    placeholder: "1400 (or 'Not yet')",
    type: "text",
  },
  {
    id: "dream_schools",
    question: "What are your dream schools?",
    placeholder: "MIT, Stanford, UCLA...",
    type: "text",
  },
  {
    id: "interests",
    question: "What are you most interested in?",
    type: "multichoice",
    choices: ["Computer Science", "Medicine", "Business", "Engineering", "Arts", "Law", "Research", "Entrepreneurship"],
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    const value = currentStep.type === "multichoice" ? selectedChoices : currentAnswer;
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }));

    if (isLast) {
      handleSave({ ...answers, [currentStep.id]: value });
    } else {
      setStep((s) => s + 1);
      setCurrentAnswer("");
      setSelectedChoices([]);
    }
  }

  async function handleSave(finalAnswers: Record<string, string | string[]>) {
    if (!user) return;
    setSaving(true);

    await supabase.from("profiles").upsert({
      id: user.id,
      name: finalAnswers.name,
      school: finalAnswers.school,
      grade: finalAnswers.grade,
      gpa: finalAnswers.gpa,
      sat: finalAnswers.sat,
      dream_schools: (finalAnswers.dream_schools as string).split(",").map((s) => s.trim()),
      interests: finalAnswers.interests,
      onboarded: true,
    });

    router.push("/dashboard");
  }

  function toggleChoice(choice: string) {
    setSelectedChoices((prev) =>
      prev.includes(choice) ? prev.filter((c) => c !== choice) : [...prev, choice]
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', system-ui, sans-serif", padding: 32 }}>
      
      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 600, marginBottom: 60 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 100 }}>
          <motion.div
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
            style={{ height: "100%", background: "linear-gradient(135deg,#FF6B6B,#4ECDC4)", borderRadius: 100 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 600, textAlign: "center" }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", color: "#FF6B6B", marginBottom: 16 }}>
            QUESTION {step + 1}
          </div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-1px", marginBottom: 40, lineHeight: 1.2 }}>
            {currentStep.question}
          </h2>

          {currentStep.type === "text" && (
            <input
              autoFocus
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && currentAnswer && handleNext()}
              placeholder={currentStep.placeholder}
              style={{ width: "100%", padding: "20px 24px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, color: "#fff", fontSize: 20, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, textAlign: "center" as const }}
            />
          )}

          {currentStep.type === "choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentStep.choices?.map((choice) => (
                <motion.button
                  key={choice}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCurrentAnswer(choice); }}
                  style={{ padding: "18px 24px", background: currentAnswer === choice ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.05)", border: currentAnswer === choice ? "1px solid #FF6B6B" : "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {choice}
                </motion.button>
              ))}
            </div>
          )}

          {currentStep.type === "multichoice" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {currentStep.choices?.map((choice) => (
                <motion.button
                  key={choice}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleChoice(choice)}
                  style={{ padding: "16px", background: selectedChoices.includes(choice) ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.05)", border: selectedChoices.includes(choice) ? "1px solid #FF6B6B" : "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  {selectedChoices.includes(choice) ? "✓ " : ""}{choice}
                </motion.button>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={
              saving ||
              (currentStep.type === "text" && !currentAnswer) ||
              (currentStep.type === "choice" && !currentAnswer) ||
              (currentStep.type === "multichoice" && selectedChoices.length === 0)
            }
            style={{ marginTop: 32, padding: "18px 48px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 100, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : isLast ? "Go to Dashboard →" : "Next →"}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}