"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  due: string;
}

interface NoteSet {
  id: string;
  title: string;
  subject: string;
  content: string;
  flashcards: { q: string; a: string }[];
  practice_questions: PracticeQ[];
  created_at: string;
}

interface PracticeQ {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface CollegeEntry {
  id: string;
  college_name: string;
  chance: number;
  status: string;
}

interface ChanceResult {
  chance: number;
  acceptanceRate: string;
  avgGPA: string;
  avgSAT: string;
  avgACT: string;
  label: string;
  academicRating: number;
  ecRating: number;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  tip: string;
  normalizedGpa: string;
}

interface StudentProfile {
  gpa: string;
  gpaScale: string;
  gpaType: string;
  sat: string;
  act: string;
  apCourses: string;
  classRank: string;
  extracurriculars: string;
  leadershipRoles: string;
  awards: string;
  sportsLevel: string;
  recLetterStrength: string;
  firstGen: boolean;
  legacy: boolean;
  state: string;
  major: string;
  essayStrength: string;
}

interface Profile {
  id: string;
  name: string;
  school: string;
  grade: string;
  gpa: string;
  gpa_scale: string;
  gpa_normalized: string;
  gpa_type: string;
  sat: string;
  extracurriculars: string;
  awards: string;
  rec_letter_strength: string;
  dream_schools: string[];
  interests: string[];
  onboarded: boolean;
}

interface StyleMap { [key: string]: React.CSSProperties; }

const SIDEBAR_ITEMS = [
  { id: "home", icon: "⌂", label: "Home" },
  { id: "planner", icon: "📅", label: "Planner" },
  { id: "notes", icon: "📝", label: "AI Notes" },
  { id: "college", icon: "🎓", label: "College" },
  { id: "scholarships", icon: "💰", label: "Scholarships" },
  { id: "internships", icon: "💼", label: "Internships" },
  { id: "chancer", icon: "📊", label: "Chancer" },
];

const PRIORITY_CONFIG = {
  high: { label: "High", color: "#FF6B6B", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.4)", emoji: "🔴" },
  medium: { label: "Medium", color: "#FFEAA7", bg: "rgba(255,234,167,0.12)", border: "rgba(255,234,167,0.35)", emoji: "🟡" },
  low: { label: "Low", color: "#96CEB4", bg: "rgba(150,206,180,0.12)", border: "rgba(150,206,180,0.35)", emoji: "🟢" },
};

const DUE_OPTIONS = [
  { value: "Today", color: "#FF6B6B", bg: "rgba(255,107,107,0.15)" },
  { value: "Tomorrow", color: "#FF8E53", bg: "rgba(255,142,83,0.15)" },
  { value: "This week", color: "#FFEAA7", bg: "rgba(255,234,167,0.12)" },
  { value: "Next week", color: "#4ECDC4", bg: "rgba(78,205,196,0.12)" },
  { value: "This month", color: "#96CEB4", bg: "rgba(150,206,180,0.12)" },
];

const SCHOLARSHIP_DATA = [
  { name: "Gates Millennium Scholars", amount: "$10,000+", deadline: "Jan 15", url: "https://gmsp.org", tags: ["Need-Based", "Leadership"], desc: "For outstanding minority students with significant financial need." },
  { name: "Coca-Cola Scholars", amount: "$20,000", deadline: "Oct 31", url: "https://www.coca-colascholarsfoundation.org", tags: ["Leadership"], desc: "For exceptional high school seniors demonstrating leadership." },
  { name: "Jack Kent Cooke Foundation", amount: "$40,000", deadline: "Sep 30", url: "https://www.jkcf.org", tags: ["Need-Based"], desc: "For high-achieving students with financial need." },
  { name: "Questbridge National College Match", amount: "Full Ride", deadline: "Sep 27", url: "https://www.questbridge.org", tags: ["Need-Based", "STEM"], desc: "Connects low-income students with top colleges." },
  { name: "Davidson Fellows Scholarship", amount: "$50,000", deadline: "Feb 12", url: "https://www.davidsongifted.org/fellows-scholarship", tags: ["STEM", "Arts"], desc: "For students who complete a significant piece of work." },
  { name: "National Merit Scholarship", amount: "$2,500+", deadline: "PSAT-based", url: "https://www.nationalmerit.org", tags: ["STEM"], desc: "Based on PSAT/NMSQT performance." },
  { name: "Elks National Foundation", amount: "$4,000+", deadline: "Nov 12", url: "https://www.elks.org/enf/scholars", tags: ["Leadership"], desc: "For students demonstrating leadership and community service." },
  { name: "Regeneron Science Talent Search", amount: "$250,000", deadline: "Nov", url: "https://www.societyforscience.org/regeneron-sts", tags: ["STEM"], desc: "Prestigious science competition for high school seniors." },
];

const INTERNSHIP_DATA = [
  { co: "Google", role: "CSSI Computer Science Summer Institute", deadline: "Feb 28", tag: "CS", color: "#4285F4", url: "https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute" },
  { co: "MIT", role: "Research Science Institute (RSI)", deadline: "Dec 15", tag: "Research", color: "#A31F34", url: "https://www.cee.org/research-science-institute" },
  { co: "NASA", role: "High School Apprenticeship Program", deadline: "Mar 1", tag: "STEM", color: "#FC3D21", url: "https://intern.nasa.gov" },
  { co: "Goldman Sachs", role: "Possibilities Summit", deadline: "Mar 15", tag: "Finance", color: "#0066CC", url: "https://www.goldmansachs.com/careers/students" },
  { co: "Microsoft", role: "TEALS Program", deadline: "Rolling", tag: "CS", color: "#00A4EF", url: "https://www.microsoft.com/en-us/teals" },
  { co: "NIH", role: "High School Scientific Training & Enrichment", deadline: "Jan 15", tag: "Research", color: "#1A5276", url: "https://www.training.nih.gov/high_school_students" },
];

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<NoteSet[]>([]);
  const [colleges, setColleges] = useState<CollegeEntry[]>([]);
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [pomodoroSec, setPomodoroSec] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus");
  const [newTask, setNewTask] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function loadAll() {
      if (!isLoaded) return;
      if (!user) { router.push("/login"); return; }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (!profileData?.onboarded) { router.push("/onboarding"); return; }
      setProfile(profileData);

      const { data: taskData } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
      setTasks(taskData || []);

      const { data: noteData } = await supabase.from("note_sets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setNotes((noteData || []).map((n: { flashcards: unknown; practice_questions: unknown; [k: string]: unknown }) => ({
        ...n,
        flashcards: Array.isArray(n.flashcards) ? n.flashcards : JSON.parse((n.flashcards as string) || "[]"),
        practice_questions: Array.isArray(n.practice_questions) ? n.practice_questions : JSON.parse((n.practice_questions as string) || "[]"),
      })) as NoteSet[]);

      const { data: collegeData } = await supabase.from("user_colleges").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
      setColleges(collegeData || []);

      const today = new Date().toDateString();
      const last = localStorage.getItem(`streak_${user.id}`);
      const cnt = parseInt(localStorage.getItem(`streak_cnt_${user.id}`) || "0");
      if (last === today) setStreak(cnt);
      else if (last === new Date(Date.now() - 86400000).toDateString()) {
        setStreak(cnt + 1);
        localStorage.setItem(`streak_cnt_${user.id}`, String(cnt + 1));
        localStorage.setItem(`streak_${user.id}`, today);
      } else {
        setStreak(1);
        localStorage.setItem(`streak_cnt_${user.id}`, "1");
        localStorage.setItem(`streak_${user.id}`, today);
      }
      setAuthLoading(false);
    }
    loadAll();
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!pomodoroRunning) return;
    const t = setInterval(() => {
      if (pomodoroSec > 0) setPomodoroSec(s => s - 1);
      else if (pomodoroMin > 0) { setPomodoroMin(m => m - 1); setPomodoroSec(59); }
      else {
        setPomodoroRunning(false);
        setPomodoroMode(m => m === "focus" ? "break" : "focus");
        setPomodoroMin(pomodoroMode === "focus" ? 5 : 25);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [pomodoroRunning, pomodoroMin, pomodoroSec, pomodoroMode]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    const { data } = await supabase.from("tasks").insert({ user_id: user.id, text: newTask, done: false, priority: "medium", due: "This week" }).select().single();
    if (data) setTasks(prev => [...prev, data]);
    setNewTask("");
  }

  async function toggleTask(id: string) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await supabase.from("tasks").update({ done: !task.done }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const completedTasks = tasks.filter(t => t.done).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Syne', system-ui, sans-serif" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ fontSize: 40, marginBottom: 20 }}>◈</motion.div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>Loading your dashboard...</div>
    </div>
  );

  const displayName = profile?.name || "Student";
  const displayGpa = profile?.gpa || "—";
  const displaySat = profile?.sat || "—";

  return (
    <div style={s.root}>
      <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
          <span style={s.sidebarLogoText}>Apex</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {SIDEBAR_ITEMS.map((item) => (
            <motion.button key={item.id} onClick={() => setActiveTab(item.id)} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              style={{ ...s.sidebarBtn, background: activeTab === item.id ? "rgba(255,107,107,0.12)" : "transparent", borderLeft: activeTab === item.id ? "3px solid #FF6B6B" : "3px solid transparent", color: activeTab === item.id ? "#FF6B6B" : "rgba(255,255,255,0.45)" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
              {activeTab === item.id && <motion.div layoutId="activeIndicator" style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#FF6B6B" }} />}
            </motion.button>
          ))}
        </nav>
        <div style={s.sidebarProfile}>
          <div style={s.avatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{profile?.grade || "Student"}</div>
          </div>
        </div>
      </motion.aside>

      <main style={s.main}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={s.topbar}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>{SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={s.streakBadge}>🔥 {streak} day streak</div>
            <div style={s.avatarSm}>{displayName.charAt(0).toUpperCase()}</div>
          </div>
        </motion.div>

        <div style={{ padding: "28px 32px", flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              {activeTab === "home" && <HomeTab tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} progress={progress} completedTasks={completedTasks} pomodoroMin={pomodoroMin} pomodoroSec={pomodoroSec} pomodoroRunning={pomodoroRunning} pomodoroMode={pomodoroMode} setPomodoroRunning={setPomodoroRunning} setPomodoroMin={setPomodoroMin} setPomodoroSec={setPomodoroSec} setPomodoroMode={setPomodoroMode} newTask={newTask} setNewTask={setNewTask} addTask={addTask} gpa={displayGpa} sat={displaySat} displayName={displayName} setActiveTab={setActiveTab} />}
              {activeTab === "planner" && <PlannerTab tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} newTask={newTask} setNewTask={setNewTask} addTask={addTask} setTasks={setTasks} />}
              {activeTab === "notes" && <NotesTab notes={notes} setNotes={setNotes} userId={user!.id} />}
              {activeTab === "college" && <CollegeTab colleges={colleges} setColleges={setColleges} userId={user!.id} />}
              {activeTab === "scholarships" && <ScholarshipsTab />}
              {activeTab === "internships" && <InternshipsTab />}
              {activeTab === "chancer" && <ChancerTab initialGpa={displayGpa} initialSat={displaySat} userId={user!.id} dreamSchools={profile?.dream_schools || []} colleges={colleges} setColleges={setColleges} fullProfile={profile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────

function HomeTab({ tasks, toggleTask, deleteTask, progress, completedTasks, pomodoroMin, pomodoroSec, pomodoroRunning, pomodoroMode, setPomodoroRunning, setPomodoroMin, setPomodoroSec, setPomodoroMode, newTask, setNewTask, addTask, gpa, sat, displayName, setActiveTab }: {
  tasks: Task[]; toggleTask: (id: string) => void; deleteTask: (id: string) => void; progress: number; completedTasks: number;
  pomodoroMin: number; pomodoroSec: number; pomodoroRunning: boolean; pomodoroMode: string;
  setPomodoroRunning: (v: boolean) => void; setPomodoroMin: (v: number) => void; setPomodoroSec: (v: number) => void; setPomodoroMode: (v: "focus" | "break") => void;
  newTask: string; setNewTask: (v: string) => void; addTask: (e: React.FormEvent) => void; gpa: string; sat: string; displayName: string; setActiveTab: (t: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayTasks = tasks.filter(t => t.due === "Today" && !t.done);

  return (
    <div style={s.homeGrid}>
      {/* Hero banner */}
      <Card style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(78,205,196,0.06))", border: "1px solid rgba(255,107,107,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 6 }}>{greeting}, {displayName} 👋</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>
              {tasks.length === 0 ? "No tasks yet — add one to get started!" : todayTasks.length > 0 ? `${todayTasks.length} task${todayTasks.length > 1 ? "s" : ""} due today. Keep going!` : `${tasks.filter(t => !t.done).length} tasks remaining. Great momentum!`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <StatPill label="GPA" val={gpa} color="#FF6B6B" />
            <StatPill label="SAT" val={sat} color="#4ECDC4" />
            <StatPill label="Done" val={tasks.length === 0 ? "—" : `${completedTasks}/${tasks.length}`} color="#96CEB4" />
          </div>
        </div>
      </Card>

      {/* Progress ring */}
      <Card>
        <div style={s.cardTitle}>Today&apos;s Progress</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", width: 120, height: 120, margin: "0 auto 12px" }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <motion.circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round" strokeDasharray={314} initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: 314 - (314 * progress) / 100 }} transition={{ duration: 1.2, ease: "easeOut" }} transform="rotate(-90 60 60)" />
            <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FF6B6B" /><stop offset="100%" stopColor="#4ECDC4" /></linearGradient></defs>
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{progress}%</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Done</div>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{tasks.length === 0 ? "Add tasks to track" : `${completedTasks} / ${tasks.length} tasks`}</p>
      </Card>

      {/* Pomodoro */}
      <Card>
        <div style={s.cardTitle}>Focus Timer</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
            {(["focus", "break"] as const).map(m => (
              <button key={m} onClick={() => { setPomodoroMode(m); setPomodoroMin(m === "focus" ? 25 : 5); setPomodoroSec(0); setPomodoroRunning(false); }}
                style={{ padding: "5px 14px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", background: pomodoroMode === m ? (m === "focus" ? "rgba(255,107,107,0.2)" : "rgba(78,205,196,0.2)") : "rgba(255,255,255,0.05)", color: pomodoroMode === m ? (m === "focus" ? "#FF6B6B" : "#4ECDC4") : "rgba(255,255,255,0.3)" }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <motion.div style={{ fontSize: 50, fontWeight: 900, letterSpacing: "-2px", marginBottom: 16, color: pomodoroMode === "focus" ? "#FF6B6B" : "#4ECDC4", fontVariantNumeric: "tabular-nums" }} animate={{ scale: pomodoroRunning ? [1, 1.02, 1] : 1 }} transition={{ repeat: Infinity, duration: 1 }}>
            {String(pomodoroMin).padStart(2, "0")}:{String(pomodoroSec).padStart(2, "0")}
          </motion.div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPomodoroRunning(!pomodoroRunning)}
            style={{ padding: "9px 28px", border: "none", borderRadius: 100, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: pomodoroRunning ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#FF6B6B,#FF8E53)" }}>
            {pomodoroRunning ? "⏸ Pause" : "▶ Start"}
          </motion.button>
        </div>
      </Card>

      {/* Tasks */}
      <Card style={{ gridColumn: "span 2" }}>
        <div style={s.cardTitle}>My Tasks</div>
        <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a new task..." style={s.taskInput} />
          <button type="submit" style={s.addBtn}>+</button>
        </form>
        {tasks.length === 0
          ? <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No tasks yet. Add your first one! ✏️</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{tasks.slice(0, 5).map(t => <TaskCard key={t.id} task={t} onToggle={() => toggleTask(t.id)} onDelete={() => deleteTask(t.id)} compact />)}</div>
        }
      </Card>

      {/* Quick links */}
      <Card>
        <div style={s.cardTitle}>Quick Links</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ icon: "📊", label: "Check college chances", tab: "chancer", color: "#FF6B6B" }, { icon: "💰", label: "Find scholarships", tab: "scholarships", color: "#96CEB4" }, { icon: "💼", label: "Browse internships", tab: "internships", color: "#4ECDC4" }, { icon: "📝", label: "AI study tools", tab: "notes", color: "#FFEAA7" }].map(link => (
            <motion.button key={link.tab} whileHover={{ x: 4, background: `rgba(${link.color === "#FF6B6B" ? "255,107,107" : link.color === "#96CEB4" ? "150,206,180" : link.color === "#4ECDC4" ? "78,205,196" : "255,234,167"},0.08)` }} onClick={() => setActiveTab(link.tab)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{link.icon}</span>{link.label}
            </motion.button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── PLANNER TAB ─────────────────────────────────────────────────────────────

function PlannerTab({ tasks, toggleTask, deleteTask, newTask, setNewTask, addTask, setTasks }: {
  tasks: Task[]; toggleTask: (id: string) => void; deleteTask: (id: string) => void;
  newTask: string; setNewTask: (v: string) => void; addTask: (e: React.FormEvent) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [view, setView] = useState<"board" | "list">("board");

  async function updateField(id: string, field: "priority" | "due", value: string) {
    await supabase.from("tasks").update({ [field]: value }).eq("id", id);
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  const groups = {
    high: tasks.filter(t => t.priority === "high" && !t.done),
    medium: tasks.filter(t => t.priority === "medium" && !t.done),
    low: tasks.filter(t => t.priority === "low" && !t.done),
    done: tasks.filter(t => t.done),
  };

  const stats = [
    { label: "Total", val: tasks.length, color: "#fff" },
    { label: "Completed", val: groups.done.length, color: "#4ECDC4" },
    { label: "High Priority", val: groups.high.length, color: "#FF6B6B" },
    { label: "Due Today", val: tasks.filter(t => t.due === "Today" && !t.done).length, color: "#FFEAA7" },
  ];

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {/* Add + view toggle */}
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <form onSubmit={addTask} style={{ display: "flex", gap: 8, flex: 1 }}>
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a new task..." style={{ ...s.taskInput, fontSize: 15, padding: "12px 16px" }} />
              <button type="submit" style={s.addBtn}>+</button>
            </form>
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 }}>
              {(["board", "list"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: view === v ? "rgba(255,255,255,0.12)" : "transparent", color: view === v ? "#fff" : "rgba(255,255,255,0.35)" }}>
                  {v === "board" ? "⬜ Board" : "📋 List"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {view === "board" ? (
          /* KANBAN BOARD */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {(["high", "medium", "low"] as const).map(priority => {
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <div key={priority} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <span>{cfg.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label} Priority</span>
                    <span style={{ marginLeft: "auto", fontSize: 12, padding: "2px 8px", background: `${cfg.color}22`, borderRadius: 100, color: cfg.color }}>{groups[priority].length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                    {groups[priority].map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onDueChange={v => updateField(task.id, "due", v)} onPriorityChange={v => updateField(task.id, "priority", v)} />)}
                    {groups[priority].length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "rgba(255,255,255,0.2)" }}>No tasks</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {(["high", "medium", "low", "done"] as const).map(priority => groups[priority].length > 0 && (
              <Card key={priority}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  {priority !== "done" && <span>{PRIORITY_CONFIG[priority].emoji}</span>}
                  <span style={{ fontSize: 13, fontWeight: 700, color: priority === "done" ? "#4ECDC4" : PRIORITY_CONFIG[priority].color }}>
                    {priority === "done" ? "✅ Completed" : `${PRIORITY_CONFIG[priority].label} Priority`}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>({groups[priority].length})</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {groups[priority].map(task => (
                    <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onDueChange={v => updateField(task.id, "due", v)} onPriorityChange={v => updateField(task.id, "priority", v)} />
                  ))}
                </div>
              </Card>
            ))}
            {tasks.length === 0 && (
              <Card style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✏️</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No tasks yet</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Add your first task above</div>
              </Card>
            )}
          </div>
        )}

        {/* Completed (board view) */}
        {view === "board" && groups.done.length > 0 && (
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#4ECDC4", marginBottom: 12 }}>✅ Completed ({groups.done.length})</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
              {groups.done.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} compact />)}
            </div>
          </Card>
        )}
      </div>

      {/* Stats sidebar */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <Card>
          <div style={s.cardTitle}>📊 Stats</div>
          {stats.map(stat => (
            <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{stat.label}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.val}</span>
            </div>
          ))}
          {tasks.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Completion rate</div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                <motion.div animate={{ width: `${tasks.length === 0 ? 0 : (groups.done.length / tasks.length) * 100}%` }} style={{ height: "100%", background: "linear-gradient(135deg,#4ECDC4,#96CEB4)", borderRadius: 100 }} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── TASK CARD COMPONENT ─────────────────────────────────────────────────────

function TaskCard({ task, onToggle, onDelete, onDueChange, onPriorityChange, compact = false }: {
  task: Task; onToggle: () => void; onDelete: () => void;
  onDueChange?: (v: string) => void; onPriorityChange?: (v: string) => void; compact?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const cfg = PRIORITY_CONFIG[task.priority];
  const dueConfig = DUE_OPTIONS.find(d => d.value === task.due) || DUE_OPTIONS[2];

  if (compact) return (
    <motion.div whileHover={{ x: 2 }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 12, opacity: task.done ? 0.5 : 1 }}>
      <motion.div whileTap={{ scale: 0.8 }} onClick={onToggle} style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${task.done ? "#4ECDC4" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", background: task.done ? "#4ECDC4" : "transparent" }}>
        {task.done && <span style={{ fontSize: 9, color: "#000" }}>✓</span>}
      </motion.div>
      <span style={{ flex: 1, fontSize: 13, textDecoration: task.done ? "line-through" : "none", color: task.done ? "rgba(255,255,255,0.3)" : "#fff" }}>{task.text}</span>
      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: dueConfig.bg, color: dueConfig.color, fontWeight: 600 }}>{task.due}</span>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      <button onClick={onDelete} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 14 }}>×</button>
    </motion.div>
  );

  return (
    <motion.div whileHover={{ y: -1 }} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 14, border: task.done ? "1px solid rgba(255,255,255,0.04)" : `1px solid ${cfg.border}`, opacity: task.done ? 0.5 : 1, position: "relative" as const }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <motion.div whileTap={{ scale: 0.8 }} onClick={onToggle} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? "#4ECDC4" : cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", background: task.done ? "#4ECDC4" : `${cfg.color}18`, marginTop: 1 }}>
          {task.done && <span style={{ fontSize: 10, color: "#000" }}>✓</span>}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? "rgba(255,255,255,0.3)" : "#fff", marginBottom: 8, lineHeight: 1.4 }}>{task.text}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {/* Priority badge — clickable */}
            {onPriorityChange && (
              <div style={{ position: "relative" as const }}>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowMenu(prev => !prev)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 100, border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {cfg.emoji} {cfg.label}
                </motion.button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: "absolute" as const, top: "calc(100% + 6px)", left: 0, zIndex: 100, background: "#1A1A24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 6, display: "flex", flexDirection: "column" as const, gap: 2, minWidth: 140, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                      {(Object.entries(PRIORITY_CONFIG) as [Task["priority"], typeof PRIORITY_CONFIG.high][]).map(([key, c]) => (
                        <motion.button key={key} whileHover={{ background: c.bg }} onClick={() => { onPriorityChange(key); setShowMenu(false); }}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: "none", background: task.priority === key ? c.bg : "transparent", color: c.color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                          {c.emoji} {c.label}
                          {task.priority === key && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* Due date badge — clickable */}
            {onDueChange ? (
              <select value={task.due} onChange={e => onDueChange(e.target.value)}
                style={{ padding: "3px 8px", borderRadius: 100, border: `1px solid ${dueConfig.bg}`, background: dueConfig.bg, color: dueConfig.color, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", appearance: "none" as const }}>
                {DUE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.value}</option>)}
              </select>
            ) : (
              <span style={{ padding: "3px 10px", borderRadius: 100, background: dueConfig.bg, color: dueConfig.color, fontSize: 11, fontWeight: 600 }}>{task.due}</span>
            )}
          </div>
        </div>
        <button onClick={onDelete} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontSize: 16, padding: "0 2px", flexShrink: 0 }}>×</button>
      </div>
    </motion.div>
  );
}

// ─── NOTES TAB ───────────────────────────────────────────────────────────────

function NotesTab({ notes, setNotes, userId }: { notes: NoteSet[]; setNotes: React.Dispatch<React.SetStateAction<NoteSet[]>>; userId: string }) {
  const [selected, setSelected] = useState<NoteSet | null>(null);
  const [mode, setMode] = useState<"flashcards" | "practice" | "summary">("flashcards");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [summary, setSummary] = useState<{ summary: string[]; keyTerms: { term: string; def: string }[] } | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!inputText.trim() || !selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: inputText, mode, difficulty }) });
      const data = await res.json();
      if (mode === "summary") { setSummary(data.result); }
      else {
        const updatePayload: Record<string, string> = { content: inputText };
        if (mode === "flashcards") updatePayload.flashcards = JSON.stringify(data.result);
        if (mode === "practice") updatePayload.practice_questions = JSON.stringify(data.result);
        await supabase.from("note_sets").update(updatePayload).eq("id", selected.id);
        const updated = { ...selected, content: inputText, flashcards: mode === "flashcards" ? data.result : selected.flashcards, practice_questions: mode === "practice" ? data.result : selected.practice_questions };
        setSelected(updated);
        setNotes(prev => prev.map(n => n.id === selected.id ? updated : n));
      }
      setActiveCard(0); setFlipped(false); setPracticeAnswers({});
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setInputText((ev.target?.result as string) || "");
    reader.readAsText(file);
  }

  async function createNoteSet() {
    if (!newTitle.trim()) return;
    const { data } = await supabase.from("note_sets").insert({ user_id: userId, title: newTitle, subject: newSubject || "General", content: "", flashcards: "[]", practice_questions: "[]" }).select().single();
    if (data) { const nn = { ...data, flashcards: [], practice_questions: [] }; setNotes(prev => [nn, ...prev]); setSelected(nn); setShowCreate(false); setNewTitle(""); setNewSubject(""); }
  }

  async function deleteNote(id: string) {
    await supabase.from("note_sets").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* Sidebar */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={s.cardTitle}>📚 Notes</div>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => setShowCreate(!showCreate)} style={{ padding: "5px 12px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 100, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ New</motion.button>
          </div>
          {showCreate && (
            <div style={{ marginBottom: 14, padding: 12, background: "rgba(255,255,255,0.04)", borderRadius: 14 }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title..." style={{ ...s.taskInput, width: "100%", marginBottom: 6, boxSizing: "border-box" as const }} />
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject..." style={{ ...s.taskInput, width: "100%", marginBottom: 8, boxSizing: "border-box" as const }} />
              <div style={{ display: "flex", gap: 6 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={createNoteSet} style={{ flex: 1, padding: "7px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Create</motion.button>
                <button onClick={() => setShowCreate(false)} style={{ padding: "7px 10px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
              </div>
            </div>
          )}
          {notes.length === 0
            ? <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No notes yet</div>
            : notes.map(note => (
              <div key={note.id} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <motion.div whileHover={{ x: 2 }} onClick={() => { setSelected(note); setInputText(note.content || ""); setSummary(null); }}
                  style={{ flex: 1, padding: "10px 12px", background: selected?.id === note.id ? "rgba(255,107,107,0.1)" : "rgba(255,255,255,0.03)", border: selected?.id === note.id ? "1px solid rgba(255,107,107,0.35)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 12, cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{note.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{note.subject} · {(note.flashcards || []).length} cards</div>
                </motion.div>
                <button onClick={() => deleteNote(note.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 16, flexShrink: 0, padding: "0 4px" }}>×</button>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {!selected ? (
          <Card style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📝</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Select or create a note set</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>Upload your notes → AI generates flashcards, practice questions & summaries</div>
          </Card>
        ) : (
          <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div style={s.cardTitle}>📄 {selected.title}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {(["flashcards", "practice", "summary"] as const).map(m => (
                    <motion.button key={m} whileHover={{ scale: 1.04 }} onClick={() => setMode(m)} style={{ padding: "5px 12px", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: mode === m ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)", color: mode === m ? "#fff" : "rgba(255,255,255,0.45)" }}>
                      {m === "flashcards" ? "🃏 Cards" : m === "practice" ? "📝 Quiz" : "📋 Summary"}
                    </motion.button>
                  ))}
                </div>
              </div>
              {mode === "practice" && (
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", alignSelf: "center" }}>Difficulty:</span>
                  {(["easy", "medium", "hard"] as const).map(d => (
                    <motion.button key={d} whileHover={{ scale: 1.05 }} onClick={() => setDifficulty(d)} style={{ padding: "4px 12px", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: difficulty === d ? (d === "easy" ? "#96CEB4" : d === "medium" ? "#FFEAA7" : "#FF6B6B") : "rgba(255,255,255,0.06)", color: difficulty === d ? "#000" : "rgba(255,255,255,0.45)" }}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </motion.button>
                  ))}
                </div>
              )}
              <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Paste your notes here, or upload a .txt or .md file..." style={{ width: "100%", height: 150, padding: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, color: "#fff", fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFileUpload} style={{ display: "none" }} />
                <motion.button whileHover={{ scale: 1.03 }} onClick={() => fileRef.current?.click()} style={{ padding: "10px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📎 Upload</motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleGenerate} disabled={loading || !inputText.trim()} style={{ flex: 1, padding: "10px", background: loading || !inputText.trim() ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "inherit" }}>
                  {loading ? "✨ Generating..." : `✨ Generate ${mode === "flashcards" ? "Flashcards" : mode === "practice" ? "Practice Quiz" : "Summary"}`}
                </motion.button>
              </div>
            </Card>

            {mode === "flashcards" && (selected.flashcards || []).length > 0 && (
              <Card>
                <div style={s.cardTitle}>🃏 Flashcards ({selected.flashcards.length})</div>
                <motion.div onClick={() => setFlipped(f => !f)} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.35 }} style={{ background: "linear-gradient(135deg,rgba(255,107,107,0.08),rgba(78,205,196,0.08))", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 14 }}>
                  <div style={{ padding: 24, textAlign: "center" as const }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{flipped ? "ANSWER" : "QUESTION"} · {activeCard + 1}/{selected.flashcards.length}</div>
                    <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6 }}>{flipped ? selected.flashcards[activeCard]?.a : selected.flashcards[activeCard]?.q}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>Click to flip</div>
                  </div>
                </motion.div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button onClick={() => { setActiveCard(c => Math.max(0, c - 1)); setFlipped(false); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "#fff", padding: "7px 18px", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>←</button>
                  <div style={{ display: "flex", gap: 4 }}>{selected.flashcards.map((_, i) => <div key={i} onClick={() => { setActiveCard(i); setFlipped(false); }} style={{ width: 7, height: 7, borderRadius: "50%", cursor: "pointer", background: i === activeCard ? "#FF6B6B" : "rgba(255,255,255,0.12)" }} />)}</div>
                  <button onClick={() => { setActiveCard(c => Math.min(selected.flashcards.length - 1, c + 1)); setFlipped(false); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "#fff", padding: "7px 18px", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>→</button>
                </div>
              </Card>
            )}

            {mode === "practice" && (selected.practice_questions || []).length > 0 && (
              <Card>
                <div style={s.cardTitle}>📝 Practice Quiz — {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
                {selected.practice_questions.map((q, qi) => (
                  <div key={qi} style={{ padding: 18, background: "rgba(255,255,255,0.03)", borderRadius: 14, marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Q{qi + 1}. {q.question}</div>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
                      {q.options.map((opt, oi) => {
                        const answered = practiceAnswers[qi]; const isCorrect = opt === q.answer; const isSelected = opt === answered;
                        return (
                          <motion.button key={oi} whileHover={!answered ? { x: 4 } : {}} onClick={() => !answered && setPracticeAnswers(p => ({ ...p, [qi]: opt }))}
                            style={{ padding: "10px 14px", border: `1px solid ${answered ? (isCorrect ? "#96CEB4" : isSelected ? "#FF6B6B" : "rgba(255,255,255,0.05)") : "rgba(255,255,255,0.09)"}`, borderRadius: 10, background: answered ? (isCorrect ? "rgba(150,206,180,0.12)" : isSelected ? "rgba(255,107,107,0.12)" : "transparent") : "rgba(255,255,255,0.03)", color: "#fff", cursor: answered ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, textAlign: "left" as const }}>
                            {opt}
                          </motion.button>
                        );
                      })}
                    </div>
                    {practiceAnswers[qi] && <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(78,205,196,0.07)", borderRadius: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{practiceAnswers[qi] === q.answer ? "✅ Correct! " : `❌ Correct: ${q.answer}. `}{q.explanation}</div>}
                  </div>
                ))}
              </Card>
            )}

            {mode === "summary" && summary && (
              <Card>
                <div style={s.cardTitle}>📋 Summary</div>
                {summary.summary?.map((point, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}><span style={{ color: "#FF6B6B", fontWeight: 700 }}>•</span><span style={{ fontSize: 14, lineHeight: 1.7 }}>{point}</span></div>)}
                {(summary.keyTerms || []).length > 0 && (
                  <>
                    <div style={{ ...s.cardTitle, marginTop: 20, marginBottom: 12 }}>🔑 Key Terms</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {summary.keyTerms.map((term, i) => <div key={i} style={{ padding: 12, background: "rgba(255,255,255,0.04)", borderRadius: 12 }}><div style={{ fontWeight: 700, marginBottom: 4, color: "#4ECDC4", fontSize: 13 }}>{term.term}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{term.def}</div></div>)}
                    </div>
                  </>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── COLLEGE TAB ─────────────────────────────────────────────────────────────

function CollegeTab({ colleges, setColleges, userId }: { colleges: CollegeEntry[]; setColleges: React.Dispatch<React.SetStateAction<CollegeEntry[]>>; userId: string }) {
  const [newCollege, setNewCollege] = useState("");
  const STATUS_CONFIG = { tracking: { color: "#4ECDC4", label: "Tracking" }, applied: { color: "#FFEAA7", label: "Applied" }, accepted: { color: "#96CEB4", label: "Accepted ✓" } };

  async function addCollege(e: React.FormEvent) {
    e.preventDefault();
    if (!newCollege.trim()) return;
    const { data } = await supabase.from("user_colleges").insert({ user_id: userId, college_name: newCollege.trim(), status: "tracking", chance: 0 }).select().single();
    if (data) setColleges(prev => [...prev, data]);
    setNewCollege("");
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("user_colleges").update({ status }).eq("id", id);
    setColleges(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  async function removeCollege(id: string) {
    await supabase.from("user_colleges").delete().eq("id", id);
    setColleges(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
        {[{ label: "Tracking", val: colleges.filter(c => c.status === "tracking").length, icon: "👁", color: "#4ECDC4" }, { label: "Applied", val: colleges.filter(c => c.status === "applied").length, icon: "📬", color: "#FFEAA7" }, { label: "Accepted", val: colleges.filter(c => c.status === "accepted").length, icon: "🎉", color: "#96CEB4" }, { label: "Chanced", val: colleges.filter(c => c.chance > 0).length, icon: "📊", color: "#FF6B6B" }].map(stat => (
          <Card key={stat.label} style={{ textAlign: "center", padding: "20px 16px" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: stat.color }}>{stat.val}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={s.cardTitle}>Add a School</div>
        <form onSubmit={addCollege} style={{ display: "flex", gap: 8 }}>
          <input value={newCollege} onChange={e => setNewCollege(e.target.value)} placeholder="e.g. MIT, Stanford, UCLA..." style={{ ...s.taskInput, flex: 1, fontSize: 15 }} />
          <motion.button whileHover={{ scale: 1.03 }} type="submit" style={{ padding: "10px 22px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Add</motion.button>
        </form>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Visit the Chancer tab to calculate your real admission odds.</div>
      </Card>
      <Card>
        <div style={s.cardTitle}>My College List ({colleges.length})</div>
        {colleges.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 14 }}>No colleges yet. Add some above!</div> : (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {colleges.map((col, i) => {
              const sc = STATUS_CONFIG[col.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.tracking;
              return (
                <motion.div key={col.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, marginBottom: col.chance > 0 ? 6 : 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.college_name}</div>
                    {col.chance > 0 && <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}><motion.div animate={{ width: `${col.chance}%` }} transition={{ duration: 0.8 }} style={{ height: "100%", borderRadius: 100, background: "linear-gradient(135deg,#FF6B6B,#4ECDC4)" }} /></div>}
                  </div>
                  {col.chance > 0 && <div style={{ fontWeight: 800, fontSize: 18, color: "#FF6B6B", minWidth: 44, textAlign: "right" as const }}>{Math.round(col.chance)}%</div>}
                  <select value={col.status} onChange={e => updateStatus(col.id, e.target.value)} style={{ padding: "5px 10px", borderRadius: 100, border: `1px solid ${sc.color}44`, background: `${sc.color}18`, color: sc.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", appearance: "none" as const }}>
                    <option value="tracking">Tracking</option>
                    <option value="applied">Applied</option>
                    <option value="accepted">Accepted</option>
                  </select>
                  <button onClick={() => removeCollege(col.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 18 }}>×</button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── SCHOLARSHIPS TAB ────────────────────────────────────────────────────────

function ScholarshipsTab() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = SCHOLARSHIP_DATA.filter(sc => (filter === "All" || sc.tags.includes(filter)) && (sc.name.toLowerCase().includes(search.toLowerCase()) || sc.desc.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12, marginBottom: 14 }}>
          <div style={s.cardTitle}>🎓 Scholarships</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>{["All", "Need-Based", "STEM", "Arts", "Leadership"].map(t => <motion.button key={t} whileHover={{ scale: 1.05 }} onClick={() => setFilter(t)} style={{ padding: "6px 14px", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: filter === t ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)", color: filter === t ? "#fff" : "rgba(255,255,255,0.45)" }}>{t}</motion.button>)}</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search scholarships..." style={{ ...s.taskInput, width: "100%", boxSizing: "border-box" as const }} />
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {filtered.map((sc, i) => (
          <motion.div key={sc.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -5 }} style={{ padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>{sc.tags.map(tag => <span key={tag} style={{ padding: "2px 9px", background: "rgba(150,206,180,0.12)", borderRadius: 100, fontSize: 10, fontWeight: 700, color: "#96CEB4" }}>{tag}</span>)}</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>{sc.name}</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10, flex: 1, lineHeight: 1.6 }}>{sc.desc}</p>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#96CEB4", marginBottom: 4 }}>{sc.amount}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>📅 {sc.deadline}</div>
            <motion.a href={sc.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} style={{ ...s.applyBtn, textDecoration: "none", textAlign: "center" as const, display: "block" }}>Apply Now →</motion.a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── INTERNSHIPS TAB ─────────────────────────────────────────────────────────

function InternshipsTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const filtered = INTERNSHIP_DATA.filter(item => (filter === "All" || item.tag === filter) && (item.co.toLowerCase().includes(search.toLowerCase()) || item.role.toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12, marginBottom: 14 }}>
          <div style={s.cardTitle}>💼 Internships</div>
          <div style={{ display: "flex", gap: 6 }}>{["All", "CS", "Research", "STEM", "Finance"].map(t => <motion.button key={t} whileHover={{ scale: 1.05 }} onClick={() => setFilter(t)} style={{ padding: "6px 14px", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: filter === t ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)", color: filter === t ? "#fff" : "rgba(255,255,255,0.45)" }}>{t}</motion.button>)}</div>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search opportunities..." style={{ ...s.taskInput, width: "100%", boxSizing: "border-box" as const }} />
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
        {filtered.map((item, i) => (
          <motion.div key={item.co + item.role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -5 }} style={{ padding: 24, background: "rgba(255,255,255,0.03)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", borderTop: `3px solid ${item.color}`, display: "flex", flexDirection: "column" as const }}>
            <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, marginBottom: 12, background: item.color + "22", color: item.color, alignSelf: "flex-start" }}>{item.tag}</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{item.co}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10, flex: 1 }}>{item.role}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>📅 {item.deadline}</div>
            <motion.a href={item.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} style={{ ...s.applyBtn, textDecoration: "none", textAlign: "center" as const, display: "block" }}>Learn More →</motion.a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── CHANCER TAB ─────────────────────────────────────────────────────────────

const GPA_SCALES = [
  { label: "4.0 (US Standard)", value: "4.0" },
  { label: "5.0 (Weighted)", value: "5.0" },
  { label: "6.0 (Some US schools)", value: "6.0" },
  { label: "7.0 (Australian/NZ)", value: "7.0" },
  { label: "9.0 (Indian CGPA)", value: "9.0" },
  { label: "10.0 (Indian/European)", value: "10.0" },
  { label: "100 (Percentage)", value: "100" },
  { label: "12.0 (Some systems)", value: "12.0" },
];

function ChancerTab({ initialGpa, initialSat, userId, dreamSchools, colleges, setColleges, fullProfile }: {
  initialGpa: string; initialSat: string; userId: string; dreamSchools: string[]; colleges: CollegeEntry[]; setColleges: React.Dispatch<React.SetStateAction<CollegeEntry[]>>; fullProfile: Profile | null;
}) {
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    gpa: initialGpa === "—" ? "" : initialGpa,
    gpaScale: fullProfile?.gpa_scale || "4.0",
    gpaType: fullProfile?.gpa_type || "weighted",
    sat: initialSat === "—" ? "" : initialSat,
    act: "",
    apCourses: "",
    classRank: "",
    extracurriculars: fullProfile?.extracurriculars || "",
    leadershipRoles: "",
    awards: fullProfile?.awards || "",
    sportsLevel: "None",
    recLetterStrength: fullProfile?.rec_letter_strength || "Unknown",
    firstGen: false,
    legacy: false,
    state: "",
    major: "",
    essayStrength: "Average",
  });
  const [schoolInput, setSchoolInput] = useState(dreamSchools.join(", "));
  const [results, setResults] = useState<Record<string, ChanceResult>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [checkedSchools, setCheckedSchools] = useState<string[]>([]);
  const [profileStep, setProfileStep] = useState<"academics" | "profile" | "context">("academics");

  function updateProfile(field: keyof StudentProfile, value: string | boolean) {
    setStudentProfile(prev => ({ ...prev, [field]: value }));
  }

  // Compute normalized GPA display
  const scale = parseFloat(studentProfile.gpaScale) || 4.0;
  const rawGpa = parseFloat(studentProfile.gpa) || 0;
  const normalizedGpa = scale !== 4.0 && rawGpa > 0 ? ((rawGpa / scale) * 4.0).toFixed(2) : null;

  // ── Inline field errors for chancer form ──────────────────────────────────
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function isGibberish(raw: string): boolean {
    const s = raw.toLowerCase().trim();
    if (!s || s.length < 2) return false;
    const nonsense = new Set(["idk","idc","idek","idfk","dunno","whatever","hmm","hm","meh","blah","ugh","ok","okay","k","kk","yes","no","nope","nah","na","n/a","none","nothing","lol","lmao","test","hello","hi","hey","stuff","things","random","asdf","qwerty","zxcvb","1234","abcd","aaaa","bbbb","cccc","??","...","---","no idea","not sure","don't know","dont know","i don't know","many","a lot","lots","various","some"]);
    if (nonsense.has(s)) return true;
    if (/^(.){3,}$/.test(s)) return true;
    const runs = ["qwert","werty","asdfg","sdfgh","zxcvb","xcvbn","12345","23456","34567"];
    if (runs.some(r => s.includes(r))) return true;
    const letters = s.replace(/[^a-z]/g, "");
    if (letters.length >= 6 && !/[aeiou]/.test(letters)) return true;
    return false;
  }

  function validateField(field: string, value: string): string | null {
    const v = value.trim();
    switch (field) {
      case "gpa": {
        if (!v) return "GPA is required.";
        const sc = parseFloat(studentProfile.gpaScale) || 4.0;
        const num = parseFloat(v);
        if (isNaN(num) || isGibberish(v)) return "GPA must be a number (e.g. 3.8).";
        if (num <= 0) return "GPA must be greater than 0.";
        if (num > sc) return `${num} exceeds your scale of ${sc}. Check your GPA or change the scale.`;
        if (sc === 4.0 && num > 4.3) return "That's too high for a 4.0 scale. Did you mean a different scale?";
        if (sc === 100 && num > 100) return "Percentage can't exceed 100.";
        if (sc === 100 && num < 10) return "That percentage seems very low. Enter your actual grade (e.g. 87).";
        return null;
      }
      case "sat": {
        if (!v) return null;
        const skip = /not yet|not taken|haven.t|haven't|no|n\/a|na|tbd|planning|will take|none/i;
        if (skip.test(v)) return null;
        const digits = v.replace(/[^0-9]/g, "");
        if (!digits || isGibberish(v)) return "Enter your SAT score (400–1600), or leave blank.";
        const num = parseInt(digits);
        if (num < 400) return "SAT scores start at 400. Leave blank if not taken.";
        if (num > 1600) return "SAT scores max at 1600.";
        return null;
      }
      case "act": {
        if (!v) return null;
        const skip = /not yet|not taken|haven.t|haven't|no|n\/a|na|tbd|planning|will take|none/i;
        if (skip.test(v)) return null;
        const digits = v.replace(/[^0-9]/g, "");
        if (!digits || isGibberish(v)) return "Enter your ACT score (1–36), or leave blank.";
        const num = parseInt(digits);
        if (num < 1 || num > 36) return "ACT scores range from 1–36.";
        return null;
      }
      case "extracurriculars": {
        if (!v) return null;
        const bad = new Set(["idk","idc","none","nothing","no","nope","nah","na","n/a","idk man","no idea","not sure","don't know","dont know","many","a lot","lots","stuff","things","various","clubs","sports","band","volunteer"]);
        if (bad.has(v.toLowerCase())) return 'Too vague — be specific, e.g. "Debate team captain (3 yrs), Math club, 200hrs volunteering".';
        if (isGibberish(v.replace(/\s+/g,""))) return "Please describe your actual activities, not random text.";
        if (v.length < 5) return "Give a bit more detail, or leave blank.";
        const single = /^(sports?|music|art|volunteer|club|band|team|dance|debate|chess|math|science)\.?$/i;
        if (single.test(v)) return `"${v}" is too vague. Try "Debate team captain (3 years)" for accurate chancing.`;
        return null;
      }
      case "awards": {
        if (!v) return null;
        const bad = new Set(["idk","idc","none","nothing","no","nope","nah","na","n/a","no awards","no idea","not sure","don't know","dont know","some","a few","many","lots","various","stuff"]);
        if (bad.has(v.toLowerCase())) return "List specific award names, or leave blank (e.g. 'National Merit Semifinalist').";
        if (isGibberish(v.replace(/\s+/g,""))) return "Please enter real award names, or leave blank.";
        if (v.length < 3) return "Describe at least one award, or leave blank.";
        return null;
      }
      case "apCourses": {
        if (!v) return null;
        if (isGibberish(v.replace(/\s+/g,""))) return "Enter a number or list like '6 AP courses' or 'AP Calc, AP Bio'.";
        const num = parseInt(v.replace(/[^0-9]/g,""));
        if (!isNaN(num) && num > 35) return "That's an unusually high number. Double-check.";
        return null;
      }
      case "major": {
        if (!v) return null;
        if (/^\d+$/.test(v)) return "Enter a major name (e.g. 'Computer Science').";
        if (isGibberish(v.replace(/\s+/g,""))) return "Enter a real major (e.g. 'Computer Science', 'Pre-med').";
        return null;
      }
      case "state": {
        if (!v) return null;
        if (/^\d+$/.test(v)) return "Enter your state name, not a number.";
        if (isGibberish(v)) return "Enter a valid state or country (e.g. 'California').";
        return null;
      }
      default: return null;
    }
  }

  function handleProfileChange(field: keyof StudentProfile, value: string | boolean) {
    updateProfile(field, value);
    if (typeof value === "string") {
      const err = validateField(field, value);
      setFormErrors(prev => ({ ...prev, [field]: err || "" }));
    }
  }

  async function chanceSchool(school: string) {
    if (!school.trim() || loading) return;

    // Validate school name
    if (isGibberish(school.replace(/\s+/g,""))) {
      setFormErrors(prev => ({ ...prev, school: `"${school}" doesn't look like a real college. Try "MIT" or "UCLA".` }));
      return;
    }
    const notColleges = ["google","apple","amazon","netflix","facebook","meta","tesla","nasa","spacex"];
    if (notColleges.includes(school.toLowerCase())) {
      setFormErrors(prev => ({ ...prev, school: `"${school}" is a company, not a college.` }));
      return;
    }
    setFormErrors(prev => ({ ...prev, school: "" }));

    // Validate required fields before calling API
    const gpaErr = validateField("gpa", studentProfile.gpa);
    if (gpaErr) {
      setFormErrors(prev => ({ ...prev, gpa: gpaErr }));
      setProfileStep("academics");
      return;
    }

    // Validate optional fields that have values
    const fieldsToCheck: (keyof typeof studentProfile)[] = ["sat","act","apCourses","extracurriculars","awards","major","state"];
    const newErrors: Record<string, string> = {};
    let hasError = false;
    for (const field of fieldsToCheck) {
      const v = studentProfile[field];
      if (typeof v === "string" && v.trim()) {
        const err = validateField(field, v);
        if (err) { newErrors[field] = err; hasError = true; }
      }
    }
    if (hasError) {
      setFormErrors(prev => ({ ...prev, ...newErrors }));
      // Switch to the tab containing the first error
      if (newErrors.sat || newErrors.act || newErrors.apCourses) setProfileStep("academics");
      else if (newErrors.extracurriculars || newErrors.awards) setProfileStep("profile");
      else if (newErrors.major || newErrors.state) setProfileStep("context");
      return;
    }

    setLoading(school);
    try {
      const res = await fetch("/api/chancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, ...studentProfile }),
      });
      const data: ChanceResult & { error?: string; validationErrors?: string[] } = await res.json();

      if (data.error) {
        setResults(prev => ({ ...prev, [school]: { ...data, _error: data.error } as ChanceResult }));
        if (!checkedSchools.includes(school)) setCheckedSchools(prev => [...prev, school]);
        setLoading(null);
        return;
      }

      setResults(prev => ({ ...prev, [school]: data }));
      if (!checkedSchools.includes(school)) setCheckedSchools(prev => [...prev, school]);

      // Update college list
      const { data: existing } = await supabase.from("user_colleges").select("id").eq("user_id", userId).eq("college_name", school).single();
      if (existing) {
        await supabase.from("user_colleges").update({ chance: data.chance }).eq("id", existing.id);
        setColleges(prev => prev.map(c => c.college_name === school ? { ...c, chance: data.chance } : c));
      } else {
        const { data: newEntry } = await supabase.from("user_colleges").insert({ user_id: userId, college_name: school, status: "tracking", chance: data.chance }).select().single();
        if (newEntry) setColleges(prev => [...prev, newEntry]);
      }
    } catch (e) {
      console.error(e);
      setResults(prev => ({ ...prev, [school]: { _error: "Network error. Please try again." } as unknown as ChanceResult }));
      if (!checkedSchools.includes(school)) setCheckedSchools(prev => [...prev, school]);
    }
    setLoading(null);
  }

  const schools = schoolInput.split(",").map(s => s.trim()).filter(Boolean);

  const tabStyle = (active: boolean) => ({
    padding: "8px 18px", border: "none", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer" as const, fontFamily: "inherit",
    background: active ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)",
    color: active ? "#fff" : "rgba(255,255,255,0.45)",
  });

  const fieldStyle = (field: string) => ({
    width: "100%", padding: "10px 14px", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const,
    background: formErrors[field] ? "rgba(255,107,107,0.06)" : "rgba(255,255,255,0.06)",
    border: `1px solid ${formErrors[field] ? "rgba(255,107,107,0.5)" : "rgba(255,255,255,0.1)"}`,
    transition: "border-color 0.2s",
  });

  const inputStyle = { width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const };

  const FieldErr = ({ field }: { field: string }) => formErrors[field] ? (
    <div style={{ marginTop: 5, fontSize: 12, color: "#FF9090", display: "flex", alignItems: "flex-start", gap: 5 }}>
      <span>⚠️</span> {formErrors[field]}
    </div>
  ) : null;

  const fieldLabel = (text: string) => <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{text}</label>;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Profile panel */}
      <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column" as const, gap: 16 }}>
        <Card>
          <div style={s.cardTitle}>🎯 Your Profile</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {(["academics", "profile", "context"] as const).map(step => (
              <motion.button key={step} whileHover={{ scale: 1.04 }} onClick={() => setProfileStep(step)} style={tabStyle(profileStep === step)}>
                {step === "academics" ? "📚 Academics" : step === "profile" ? "🏆 Activities" : "💡 Context"}
              </motion.button>
            ))}
          </div>

          {profileStep === "academics" && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              <div>
                {fieldLabel("GPA")}
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={studentProfile.gpa} onChange={e => handleProfileChange("gpa", e.target.value)} placeholder="e.g. 3.9" style={{ ...fieldStyle("gpa"), flex: 1 }} />
                  <select value={studentProfile.gpaType} onChange={e => updateProfile("gpaType", e.target.value)} style={{ ...inputStyle, width: "auto", appearance: "none" as const }}>
                    <option value="weighted">W</option>
                    <option value="unweighted">UW</option>
                  </select>
                </div>
                <FieldErr field="gpa" />
              </div>
              <div>
                {fieldLabel("GPA Scale")}
                <select value={studentProfile.gpaScale} onChange={e => updateProfile("gpaScale", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  {GPA_SCALES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {normalizedGpa && (
                  <div style={{ marginTop: 6, padding: "6px 12px", background: "rgba(78,205,196,0.1)", borderRadius: 8, fontSize: 12, color: "#4ECDC4" }}>
                    ✓ Normalized to 4.0 scale: <strong>{normalizedGpa}</strong>
                  </div>
                )}
              </div>
              <div>
                {fieldLabel("SAT Score")}
                <input value={studentProfile.sat} onChange={e => handleProfileChange("sat", e.target.value)} placeholder="e.g. 1480 (leave blank if not taken)" style={fieldStyle("sat")} />
                <FieldErr field="sat" />
              </div>
              <div>
                {fieldLabel("ACT Score")}
                <input value={studentProfile.act} onChange={e => handleProfileChange("act", e.target.value)} placeholder="e.g. 33 (leave blank if not taken)" style={fieldStyle("act")} />
                <FieldErr field="act" />
              </div>
              <div>
                {fieldLabel("AP/IB Courses Taken")}
                <input value={studentProfile.apCourses} onChange={e => handleProfileChange("apCourses", e.target.value)} placeholder="e.g. 6 AP courses" style={fieldStyle("apCourses")} />
                <FieldErr field="apCourses" />
              </div>
              <div>
                {fieldLabel("Class Rank")}
                <select value={studentProfile.classRank} onChange={e => updateProfile("classRank", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="">Unknown / Not ranked</option>
                  <option value="Top 1%">Top 1%</option>
                  <option value="Top 5%">Top 5%</option>
                  <option value="Top 10%">Top 10%</option>
                  <option value="Top 25%">Top 25%</option>
                  <option value="Top 50%">Top 50%</option>
                </select>
              </div>
            </div>
          )}

          {profileStep === "profile" && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              <div>
                {fieldLabel("Extracurricular Activities")}
                <textarea value={studentProfile.extracurriculars} onChange={e => handleProfileChange("extracurriculars", e.target.value)} placeholder="e.g. Debate team (4 years), Math club founder, Hospital volunteer (200+ hours)..." style={{ ...fieldStyle("extracurriculars"), height: 90, resize: "vertical" as const }} />
                <FieldErr field="extracurriculars" />
              </div>
              <div>
                {fieldLabel("Leadership Roles")}
                <textarea value={studentProfile.leadershipRoles} onChange={e => updateProfile("leadershipRoles", e.target.value)} placeholder="e.g. Student council president, Debate team captain..." style={{ ...inputStyle, height: 70, resize: "vertical" as const }} />
              </div>
              <div>
                {fieldLabel("Awards & Honors")}
                <textarea value={studentProfile.awards} onChange={e => handleProfileChange("awards", e.target.value)} placeholder="e.g. National Merit Semifinalist, Regional Science Fair 1st, USAMO qualifier..." style={{ ...fieldStyle("awards"), height: 70, resize: "vertical" as const }} />
                <FieldErr field="awards" />
              </div>
              <div>
                {fieldLabel("Athletics Level")}
                <select value={studentProfile.sportsLevel} onChange={e => updateProfile("sportsLevel", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="None">None</option>
                  <option value="JV/Club">JV or Club</option>
                  <option value="Varsity">Varsity</option>
                  <option value="State level">State Level</option>
                  <option value="National/Olympic">National / Olympic</option>
                </select>
              </div>
              <div>
                {fieldLabel("Letters of Recommendation")}
                <select value={studentProfile.recLetterStrength} onChange={e => updateProfile("recLetterStrength", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="Strong">📬 Strong — recommender knows me very well</option>
                  <option value="Good">✉️ Good — solid, positive letters expected</option>
                  <option value="Average">📄 Average — standard letters</option>
                  <option value="Unknown">❓ Not sure / Haven&apos;t asked yet</option>
                </select>
              </div>
              <div>
                {fieldLabel("Essay Strength (self-assess)")}
                <select value={studentProfile.essayStrength} onChange={e => updateProfile("essayStrength", e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                  <option value="Strong">Strong — compelling, unique story</option>
                  <option value="Average">Average — solid but not standout</option>
                  <option value="Weak">Weak — needs improvement</option>
                  <option value="Unknown">Unknown / Not written yet</option>
                </select>
              </div>
            </div>
          )}

          {profileStep === "context" && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
              <div>
                {fieldLabel("Intended Major")}
                <input value={studentProfile.major} onChange={e => handleProfileChange("major", e.target.value)} placeholder="e.g. Computer Science, Pre-med, Undecided" style={fieldStyle("major")} />
                <FieldErr field="major" />
              </div>
              <div>
                {fieldLabel("State of Residence")}
                <input value={studentProfile.state} onChange={e => handleProfileChange("state", e.target.value)} placeholder="e.g. California (matters for state schools)" style={fieldStyle("state")} />
                <FieldErr field="state" />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  <div onClick={() => updateProfile("firstGen", !studentProfile.firstGen)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${studentProfile.firstGen ? "#4ECDC4" : "rgba(255,255,255,0.2)"}`, background: studentProfile.firstGen ? "#4ECDC4" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {studentProfile.firstGen && <span style={{ fontSize: 11, color: "#000" }}>✓</span>}
                  </div>
                  First-gen college student
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                  <div onClick={() => updateProfile("legacy", !studentProfile.legacy)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${studentProfile.legacy ? "#FFEAA7" : "rgba(255,255,255,0.2)"}`, background: studentProfile.legacy ? "#FFEAA7" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {studentProfile.legacy && <span style={{ fontSize: 11, color: "#000" }}>✓</span>}
                  </div>
                  Legacy applicant
                </label>
              </div>
              <div style={{ padding: 14, background: "rgba(255,107,107,0.06)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                💡 <strong style={{ color: "#FF6B6B" }}>GPA Note:</strong> Your GPA will be automatically normalized to the 4.0 scale used by US colleges for fair comparison, regardless of your school&apos;s grading system.
              </div>
            </div>
          )}
        </Card>

        {/* Schools input */}
        <Card>
          <div style={s.cardTitle}>Schools to Check</div>
          <textarea value={schoolInput} onChange={e => { setSchoolInput(e.target.value); setFormErrors(prev => ({ ...prev, school: "" })); }} placeholder="MIT, Stanford, UCLA, UMich..." style={{ ...inputStyle, height: 80, resize: "vertical" as const, marginBottom: formErrors.school ? 6 : 12 }} />
          {formErrors.school && (
            <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 10, fontSize: 12, color: "#FF9090", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span>⚠️</span>{formErrors.school}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
            {schools.map(school => (
              <motion.button key={school} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => chanceSchool(school)} disabled={!!loading}
                style={{ width: "100%", padding: "11px", background: loading === school ? "rgba(255,255,255,0.07)" : "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading === school ? `🔍 Researching ${school}...` : `📊 Chance Me — ${school}`}
              </motion.button>
            ))}
          </div>
        </Card>
      </div>

      {/* Results */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 16 }}>
        {checkedSchools.length === 0 ? (
          <Card style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎯</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Real-Time Admission Chances</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", maxWidth: 400, margin: "0 auto", lineHeight: 1.8 }}>
              Fill in your full profile on the left — academics, activities, and context. The more you share, the more accurate your chances will be.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 32 }}>
              {["📚 Academics", "🏆 Activities", "💡 Context"].map((item, i) => (
                <div key={i} style={{ textAlign: "center", padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{item.split(" ")[0]}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.split(" ")[1]}</div>
                </div>
              ))}
            </div>
          </Card>
        ) : checkedSchools.map(school => {
          const r = results[school];
          if (!r) return null;
          const rAny = r as unknown as { _error?: string };
          if (rAny._error) {
            return (
              <motion.div key={school} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 24, background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{school}</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, lineHeight: 1.6 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#FF9090", marginBottom: 4 }}>Couldn’t calculate chances</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{rAny._error}</div>
                    <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Fix the issue in your profile and try again.</div>
                  </div>
                </div>
              </motion.div>
            );
          }
          const lbl = r.chance < 15 ? { text: "Reach", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" }
            : r.chance < 35 ? { text: "Hard Target", color: "#FF8E53", bg: "rgba(255,142,83,0.12)" }
            : r.chance < 60 ? { text: "Target", color: "#FFEAA7", bg: "rgba(255,234,167,0.12)" }
            : { text: "Safety", color: "#96CEB4", bg: "rgba(150,206,180,0.12)" };

          return (
            <motion.div key={school} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 22, borderTop: `3px solid ${lbl.color}` }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>{school}</h3>
                  <span style={{ padding: "5px 14px", borderRadius: 100, fontSize: 13, fontWeight: 700, background: lbl.bg, color: lbl.color }}>{lbl.text}</span>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: 60, fontWeight: 900, color: lbl.color, lineHeight: 1 }}>{Math.round(r.chance)}%</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>admission chance</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden", marginBottom: 24 }}>
                <motion.div animate={{ width: `${Math.round(r.chance)}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: "100%", borderRadius: 100, background: `linear-gradient(135deg, ${lbl.color}, #4ECDC4)` }} />
              </div>

              {/* School stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                {[{ label: "Acceptance Rate", val: r.acceptanceRate || "—" }, { label: "Avg GPA", val: r.avgGPA || "—" }, { label: "Avg SAT", val: r.avgSAT || "—" }, { label: "Avg ACT", val: r.avgACT || "—" }].map(stat => (
                  <div key={stat.label} style={{ padding: "12px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 12, textAlign: "center" as const }}>
                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{stat.val}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Rating bars */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[{ label: "Academic Rating", val: r.academicRating, color: "#4ECDC4" }, { label: "EC Rating", val: r.ecRating, color: "#FFEAA7" }, { label: "Overall Rating", val: r.overallRating, color: "#FF6B6B" }].map(rating => (
                  <div key={rating.label} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 14 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{rating.label}</div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 100, marginBottom: 6, overflow: "hidden" }}>
                      <motion.div animate={{ width: `${(rating.val / 10) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} style={{ height: "100%", background: rating.color, borderRadius: 100 }} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: rating.color }}>{rating.val}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/10</span></div>
                  </div>
                ))}
              </div>

              {/* Strengths & weaknesses */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: r.tip ? 16 : 0 }}>
                {r.strengths?.length > 0 && (
                  <div style={{ padding: "14px 16px", background: "rgba(150,206,180,0.07)", borderRadius: 14, border: "1px solid rgba(150,206,180,0.15)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#96CEB4", marginBottom: 10 }}>✅ STRENGTHS</div>
                    {r.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4, lineHeight: 1.5 }}>• {s}</div>)}
                  </div>
                )}
                {r.weaknesses?.length > 0 && (
                  <div style={{ padding: "14px 16px", background: "rgba(255,107,107,0.06)", borderRadius: 14, border: "1px solid rgba(255,107,107,0.15)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B", marginBottom: 10 }}>⚠️ AREAS TO IMPROVE</div>
                    {r.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4, lineHeight: 1.5 }}>• {w}</div>)}
                  </div>
                )}
              </div>

              {r.tip && <div style={{ padding: "14px 16px", background: "rgba(78,205,196,0.07)", borderRadius: 14, border: "1px solid rgba(78,205,196,0.15)", fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>💡 <strong style={{ color: "#4ECDC4" }}>Counselor Tip:</strong> {r.tip}</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SHARED ───────────────────────────────────────────────────────────────────

function Card({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ ...s.card, ...style }}>{children}</motion.div>;
}

function StatPill({ label, val, color }: { label: string; val: string; color: string }) {
  return <div style={{ textAlign: "center", padding: "10px 18px", background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)" }}><div style={{ fontSize: 20, fontWeight: 900, color }}>{val}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div></div>;
}

const s: StyleMap = {
  root: { display: "flex", minHeight: "100vh", background: "#0A0A0F", color: "#fff", fontFamily: "'Syne', system-ui, sans-serif" },
  sidebar: { width: 210, background: "rgba(255,255,255,0.015)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  sidebarLogoText: { fontSize: 18, fontWeight: 900, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sidebarBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s" },
  sidebarProfile: { display: "flex", alignItems: "center", gap: 10, padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  main: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 50 },
  streakBadge: { padding: "7px 14px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#FF6B6B" },
  avatarSm: { width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  homeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 },
  card: { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 22 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 16, letterSpacing: "0.03em" },
  taskInput: { flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" },
  addBtn: { padding: "10px 16px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 20, fontWeight: 700, cursor: "pointer", flexShrink: 0 },
  applyBtn: { padding: "11px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
