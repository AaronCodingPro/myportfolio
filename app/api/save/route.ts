import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    const { topic, facts } = body;

    const cleanTopic = typeof topic === "string" ? topic.trim() : "";
    const cleanFacts = Array.isArray(facts)
      ? facts
          .filter((fact): fact is string => typeof fact === "string")
          .map((fact) => fact.trim())
          .filter(Boolean)
      : [];

    if (!cleanTopic || cleanFacts.length === 0) {
      return NextResponse.json(
        { error: "Missing topic or facts" },
        { status: 400 }
      );
    }

    const rows = cleanFacts.map((fact) => ({
      topic: cleanTopic,
      fact,
    }));

    const { error } = await supabase.from("facts").insert(rows);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save facts";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
