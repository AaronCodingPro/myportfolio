"use client";

import { useState } from "react";

type SavedFact = {
  id: string;
  topic: string;
  fact: string;
};

export default function Home() {
  const [topic, setTopic] = useState("");
  const [facts, setFacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mathProblem, setMathProblem] = useState("");
  const [solutionSteps, setSolutionSteps] = useState<string[]>([]);
  const [solveLoading, setSolveLoading] = useState(false);
  const [solveErrorMessage, setSolveErrorMessage] = useState("");
  const [poemTopic, setPoemTopic] = useState("");
  const [poemGenre, setPoemGenre] = useState("free verse");
  const [poemLineCount, setPoemLineCount] = useState(8);
  const [useMetaphor, setUseMetaphor] = useState(false);
  const [useAlliteration, setUseAlliteration] = useState(false);
  const [useAnaphora, setUseAnaphora] = useState(false);
  const [useSimile, setUseSimile] = useState(false);
  const [usePersonification, setUsePersonification] = useState(false);
  const [useImagery, setUseImagery] = useState(false);
  const [useRhyme, setUseRhyme] = useState(false);
  const [poemLines, setPoemLines] = useState<string[]>([]);
  const [poemLoading, setPoemLoading] = useState(false);
  const [poemErrorMessage, setPoemErrorMessage] = useState("");

  async function generateFacts() {
    if (!topic) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to generate facts.");
        return;
      }

      setFacts(data.facts || []);
    } catch {
      setErrorMessage("Failed to generate facts.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFacts() {
    if (facts.length === 0) return;

    setErrorMessage("");

    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, facts }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save facts.");
        return;
      }

      setFacts([]);
      fetchSavedFacts();
    } catch {
      setErrorMessage("Failed to save facts.");
    }
  }

  async function solveMathProblem() {
    if (!mathProblem) return;

    setSolveLoading(true);
    setSolveErrorMessage("");

    try {
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: mathProblem }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSolveErrorMessage(data.error || "Failed to solve problem.");
        return;
      }

      setSolutionSteps(data.steps || []);
    } catch {
      setSolveErrorMessage("Failed to solve problem.");
    } finally {
      setSolveLoading(false);
    }
  }

  async function generatePoem() {
    if (!poemTopic) return;

    setPoemLoading(true);
    setPoemErrorMessage("");

    try {
      const res = await fetch("/api/poem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: poemTopic,
          genre: poemGenre,
          lineCount: poemLineCount,
          devices: {
            metaphor: useMetaphor,
            alliteration: useAlliteration,
            anaphora: useAnaphora,
            simile: useSimile,
            personification: usePersonification,
            imagery: useImagery,
            rhyme: useRhyme,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPoemErrorMessage(data.error || "Failed to generate poem.");
        return;
      }

      setPoemLines(data.lines || []);
    } catch {
      setPoemErrorMessage("Failed to generate poem.");
    } finally {
      setPoemLoading(false);
    }
  }

  async function fetchSavedFacts() {
    try {
      const res = await fetch("/api/facts");
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load saved facts.");
        return [] as SavedFact[];
      }
      return data.facts || [];
    } catch {
      setErrorMessage("Failed to load saved facts.");
      return [] as SavedFact[];
    }
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderSavedFactsWindow(
    factsWindow: Window,
    factsToRender: SavedFact[],
  ) {
    const listContent =
      factsToRender.length > 0
        ? factsToRender
            .map(
              (item) =>
                `<li><strong>${escapeHtml(item.topic)}:</strong> ${escapeHtml(item.fact)}</li>`,
            )
            .join("")
        : "<p>No saved facts yet.</p>";

    factsWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>Saved Facts</title>
    <style>
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, sans-serif;
        background: linear-gradient(160deg, #f97316, #ef4444);
      }
      .card {
        max-width: 760px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 14px;
        padding: 20px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.15);
      }
      h1 {
        margin-top: 0;
      }
      ul {
        padding-left: 18px;
      }
      li {
        margin-bottom: 8px;
        line-height: 1.45;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Saved Facts</h1>
      <ul>${listContent}</ul>
    </div>
  </body>
</html>`);
    factsWindow.document.close();
  }

  async function openSavedFactsWindow() {
    setErrorMessage("");
    const factsWindow = window.open("", "saved-facts", "width=900,height=700");

    if (!factsWindow) {
      setErrorMessage("Popup blocked. Please allow popups to view saved facts.");
      return;
    }

    factsWindow.document.write("<p style='font-family: Arial, sans-serif; padding: 16px;'>Loading saved facts...</p>");
    factsWindow.document.close();

    const latestFacts = await fetchSavedFacts();
    renderSavedFactsWindow(factsWindow, latestFacts);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          AI Facts Generator
        </h1>

        <input
          type="text"
          placeholder="Enter a topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border p-2 rounded-md"
        />

        <button
          onClick={generateFacts}
          className="w-full bg-black text-white py-2 rounded-md"
        >
          {loading ? "Generating..." : "Generate facts"}
        </button>

        <button
          onClick={openSavedFactsWindow}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          Saved Facts
        </button>

        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        {facts.length > 0 && (
          <>
            <ul className="list-disc list-inside space-y-2">
              {facts.map((fact, i) => (
                <li key={i}>{fact}</li>
              ))}
            </ul>

            <button
              onClick={saveFacts}
              className="w-full bg-green-600 text-white py-2 rounded-md"
            >
              Save
            </button>
          </>
        )}

        <div className="border-t pt-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            AI Math Problem Solver
          </h2>

          <input
            type="text"
            placeholder="Enter a math problem"
            value={mathProblem}
            onChange={(e) => setMathProblem(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <button
            onClick={solveMathProblem}
            className="w-full bg-black text-white py-2 rounded-md"
          >
            {solveLoading ? "Solving..." : "Solve"}
          </button>

          {solveErrorMessage && (
            <p className="text-sm text-red-600">{solveErrorMessage}</p>
          )}

          {solutionSteps.length > 0 && (
            <ul className="list-disc list-inside space-y-2">
              {solutionSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t pt-6 space-y-6">
          <h2 className="text-2xl font-bold text-center">
            AI Poem Generator
          </h2>

          <input
            type="text"
            placeholder="Enter a poem topic"
            value={poemTopic}
            onChange={(e) => setPoemTopic(e.target.value)}
            className="w-full border p-2 rounded-md"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Genre
            </label>
            <select
              value={poemGenre}
              onChange={(e) => setPoemGenre(e.target.value)}
              className="w-full border p-2 rounded-md"
            >
              <option value="free verse">Free Verse</option>
              <option value="haiku">Haiku</option>
              <option value="sonnet">Sonnet</option>
              <option value="limerick">Limerick</option>
              <option value="acrostic">Acrostic</option>
              <option value="ballad">Ballad</option>
              <option value="ode">Ode</option>
              <option value="elegy">Elegy</option>
              <option value="ghazal">Ghazal</option>
              <option value="blank verse">Blank Verse</option>
              <option value="villanelle">Villanelle</option>
              <option value="spoken word">Spoken Word</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Number of Lines
            </label>
            <input
              type="number"
              min={2}
              max={24}
              value={poemLineCount}
              onChange={(e) => setPoemLineCount(Number(e.target.value) || 2)}
              className="w-full border p-2 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Poetic Devices
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useMetaphor}
                onChange={(e) => setUseMetaphor(e.target.checked)}
              />
              Metaphor
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useAlliteration}
                onChange={(e) => setUseAlliteration(e.target.checked)}
              />
              Alliteration
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useAnaphora}
                onChange={(e) => setUseAnaphora(e.target.checked)}
              />
              Anaphora
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useSimile}
                onChange={(e) => setUseSimile(e.target.checked)}
              />
              Simile
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={usePersonification}
                onChange={(e) => setUsePersonification(e.target.checked)}
              />
              Personification
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useImagery}
                onChange={(e) => setUseImagery(e.target.checked)}
              />
              Imagery
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useRhyme}
                onChange={(e) => setUseRhyme(e.target.checked)}
              />
              Rhyme
            </label>
          </div>

          <button
            onClick={generatePoem}
            className="w-full bg-black text-white py-2 rounded-md"
          >
            {poemLoading ? "Generating..." : "Generate poem"}
          </button>

          {poemErrorMessage && (
            <p className="text-sm text-red-600">{poemErrorMessage}</p>
          )}

          {poemLines.length > 0 && (
            <ul className="list-none space-y-1">
              {poemLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
