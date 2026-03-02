// lib/validation.ts
// Shared validation for all Apex input fields

export interface FieldError {
  message: string;
  field: string;
}

// ─── GIBBERISH DETECTOR ───────────────────────────────────────────────────────
// Catches: keyboard mashing, repeated chars, meaningless shortcuts, profanity filler

export function isGibberish(raw: string): boolean {
  const s = raw.toLowerCase().trim();
  if (!s || s.length < 2) return false;

  // Exact-match nonsense words / phrases
  const nonsense = new Set([
    "idk","idc","idek","idfk","idrk","dunno","whatever","hmm","hm","huh","meh",
    "blah","ugh","ok","okay","k","kk","yes","no","yep","nope","nah","na","n/a",
    "none","nothing","nope","lol","lmao","lmfao","wtf","omg","bruh","bro","sis",
    "test","testing","hello","hi","hey","sup","yo","stuff","things","random",
    "asdf","qwerty","zxcvb","1234","abcd","aaaa","bbbb","cccc","dddd","eeee",
    "xyz","abc","aaa","bbb","ccc","???","...","!!!","---","___",
    "no idea","not sure","don't know","dont know","i don't know","idk man",
    "some stuff","lots of things","many things","a lot","lots","various",
  ]);
  if (nonsense.has(s)) return true;

  // Repeated single character (aaaa, 1111)
  if (/^(.)\1{3,}$/.test(s)) return true;

  // Keyboard runs ≥ 5 consecutive chars
  const runs = ["qwert","werty","ertyu","rtyui","tyuio","yuiop",
                "asdfg","sdfgh","dfghj","fghjk","ghjkl",
                "zxcvb","xcvbn","cvbnm","12345","23456","34567","45678","56789"];
  if (runs.some(r => s.includes(r))) return true;

  // Pure consonant string ≥ 6 chars with no vowels (bcdfgh...)
  const letters = s.replace(/[^a-z]/g, "");
  if (letters.length >= 6 && !/[aeiou]/.test(letters)) return true;

  // Alternating repeated pattern (ababab, xyzxyz)
  if (s.length >= 6 && /^(.{1,3})\1{2,}$/.test(s)) return true;

  return false;
}

// ─── NAME ─────────────────────────────────────────────────────────────────────

