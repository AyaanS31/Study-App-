import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeAndValidateForAPI } from "@/lib/validation";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── Sanitize & validate all inputs ──────────────────────────────────────────
  const p = sanitizeAndValidateForAPI(body);

  // Hard-fail on critical validation errors (GPA required, school required)
  const criticalErrors = p.validationErrors.filter(e =>
    e.startsWith("School:") || e.startsWith("GPA:")
  );
  if (criticalErrors.length > 0) {
    return NextResponse.json(
      { error: criticalErrors[0], validationErrors: p.validationErrors },
      { status: 422 }
    );
  }

  // Build context note for AI about data quality
  const dataQualityNote = [
    ...p.warnings,
    ...p.validationErrors.filter(e => !e.startsWith("School:") && !e.startsWith("GPA:")),
  ].join("; ");

  const prompt = `You are a highly accurate college admissions expert. Use web search to find the CURRENT acceptance rate and average stats for ${p.school}.

Then evaluate this student's realistic admission probability using holistic review — exactly how admissions officers do.

${dataQualityNote ? `⚠️ DATA QUALITY NOTE: ${dataQualityNote}. Factor this uncertainty appropriately — if key data is missing, use "Unknown/not provided" language in your analysis.\n` : ""}
═══════════════════════════════
STUDENT PROFILE
═══════════════════════════════

SCHOOL: ${p.school}
Intended Major: ${p.major}
State of Residence: ${p.state || "Not provided"}

ACADEMICS:
• GPA: ${p.gpa} on a ${p.gpaScale} scale (${p.gpaType})
  → Normalized to 4.0 scale: ${p.normalizedGpa} / 4.0
• SAT: ${p.sat}
• ACT: ${p.act}
• AP/IB Courses: ${p.apCourses}
• Class Rank: ${p.classRank}

EXTRACURRICULARS & LEADERSHIP:
• Activities: ${p.extracurriculars}
• Leadership: ${p.leadershipRoles}
• Athletics: ${p.sportsLevel}

AWARDS & HONORS:
${p.awards}

LETTERS OF RECOMMENDATION:
• Strength: ${p.recLetterStrength}

ESSAYS:
• Self-assessed strength: ${p.essayStrength}

CONTEXT:
• First-generation college student: ${p.firstGen ? "Yes" : "No"}
• Legacy applicant: ${p.legacy ? "Yes" : "No"}

═══════════════════════════════
EVALUATION INSTRUCTIONS
═══════════════════════════════

1. Web search ${p.school} current acceptance rate, median GPA (unweighted 4.0), median SAT, median ACT.
2. Compare student's normalized GPA (${p.normalizedGpa}/4.0) against the school's median.
3. Evaluate ECs and awards holistically — they matter enormously at selective schools.
4. If extracurriculars or awards say "Not clearly specified" or "Not provided", note this as a weakness.
5. Be realistic. Never inflate chances. A 5% acceptance-rate school is always a Reach, even for perfect stats.
6. Factor major competitiveness (e.g. CS at Stanford is far harder than average acceptance rate).
7. Factor geographic/demographic diversity context if relevant.

Return ONLY valid JSON, no markdown fences, no explanation:

{
  "chance": <integer 1-98>,
  "acceptanceRate": "<e.g. '4.7%'>",
  "avgGPA": "<e.g. '3.9'>",
  "avgSAT": "<e.g. '1530'>",
  "avgACT": "<e.g. '35'>",
  "label": "<'Reach' | 'Hard Target' | 'Target' | 'Safety'>",
  "academicRating": <1-10 integer>,
  "ecRating": <1-10 integer>,
  "recLetterRating": <1-10 integer>,
  "overallRating": <1-10 integer>,
  "strengths": ["<specific strength>", "<specific strength>"],
  "weaknesses": ["<specific weakness>", "<specific weakness>"],
  "tip": "<One specific, actionable piece of advice for this student at this school>",
  "normalizedGpa": "${p.normalizedGpa}",
  "dataSource": "<brief source of acceptance rate data>"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find(b => b.type === "text") as { type: "text"; text: string } | undefined;
    if (!textBlock) {
      return NextResponse.json({ error: "No response from AI. Please try again." }, { status: 500 });
    }

    const raw = textBlock.text.replace(/```json|```/g, "").trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response. Please try again." }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Sanity-check the chance value
    if (typeof parsed.chance !== "number" || parsed.chance < 1 || parsed.chance > 98) {
      parsed.chance = Math.max(1, Math.min(98, parseInt(parsed.chance) || 5));
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Chancer API error:", err);
    return NextResponse.json(
      { error: "Something went wrong calculating your chances. Please try again." },
      { status: 500 }
    );
  }
}
