import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { problem } = body;

    if (!problem) {
      return NextResponse.json(
        { error: "Problem is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You solve math problems and return concise step-by-step explanations as a bullet list. End with the final answer.",
            },
            {
              role: "user",
              content: `Solve this math problem: ${problem}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "No solution returned by model" },
        { status: 500 }
      );
    }

    const steps = text
      .split("\n")
      .map((line: string) => line.replace(/^[-•\d.]\s*/, "").trim())
      .filter(Boolean);

    return NextResponse.json({ steps });
  } catch {
    return NextResponse.json(
      { error: "Failed to solve problem" },
      { status: 500 }
    );
  }
}