export function validateName(v: string): string | null {
  const s = v.trim();
  if (!s) return "Please enter your name.";
  if (s.length < 2) return "Name must be at least 2 characters.";
  if (s.length > 60) return "That name looks too long — just use your real name.";
  if (/\d/.test(s)) return "Names don't usually contain numbers.";
  if (!/^[a-zA-Z\s'\-.]+$/.test(s)) return "Please use letters only (no special characters).";
  if (isGibberish(s.replace(/\s+/g, ""))) return "That doesn't look like a real name. Enter your actual name.";
  if (s.replace(/\s+/g, "").length < 2) return "Please enter your full name.";
  return null;
}

// ─── SCHOOL NAME ──────────────────────────────────────────────────────────────

export function validateHighSchool(v: string): string | null {
  const s = v.trim();
  if (!s) return "Please enter your school's name.";
  if (s.length < 3) return "School name is too short.";
  if (s.length > 120) return "That seems too long for a school name.";
  if (/^\d+$/.test(s)) return "Please enter your school's name, not a number.";
  if (isGibberish(s.replace(/\s+/g, ""))) return "That doesn't look like a school name. Try 'Lincoln High School'.";
  return null;
}

// ─── GPA ─────────────────────────────────────────────────────────────────────

export function validateGPA(v: string, scale: string): string | null {
  const s = v.trim();
  if (!s) return "Please enter your GPA.";

  const scaleNum = parseFloat(scale) || 4.0;
  const num = parseFloat(s);

  if (isNaN(num) || s.toLowerCase().includes("e") || isGibberish(s))
    return "GPA must be a number (e.g. 3.8).";
  if (num <= 0) return "GPA must be greater than 0.";
  if (num > scaleNum)
    return `${num} exceeds your selected scale of ${scaleNum}. Check your GPA or change the scale.`;

  // Catch common user mistakes
  if (scaleNum === 4.0 && num > 4.3)
    return `${num} is too high for a 4.0 scale. Did you mean a 5.0 or percentage scale?`;
  if (scaleNum === 4.0 && num < 0.5)
    return "That GPA seems extremely low. Double-check your entry.";
  if (scaleNum === 100 && num > 100)
    return "A percentage grade can't exceed 100.";
  if (scaleNum === 100 && num < 10)
    return "That percentage seems very low. Enter your actual grade (e.g. 87).";

  return null;
}

// ─── SAT / TEST SCORE ─────────────────────────────────────────────────────────

export function validateSAT(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional

  const skip = /not yet|not taken|haven.t|haven't|no|n\/a|na|tbd|planning|will take|none/i;
  if (skip.test(s)) return null; // accepted as "haven't taken it"

  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return "Enter your SAT score (400–1600), or leave blank if not taken.";

  const num = parseInt(digits);
  if (num < 400) return "SAT scores range from 400–1600. Leave blank if you haven't taken it.";
  if (num > 1600) return "SAT scores max out at 1600. Check your entry.";
  return null;
}

export function validateACT(v: string): string | null {
  const s = v.trim();
  if (!s) return null;

  const skip = /not yet|not taken|haven.t|haven't|no|n\/a|na|tbd|planning|will take|none/i;
  if (skip.test(s)) return null;

  const digits = s.replace(/[^0-9]/g, "");
  if (!digits) return "Enter your ACT score (1–36), or leave blank if not taken.";

  const num = parseInt(digits);
  if (num < 1 || num > 36) return "ACT scores range from 1–36.";
  return null;
}

// ─── DREAM SCHOOLS ───────────────────────────────────────────────────────────

export function validateDreamSchools(v: string): string | null {
  const s = v.trim();
  if (!s) return "Enter at least one school name.";

  const schools = s.split(",").map(x => x.trim()).filter(Boolean);
  if (schools.length === 0) return "Enter at least one school.";
  if (schools.length > 20) return "Keep your list under 20 schools.";

  for (const school of schools) {
    if (school.length < 2) return `"${school}" is too short to be a school name.`;
    if (/^\d+$/.test(school)) return "Enter school names, not numbers.";
    if (isGibberish(school.replace(/\s+/g, "")))
      return `"${school}" doesn't look like a real college. Try names like "MIT" or "UCLA".`;
  }
  return null;
}

// ─── COLLEGE NAME (single, for chancer) ──────────────────────────────────────

export function validateCollegeName(v: string): string | null {
  const s = v.trim();
  if (!s) return "Please enter a college name.";
  if (s.length < 2) return "College name is too short.";
  if (/^\d+$/.test(s)) return "Enter a college name, not a number.";
  if (isGibberish(s.replace(/\s+/g, "")))
    return `"${s}" doesn't look like a real college. Try "MIT", "UCLA", or "University of Michigan".`;
  const notColleges = ["google","apple","amazon","netflix","facebook","meta","tesla","nasa","spacex","openai"];
  if (notColleges.includes(s.toLowerCase()))
    return `"${s}" is a company, not a college. Enter a university name.`;
  return null;
}

// ─── EXTRACURRICULARS ────────────────────────────────────────────────────────

export function validateExtracurriculars(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional, handled by "None provided" fallback

  const badExact = new Set([
    "idk","idc","none","nothing","no","nope","nah","na","n/a",
    "idk man","no idea","not sure","don't know","dont know","i don't know",
    "many","a lot","lots","stuff","things","various","some","clubs",
    "some clubs","lots of things","many things","various activities",
    "sports","band","club","music","art","volunteer","volunteering",
  ]);
  if (badExact.has(s.toLowerCase()))
    return "Please be more specific (e.g. 'Varsity soccer captain, Math Olympiad, 150hrs hospital volunteer'). The more detail, the more accurate your chances.";

  if (isGibberish(s.replace(/\s+/g, "")))
    return "That doesn't look like a real description. Enter your actual activities.";

  if (s.length < 5)
    return "Give a bit more detail about your activities, or skip this field.";

  // Single generic word without context
  const genericSingle = /^(sports?|music|art|volunteer|club|band|team|dance|theater|theatre|debate|chess|math|science)\.?$/i;
  if (genericSingle.test(s))
    return `"${s}" is too vague. Try something like "Debate team captain (3 years)" for accurate chancing.`;

  return null;
}

// ─── AWARDS ──────────────────────────────────────────────────────────────────

export function validateAwards(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional

  const badExact = new Set([
    "idk","idc","none","nothing","no","nope","nah","na","n/a","no awards",
    "idk man","no idea","not sure","don't know","dont know","i don't know",
    "some","a few","many","lots","various","stuff",
  ]);
  if (badExact.has(s.toLowerCase()))
    return "List specific award names (e.g. 'National Merit Semifinalist'), or skip this field.";

  if (isGibberish(s.replace(/\s+/g, "")))
    return "Please enter real award names, or skip this field.";

  if (s.length < 3)
    return "Describe at least one award, or skip this field.";

  return null;
}

// ─── AP COURSES ──────────────────────────────────────────────────────────────

export function validateAPCourses(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional

  if (isGibberish(s.replace(/\s+/g, "")))
    return "Enter a number or list like '6 AP courses' or 'AP Calc, AP Bio'.";

  const num = parseInt(s.replace(/[^0-9]/g, ""));
  if (!isNaN(num) && num > 35)
    return "That's an unusually high number of AP courses. Double-check.";

  return null;
}

// ─── MAJOR ───────────────────────────────────────────────────────────────────

export function validateMajor(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional — defaults to "Undecided"
  if (s.length < 2) return "Please enter a valid major or leave blank.";
  if (/^\d+$/.test(s)) return "Enter a major name (e.g. 'Computer Science').";
  if (isGibberish(s.replace(/\s+/g, "")))
    return "Enter a real major (e.g. 'Computer Science', 'Pre-med', 'Undecided').";
  return null;
}

// ─── STATE ───────────────────────────────────────────────────────────────────

export function validateState(v: string): string | null {
  const s = v.trim();
  if (!s) return null; // optional
  if (s.length < 2) return "Enter a valid state or country name.";
  if (/^\d+$/.test(s)) return "Enter your state name, not a number.";
  if (isGibberish(s)) return "Enter a valid state or country (e.g. 'California', 'Texas').";
  return null;
}

// ─── CHANCER FULL-FORM VALIDATOR ──────────────────────────────────────────────

export interface ChancerErrors {
  gpa?: string;
  sat?: string;
  act?: string;
  apCourses?: string;
  extracurriculars?: string;
  awards?: string;
  major?: string;
  state?: string;
  school?: string;
}

export function validateChancerForm(
  profile: {
    gpa: string; gpaScale: string;
    sat: string; act: string; apCourses: string;
    extracurriculars: string; awards: string;
    major: string; state: string;
  },
  school: string
): ChancerErrors {
  const errors: ChancerErrors = {};
  const e = (k: keyof ChancerErrors, fn: () => string | null) => {
    const r = fn(); if (r) errors[k] = r;
  };
  e("school",          () => validateCollegeName(school));
  e("gpa",             () => validateGPA(profile.gpa, profile.gpaScale));
  e("sat",             () => validateSAT(profile.sat));
  e("act",             () => validateACT(profile.act));
  e("apCourses",       () => validateAPCourses(profile.apCourses));
  e("extracurriculars",() => validateExtracurriculars(profile.extracurriculars));
  e("awards",          () => validateAwards(profile.awards));
  e("major",           () => validateMajor(profile.major));
  e("state",           () => validateState(profile.state));
  return errors;
}

// ─── BACKEND SANITIZER (for API route) ───────────────────────────────────────
// Returns cleaned values + a list of warnings to include in the AI prompt

export interface SanitizedProfile {
  school: string;
  gpa: string; gpaScale: string; gpaType: string;
  sat: string; act: string; apCourses: string; classRank: string;
  extracurriculars: string; leadershipRoles: string; awards: string; sportsLevel: string;
  recLetterStrength: string; essayStrength: string;
  firstGen: boolean; legacy: boolean; state: string; major: string;
  normalizedGpa: string;
  warnings: string[];
  validationErrors: string[];
}

export function sanitizeAndValidateForAPI(raw: Record<string, unknown>): SanitizedProfile {
  const warnings: string[] = [];
  const validationErrors: string[] = [];

  function clean(v: unknown): string {
    if (typeof v !== "string") return "";
    return v.trim();
  }

  const school      = clean(raw.school);
  const gpa         = clean(raw.gpa);
  const gpaScale    = clean(raw.gpaScale) || "4.0";
  const gpaType     = clean(raw.gpaType) || "weighted";
  const sat         = clean(raw.sat);
  const act         = clean(raw.act);
  const apCourses   = clean(raw.apCourses);
  const classRank   = clean(raw.classRank);
  const extras      = clean(raw.extracurriculars);
  const leadership  = clean(raw.leadershipRoles);
  const awards      = clean(raw.awards);
  const sportsLevel = clean(raw.sportsLevel) || "None";
  const recLetter   = clean(raw.recLetterStrength) || "Unknown";
  const essay       = clean(raw.essayStrength) || "Unknown";
  const firstGen    = Boolean(raw.firstGen);
  const legacy      = Boolean(raw.legacy);
  const state       = clean(raw.state);
  const major       = clean(raw.major);

  // ── College name ──
  const schoolErr = validateCollegeName(school);
  if (schoolErr) validationErrors.push(`School: ${schoolErr}`);

  // ── GPA ──
  const gpaErr = validateGPA(gpa, gpaScale);
  if (gpaErr) validationErrors.push(`GPA: ${gpaErr}`);
  const scaleNum = parseFloat(gpaScale) || 4.0;
  const rawGpaNum = parseFloat(gpa) || 0;
  const normalizedGpa = rawGpaNum > 0
    ? scaleNum !== 4.0 ? ((rawGpaNum / scaleNum) * 4.0).toFixed(2) : rawGpaNum.toFixed(2)
    : "Not provided";

  // ── SAT / ACT ──
  const satErr = validateSAT(sat);
  if (satErr) validationErrors.push(`SAT: ${satErr}`);
  const actErr = validateACT(act);
  if (actErr) validationErrors.push(`ACT: ${actErr}`);

  // ── ECs — sanitize gibberish to "Not provided" with a warning ──
  let cleanExtras = extras;
  if (extras && validateExtracurriculars(extras)) {
    warnings.push("Extracurriculars input was unclear — treat as unspecified.");
    cleanExtras = "Not clearly specified by student";
  } else if (!extras) {
    cleanExtras = "Not provided";
  }

  // ── Awards — same ──
  let cleanAwards = awards;
  if (awards && validateAwards(awards)) {
    warnings.push("Awards input was unclear — treat as unspecified.");
    cleanAwards = "Not clearly specified by student";
  } else if (!awards) {
    cleanAwards = "None provided";
  }

  // ── Major / State ──
  const cleanMajor = validateMajor(major) ? "Undecided" : (major || "Undecided");
  const cleanState = validateState(state) ? "" : state;

  return {
    school, gpa, gpaScale, gpaType, sat: sat || "Not taken", act: act || "Not taken",
    apCourses: apCourses || "Not provided", classRank: classRank || "Unknown",
    extracurriculars: cleanExtras, leadershipRoles: leadership || "None specified",
    awards: cleanAwards, sportsLevel, recLetterStrength: recLetter,
    essayStrength: essay, firstGen, legacy,
    state: cleanState, major: cleanMajor,
    normalizedGpa, warnings, validationErrors,
  };
}
