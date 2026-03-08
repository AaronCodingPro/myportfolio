import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
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

    const text = data.choices[0].message.content;

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
