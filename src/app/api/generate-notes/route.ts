import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

export async function POST(req: NextRequest) {
    try {
    const { diff } = await req.json();

    if (!diff || typeof diff !== "string") {
        console.error("❌ Missing or invalid 'diff' in request body");
        return NextResponse.json({ error: "Missing or invalid 'diff'" }, { status: 400 });
    }

    const prompt = `
        You are a professional release note generator.

        Given the following Git diff, create:
        1. A short technical changelog entry for developers. Be concise and precise.
        2. A friendly marketing changelog entry for end users. Focus on benefits.

        Respond in **pure JSON only** — do not include code fences, markdown, or any explanation. Your entire output should be a single JSON object like this:
        {
            "developer": "Refactored useFetchDiffs hook to use useSWR for improved caching and reduced re-renders.",
            "marketing": "Loading pull requests is now faster and smoother thanks to improved data fetching!"
        }

        Git diff:
        \`\`\`diff
        ${diff}
        \`\`\`
    `;


    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        },
            body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You generate dual-tone release notes for git diffs." },
                { role: "user", content: prompt },
        ],
            temperature: 0.7,
        }),
    })

    const json = await response.json();

    if (!response.ok) {
        console.error("❌ OpenAI API error:", json);
        return NextResponse.json({ error: json.error?.message || "OpenAI error" }, { status: 500 });
    }

    const content = json.choices?.[0]?.message?.content;
    if (!content) {
        console.error("❌ No content in OpenAI response:", json);
        return NextResponse.json({ error: "No content returned from OpenAI" }, { status: 500 });
    }

    console.log("OpenAI response content:", content);

    // Clean triple-backtick markdown formatting
    const cleaned = content
        .trim()
        .replace(/^```json\\n?/i, "")  // remove starting ```json or ```json\n
        .replace(/^json\\n?/i, "")     // remove starting json if not backticked
        .replace(/^```/, "")           // remove lone ```
        .replace(/```$/, "")           // remove ending ```
        .trim();

    let notes;
    try {
        notes = JSON.parse(cleaned);
    } catch (err) {
        console.error("❌ Failed to parse cleaned OpenAI response:", cleaned);
        return NextResponse.json({ error: "Failed to parse OpenAI response as JSON" }, { status: 500 });
    }

    return NextResponse.json(notes);
    } catch (err: any) {
        console.error("❌ Unexpected error:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}