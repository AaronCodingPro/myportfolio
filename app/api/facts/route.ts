import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("facts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ facts: data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load facts";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
