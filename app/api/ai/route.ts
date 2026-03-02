import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { content, mode, difficulty } = await req.json();

  let prompt = "";

  if (mode === "flashcards") {
    prompt = `You are a study assistant. Based on these notes, generate exactly 8 flashcards as a JSON array.
Each flashcard must have "q" (question) and "a" (answer) fields. Keep answers concise.
Return ONLY the JSON array, no other text.

Notes:
${content}`;
  } else if (mode === "practice") {
    prompt = `You are a study assistant. Based on these notes, generate 5 practice questions at ${difficulty} difficulty.
Return a JSON array where each item has:
- "question": the question text
- "options": array of 4 answer choices (for multiple choice)
- "answer": the correct answer
- "explanation": brief explanation

Return ONLY the JSON array, no other text.

Notes:
${content}`;
  } else if (mode === "summary") {
    prompt = `You are a study assistant. Summarize these notes clearly and concisely in 3-5 bullet points.
Return a JSON object with:
- "summary": array of bullet point strings
- "keyTerms": array of important terms with their definitions (max 5)

Return ONLY the JSON object, no other text.

Notes:
${content}`;
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ result: parsed });
  } catch {
    return NextResponse.json({ result: text });
  }
}