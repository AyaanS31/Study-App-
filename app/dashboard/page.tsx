"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  text: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  due: string;
}

interface StyleMap {
  [key: string]: React.CSSProperties;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { id: "home", icon: "⌂", label: "Home" },
  { id: "planner", icon: "📅", label: "Planner" },
  { id: "notes", icon: "📝", label: "AI Notes" },
  { id: "college", icon: "🎓", label: "College" },
  { id: "scholarships", icon: "💰", label: "Scholarships" },
  { id: "internships", icon: "💼", label: "Internships" },
  { id: "chancer", icon: "📊", label: "Chancer" },
];

const INITIAL_TASKS: Task[] = [
  { id: 1, text: "Submit AP Chemistry lab report", done: false, priority: "high", due: "Today" },
  { id: 2, text: "Practice SAT Math section 4", done: false, priority: "high", due: "Today" },
  { id: 3, text: "Request rec letter from Mr. Davis", done: true, priority: "medium", due: "Done" },
  { id: 4, text: "Draft Common App essay intro", done: false, priority: "medium", due: "Tomorrow" },
  { id: 5, text: "Research MIT financial aid portal", done: false, priority: "low", due: "This week" },
];

const INTERNSHIPS = [
  { co: "Google", role: "CSSI Program", deadline: "Feb 28", tag: "CS", color: "#4285F4" },
  { co: "MIT", role: "Research Intern", deadline: "Mar 5", tag: "Research", color: "#A31F34" },
  { co: "Goldman Sachs", role: "Summer Analyst", deadline: "Mar 15", tag: "Finance", color: "#0066CC" },
  { co: "NASA", role: "High School Apprentice", deadline: "Mar 20", tag: "STEM", color: "#FC3D21" },
];

const SCHOLARSHIPS = [
  { name: "Gates Millennium", amount: "$10,000+", match: 94, deadline: "Jan 15" },
  { name: "Coca-Cola Scholars", amount: "$20,000", match: 87, deadline: "Oct 31" },
  { name: "Jack Kent Cooke", amount: "$40,000", match: 82, deadline: "Sep 30" },
  { name: "Questbridge", amount: "Full Ride", match: 91, deadline: "Sep 27" },
];

const COLLEGES = [
  { name: "MIT", chance: 12, trend: "+2", color: "#A31F34", emoji: "🏛" },
  { name: "Stanford", chance: 9, trend: "+1", color: "#8C1515", emoji: "🌲" },
  { name: "Harvard", chance: 11, trend: "0", color: "#A51C30", emoji: "📚" },
  { name: "UCLA", chance: 67, trend: "+8", color: "#2774AE", emoji: "🌊" },
  { name: "UMich", chance: 81, trend: "+5", color: "#00274C", emoji: "🏆" },
  { name: "Purdue", chance: 94, trend: "+2", color: "#CEB888", emoji: "🚀" },
];

