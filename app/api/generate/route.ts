import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You generate 5 short, interesting facts as a bullet list.",
            },
            {
              role: "user",
              content: `Give me facts about ${topic}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const apiError =
        typeof data?.error?.message === "string"
          ? data.error.message
          : "Groq request failed";
      return NextResponse.json(
        { error: apiError },
        { status: response.status }
      );
    }

    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Model returned an empty response." },
        { status: 502 }
      );
    }

    const facts = text
      .split("\n")
      .map((line: string) => line.replace(/^[-•\d.]\s*/, ""))
      .filter(Boolean);

    return NextResponse.json({ facts });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate facts" },
      { status: 500 }
    );
  }
}
