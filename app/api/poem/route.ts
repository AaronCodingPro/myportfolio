import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, genre, lineCount, devices } = body;

    const cleanTopic = typeof topic === "string" ? topic.trim() : "";
    const cleanGenre = typeof genre === "string" ? genre.trim() : "free verse";
    const count =
      typeof lineCount === "number" && Number.isFinite(lineCount)
        ? Math.min(24, Math.max(2, Math.floor(lineCount)))
        : 8;

    if (!cleanTopic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const enabledDevices: string[] = [];
    if (devices?.metaphor) enabledDevices.push("metaphor");
    if (devices?.alliteration) enabledDevices.push("alliteration");
    if (devices?.anaphora) enabledDevices.push("anaphora");
    if (devices?.simile) enabledDevices.push("simile");
    if (devices?.personification) enabledDevices.push("personification");
    if (devices?.imagery) enabledDevices.push("imagery");
    if (devices?.rhyme) enabledDevices.push("rhyme");

    const deviceInstruction =
      enabledDevices.length > 0
        ? `Use these poetic devices: ${enabledDevices.join(", ")}.`
        : "Do not force extra poetic devices.";

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
                "You are a creative poet. Return only the poem, one line per line, with no title and no explanation.",
            },
            {
              role: "user",
              content: `Write a ${cleanGenre} poem about "${cleanTopic}" in exactly ${count} lines. ${deviceInstruction}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "No poem returned by model" },
        { status: 500 }
      );
    }

    const lines = text
      .split("\n")
      .map((line: string) => line.trim())
      .filter(Boolean)
      .slice(0, count);

    return NextResponse.json({ lines });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate poem" },
      { status: 500 }
    );
  }
}