const NOTES = [
  { title: "AP Chem – Electron Config", subject: "Chemistry", updated: "2h ago", cards: 24 },
  { title: "US History – Civil War Era", subject: "History", updated: "Yesterday", cards: 41 },
  { title: "Calc BC – Integration", subject: "Math", updated: "3d ago", cards: 18 },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [pomodoroMin, setPomodoroMin] = useState(25);
  const [pomodoroSec, setPomodoroSec] = useState(0);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus");
  const [newTask, setNewTask] = useState("");
  const [gpa, setGpa] = useState("3.92");
  const [sat, setSat] = useState("1490");

  useEffect(() => {
    if (!pomodoroRunning) return;
    const interval = setInterval(() => {
      if (pomodoroSec > 0) {
        setPomodoroSec((s) => s - 1);
      } else if (pomodoroMin > 0) {
        setPomodoroMin((m) => m - 1);
        setPomodoroSec(59);
      } else {
        setPomodoroRunning(false);
        if (pomodoroMode === "focus") {
          setPomodoroMode("break");
          setPomodoroMin(5);
        } else {
          setPomodoroMode("focus");
          setPomodoroMin(25);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroMin, pomodoroSec, pomodoroMode]);

  function toggleTask(id: number) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now(), text: newTask, done: false, priority: "medium", due: "This week" }]);
    setNewTask("");
  }

  const completedTasks = tasks.filter((t) => t.done).length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <motion.aside initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <span style={{ fontSize: 22, color: "#FF6B6B" }}>◈</span>
          <span style={s.sidebarLogoText}>Apex</span>
        </div>

        <nav style={{ flex: 1, padding: "16px 0" }}>
          {SIDEBAR_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              style={{
                ...s.sidebarBtn,
                background: activeTab === item.id ? "rgba(255,107,107,0.15)" : "transparent",
                borderLeft: activeTab === item.id ? "3px solid #FF6B6B" : "3px solid transparent",
                color: activeTab === item.id ? "#FF6B6B" : "rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div style={s.sidebarProfile}>
          <div style={s.avatar}>J</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Jordan Lee</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Class of 2026</div>
          </div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <main style={s.main}>
        <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={s.topbar}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
              {SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={s.streakBadge}>🔥 7 day streak</div>
            <div style={s.avatarSm}>J</div>
          </div>
        </motion.div>

        <div style={{ padding: "32px", flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {activeTab === "home" && <HomeTab tasks={tasks} toggleTask={toggleTask} progress={progress} completedTasks={completedTasks} pomodoroMin={pomodoroMin} pomodoroSec={pomodoroSec} pomodoroRunning={pomodoroRunning} pomodoroMode={pomodoroMode} setPomodoroRunning={setPomodoroRunning} setPomodoroMin={setPomodoroMin} setPomodoroSec={setPomodoroSec} setPomodoroMode={setPomodoroMode} newTask={newTask} setNewTask={setNewTask} addTask={addTask} gpa={gpa} sat={sat} />}
              {activeTab === "planner" && <PlannerTab tasks={tasks} toggleTask={toggleTask} newTask={newTask} setNewTask={setNewTask} addTask={addTask} />}
              {activeTab === "notes" && <NotesTab />}
              {activeTab === "college" && <CollegeTab />}
              {activeTab === "scholarships" && <ScholarshipsTab />}
              {activeTab === "internships" && <InternshipsTab />}
              {activeTab === "chancer" && <ChancerTab gpa={gpa} sat={sat} setGpa={setGpa} setSat={setSat} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────

function HomeTab({ tasks, toggleTask, progress, completedTasks, pomodoroMin, pomodoroSec, pomodoroRunning, pomodoroMode, setPomodoroRunning, setPomodoroMin, setPomodoroSec, setPomodoroMode, newTask, setNewTask, addTask, gpa, sat }: {
  tasks: Task[]; toggleTask: (id: number) => void; progress: number; completedTasks: number;
  pomodoroMin: number; pomodoroSec: number; pomodoroRunning: boolean; pomodoroMode: string;
  setPomodoroRunning: (v: boolean) => void; setPomodoroMin: (v: number) => void;
  setPomodoroSec: (v: number) => void; setPomodoroMode: (v: "focus" | "break") => void;
  newTask: string; setNewTask: (v: string) => void; addTask: (e: React.FormEvent) => void;
  gpa: string; sat: string;
}) {
  return (
    <div style={s.homeGrid}>
      {/* Welcome */}
      <Card style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(255,107,107,0.12), rgba(78,205,196,0.08))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px", marginBottom: 8 }}>Good morning, Jordan 👋</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
              You have {tasks.filter((t) => !t.done && t.due === "Today").length} tasks due today.
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <StatPill label="GPA" val={gpa} color="#FF6B6B" />
            <StatPill label="SAT" val={sat} color="#4ECDC4" />
            <StatPill label="Done" val={`${completedTasks}/${tasks.length}`} color="#96CEB4" />
          </div>
        </div>
      </Card>

      {/* Progress */}
      <Card>
        <div style={s.cardTitle}>Today&apos;s Progress</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", margin: "8px auto", width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r="50" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={314}
              initial={{ strokeDashoffset: 314 }}
              animate={{ strokeDashoffset: 314 - (314 * progress) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#4ECDC4" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{progress}%</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Complete</div>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>
          {completedTasks} of {tasks.length} tasks done
        </p>
      </Card>

      {/* Pomodoro */}
      <Card>
        <div style={s.cardTitle}>Focus Timer</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 16 }}>
            <button onClick={() => { setPomodoroMode("focus"); setPomodoroMin(25); setPomodoroSec(0); setPomodoroRunning(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", color: pomodoroMode === "focus" ? "#FF6B6B" : "rgba(255,255,255,0.3)" }}>Focus</button>
            <button onClick={() => { setPomodoroMode("break"); setPomodoroMin(5); setPomodoroSec(0); setPomodoroRunning(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", color: pomodoroMode === "break" ? "#4ECDC4" : "rgba(255,255,255,0.3)" }}>Break</button>
          </div>
          <motion.div
            style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-2px", marginBottom: 20, color: pomodoroMode === "focus" ? "#FF6B6B" : "#4ECDC4" }}
            animate={{ scale: pomodoroRunning ? [1, 1.02, 1] : 1 }}
            transition={{ repeat: pomodoroRunning ? Infinity : 0, duration: 1 }}
          >
            {String(pomodoroMin).padStart(2, "0")}:{String(pomodoroSec).padStart(2, "0")}
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPomodoroRunning(!pomodoroRunning)}
            style={{ padding: "10px 32px", border: "none", borderRadius: 100, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", background: pomodoroRunning ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#FF6B6B,#FF8E53)" }}
          >
            {pomodoroRunning ? "⏸ Pause" : "▶ Start"}
          </motion.button>
        </div>
      </Card>

      {/* Tasks */}
      <Card style={{ gridColumn: "span 2" }}>
        <div style={s.cardTitle}>Today&apos;s Tasks</div>
        <form onSubmit={addTask} style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a task..." style={s.taskInput} />
          <button type="submit" style={s.addBtn}>+</button>
        </form>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.slice(0, 5).map((task) => (
            <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />
          ))}
        </div>
      </Card>

      {/* Deadlines */}
      <Card>
        <div style={s.cardTitle}>Upcoming Deadlines</div>
        {INTERNSHIPS.slice(0, 3).map((item) => (
          <motion.div key={item.co} whileHover={{ x: 4 }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: item.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{item.co}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.role}</div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.deadline}</div>
          </motion.div>
        ))}
      </Card>

      {/* Scholarships */}
      <Card>
        <div style={s.cardTitle}>Top Scholarship Matches</div>
        {SCHOLARSHIPS.slice(0, 3).map((sc) => (
          <div key={sc.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{sc.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sc.amount}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 60, height: 6, borderRadius: 100, background: sc.match > 90 ? "#96CEB4" : "#4ECDC4" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#96CEB4" }}>{sc.match}%</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── PLANNER TAB ─────────────────────────────────────────────────────────────

function PlannerTab({ tasks, toggleTask, newTask, setNewTask, addTask }: {
  tasks: Task[]; toggleTask: (id: number) => void;
  newTask: string; setNewTask: (v: string) => void; addTask: (e: React.FormEvent) => void;
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];
  const events = [
    { day: 0, hour: 0, title: "AP Chem", color: "#FF6B6B" },
    { day: 1, hour: 2, title: "SAT Prep", color: "#4ECDC4" },
    { day: 2, hour: 1, title: "Study Group", color: "#45B7D1" },
    { day: 3, hour: 3, title: "College Essay", color: "#96CEB4" },
    { day: 4, hour: 0, title: "Club Meeting", color: "#FFEAA7" },
  ];

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <Card style={{ flex: 1 }}>
        <div style={s.cardTitle}>Weekly Schedule</div>
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 2, overflowX: "auto" as const }}>
          <div />
          {days.map((d) => (
            <div key={d} style={{ textAlign: "center" as const, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", padding: "8px 0", letterSpacing: "0.05em" }}>{d}</div>
          ))}
          {hours.map((hour, hi) => (
            // Fixed: use array instead of Fragment to avoid key issues
            [
              <div key={`hour-${hi}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", padding: "8px 4px", textAlign: "right" as const }}>{hour}</div>,
              ...days.map((d, di) => {
                const event = events.find((e) => e.day === di && e.hour === hi);
                return (
                  <motion.div
                    key={`${d}-${hour}`}
                    whileHover={{ scale: 1.05 }}
                    style={{ height: 40, borderRadius: 6, position: "relative" as const, cursor: "pointer", background: event ? event.color + "22" : "transparent", border: event ? `1px solid ${event.color}66` : "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {event && <div style={{ fontSize: 10, padding: "4px 6px", fontWeight: 600, overflow: "hidden", color: event.color }}>{event.title}</div>}
                  </motion.div>
                );
              })
            ]
          ))}
        </div>
      </Card>

      <div style={{ width: 320 }}>
        <Card>
          <div style={s.cardTitle}>All Tasks</div>
          <form onSubmit={addTask} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task..." style={s.taskInput} />
            <button type="submit" style={s.addBtn}>+</button>
          </form>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── NOTES TAB ───────────────────────────────────────────────────────────────

function NotesTab() {
  const [selected, setSelected] = useState<typeof NOTES[0] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<{ q: string; a: string }[]>([]);
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const sampleFlashcards = [
    { q: "What is the Aufbau principle?", a: "Electrons fill orbitals from lowest to highest energy." },
    { q: "Define electronegativity", a: "Tendency of an atom to attract electrons in a bond." },
    { q: "What is Hund's rule?", a: "Electrons occupy empty orbitals before pairing up." },
  ];

  function generateCards() {
    if (!noteText.trim()) return;
    setGenerating(true);
    setTimeout(() => { setFlashcards(sampleFlashcards); setGenerating(false); }, 1800);
  }

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" as const, gap: 20 }}>
        <Card>
          <div style={s.cardTitle}>📚 My Note Sets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {NOTES.map((note) => (
              <motion.div key={note.title} whileHover={{ y: -4 }} onClick={() => setSelected(note)}
                style={{ padding: 20, background: "rgba(255,255,255,0.04)", borderRadius: 16, cursor: "pointer", border: selected?.title === note.title ? "1px solid rgba(255,107,107,0.5)" : "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>📄</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{note.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{note.subject}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  <span>🃏 {note.cards} cards</span><span>{note.updated}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={s.cardTitle}>✨ AI Flashcard Generator</div>
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Paste your notes here..." style={{ width: "100%", height: 140, padding: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", fontSize: 14, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, marginBottom: 16 }} />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={generateCards} disabled={generating}
            style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {generating ? "✨ Generating..." : "✨ Generate Flashcards"}
          </motion.button>
        </Card>
      </div>

      <div style={{ width: 340 }}>
        {flashcards.length > 0 ? (
          <Card>
            <div style={s.cardTitle}>Flashcards ({flashcards.length})</div>
            <div style={{ perspective: 1000, marginBottom: 16 }}>
              <motion.div onClick={() => setFlipped((f) => !f)} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.4 }}
                style={{ background: "linear-gradient(135deg,rgba(255,107,107,0.1),rgba(78,205,196,0.1))", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <div style={{ padding: 24, textAlign: "center" as const }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>{flipped ? "ANSWER" : "QUESTION"}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.5 }}>{flipped ? flashcards[activeCard].a : flashcards[activeCard].q}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 20 }}>Tap to flip</div>
                </div>
              </motion.div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 8px" }}>
              <button onClick={() => { setActiveCard((c) => Math.max(0, c - 1)); setFlipped(false); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>←</button>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{activeCard + 1} / {flashcards.length}</span>
              <button onClick={() => { setActiveCard((c) => Math.min(flashcards.length - 1, c + 1)); setFlipped(false); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, color: "#fff", padding: "8px 16px", cursor: "pointer", fontSize: 16, fontFamily: "inherit" }}>→</button>
            </div>
          </Card>
        ) : (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>Generate flashcards from your notes with AI</div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── COLLEGE TAB ─────────────────────────────────────────────────────────────

function CollegeTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        <StatCard label="Schools Tracking" val="12" icon="🏫" color="#FF6B6B" />
        <StatCard label="Applications Done" val="3" icon="✅" color="#4ECDC4" />
        <StatCard label="Essays Drafted" val="7" icon="✏️" color="#96CEB4" />
      </div>
      <Card>
        <div style={s.cardTitle}>My College List</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {COLLEGES.map((col, i) => (
            <motion.div key={col.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ x: 4 }}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14, cursor: "pointer" }}>
              <div style={{ fontSize: 28 }}>{col.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{col.name}</div>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${col.chance}%` }} transition={{ delay: i * 0.05 + 0.3, duration: 0.8 }} style={{ height: "100%", borderRadius: 100, background: col.color }} />
                </div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: col.color }}>{col.chance}%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>chance</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, minWidth: 30, textAlign: "right" as const, color: col.trend.startsWith("+") ? "#96CEB4" : col.trend === "0" ? "rgba(255,255,255,0.4)" : "#FF6B6B" }}>
                {col.trend === "0" ? "—" : col.trend}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── SCHOLARSHIPS TAB ────────────────────────────────────────────────────────

function ScholarshipsTab() {
  const [filter, setFilter] = useState("All");
  const tags = ["All", "STEM", "Arts", "Leadership", "Need-Based"];

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 24 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 16 }}>
          <div style={s.cardTitle}>Scholarship Matches</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {tags.map((t) => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(t)}
                style={{ padding: "8px 16px", border: "none", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: filter === t ? "linear-gradient(135deg,#FF6B6B,#FF8E53)" : "rgba(255,255,255,0.06)", color: filter === t ? "#fff" : "rgba(255,255,255,0.5)" }}>
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {SCHOLARSHIPS.map((sc, i) => (
          <motion.div key={sc.name} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
            style={{ padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, cursor: "pointer" }}>
            <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(150,206,180,0.15)", borderRadius: 100, fontSize: 12, fontWeight: 700, color: "#96CEB4", marginBottom: 16 }}>{sc.match}% match</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{sc.name}</h3>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#96CEB4", marginBottom: 12 }}>{sc.amount}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Deadline: {sc.deadline}</div>
            <motion.button whileHover={{ scale: 1.04 }} style={s.applyBtn}>Apply Now →</motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── INTERNSHIPS TAB ─────────────────────────────────────────────────────────

function InternshipsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
      {INTERNSHIPS.map((item, i) => (
        <motion.div key={item.co} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }}
          style={{ padding: 28, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", borderTop: `3px solid ${item.color}` }}>
          <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700, marginBottom: 16, background: item.color + "22", color: item.color }}>{item.tag}</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{item.co}</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>{item.role}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>📅 Deadline: {item.deadline}</div>
          <motion.button whileHover={{ scale: 1.04 }} style={s.applyBtn}>Learn More →</motion.button>
        </motion.div>
      ))}
    </div>
  );
}

// ─── CHANCER TAB ─────────────────────────────────────────────────────────────

function ChancerTab({ gpa, sat, setGpa, setSat }: { gpa: string; sat: string; setGpa: (v: string) => void; setSat: (v: string) => void }) {
  const [localGpa, setLocalGpa] = useState(gpa);
  const [localSat, setLocalSat] = useState(sat);
  const [updated, setUpdated] = useState(false);

  function handleUpdate() {
    setGpa(localGpa);
    setSat(localSat);
    setUpdated(true);
    setTimeout(() => setUpdated(false), 2000);
  }

  function getLabel(chance: number) {
    if (chance < 15) return { text: "Reach", color: "#FF6B6B" };
    if (chance < 50) return { text: "Hard Target", color: "#FFEAA7" };
    if (chance < 75) return { text: "Target", color: "#4ECDC4" };
    return { text: "Safety", color: "#96CEB4" };
  }

  const chances = COLLEGES.map((c) => ({
    ...c,
    chance: Math.min(98, Math.max(3, c.chance + (parseFloat(localGpa) - 3.5) * 10 + (parseInt(localSat) - 1400) * 0.02)),
  }));

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <Card style={{ width: 320 }}>
        <div style={s.cardTitle}>Your Stats</div>
        {[
          { label: "GPA (Weighted)", val: localGpa, set: setLocalGpa, placeholder: "3.92" },
          { label: "SAT Score", val: localSat, set: setLocalSat, placeholder: "1490" },
          { label: "Class Rank", val: "", set: () => {}, placeholder: "Top 5%" },
          { label: "AP/IB Courses", val: "", set: () => {}, placeholder: "8" },
        ].map((field) => (
          <div key={field.label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{field.label}</label>
            <input value={field.val} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
          </div>
        ))}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={handleUpdate}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 14, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {updated ? "✅ Updated!" : "📊 Update Chances"}
        </motion.button>
      </Card>

      <Card style={{ flex: 1 }}>
        <div style={s.cardTitle}>Admission Chances</div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
          {chances.map((col, i) => {
            const label = getLabel(col.chance);
            return (
              <motion.div key={col.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 14 }}>
                <div style={{ fontSize: 28 }}>{col.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700 }}>{col.name}</span>
                    <span style={{ fontSize: 12, color: label.color }}>{label.text}</span>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" }}>
                    <motion.div animate={{ width: `${Math.round(col.chance)}%` }} transition={{ duration: 0.6 }} style={{ height: "100%", borderRadius: 100, background: col.color }} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: col.color, minWidth: 60, textAlign: "right" as const }}>{Math.round(col.chance)}%</div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function Card({ children, style = {} }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...s.card, ...style }}>
      {children}
    </motion.div>
  );
}

function StatCard({ label, val, icon, color }: { label: string; val: string; icon: string; color: string }) {
  return (
    <Card style={{ textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color, marginBottom: 4 }}>{val}</div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </Card>
  );
}

function StatPill({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{ textAlign: "center", padding: "12px 20px", background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{val}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <motion.div whileHover={{ x: 3 }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", opacity: task.done ? 0.5 : 1 }}>
      <motion.div whileTap={{ scale: 0.8 }} onClick={onToggle}
        style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.done ? "#4ECDC4" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", background: task.done ? "#4ECDC4" : "transparent" }}>
        {task.done && <span style={{ fontSize: 10, color: "#000" }}>✓</span>}
      </motion.div>
      <span style={{ flex: 1, fontSize: 14, textDecoration: task.done ? "line-through" : "none", color: task.done ? "rgba(255,255,255,0.3)" : "#fff" }}>
        {task.text}
      </span>
      <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: task.priority === "high" ? "#FF6B6B" : task.priority === "medium" ? "#FFEAA7" : "#96CEB4" }} />
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{task.due}</span>
    </motion.div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s: StyleMap = {
  root: { display: "flex", minHeight: "100vh", background: "#0A0A0F", color: "#fff", fontFamily: "'Syne', system-ui, sans-serif", overflow: "hidden" },
  sidebar: { width: 220, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: 10, padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  sidebarLogoText: { fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  sidebarBtn: { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "inherit" },
  sidebarProfile: { display: "flex", alignItems: "center", gap: 12, padding: "20px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 },
  main: { flex: 1, overflow: "auto", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 },
  streakBadge: { padding: "8px 16px", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: 100, fontSize: 13, fontWeight: 600, color: "#FF6B6B" },
  avatarSm: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, cursor: "pointer" },
  homeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 20, letterSpacing: "0.02em" },
  taskInput: { flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", fontFamily: "inherit" },
  addBtn: { padding: "10px 16px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 20, fontWeight: 700, cursor: "pointer" },
  applyBtn: { width: "100%", padding: "12px", background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
};
