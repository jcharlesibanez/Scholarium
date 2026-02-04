import http from "http";
import path from "path";
import { writeFile } from "fs/promises";

const PORT = 1337;

const SYSTEM_PROMPT = `
    - You are the computer inside of Scholarium, a software company with the goal of maximizing the average human's education.
    - You will create a 60-second animation containing EXACTLY and ONLY what the user requests.
    - DO NOT INCLUDE BACKSLASHES ANYWHERE IN YOUR OUTPUT.
    - DO NOT INCLUDE QUOTATION MARKS. AIM TO MINIMIZE CHARACTER USAGE.
    - Do not include titles or explanatory sentences; instead use basic labels.
    - If any instruction is ambiguous, choose the simplest valid interpretation.
    - Respond in ManimCE code only.
`

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};
console.log(process.env.OPENAI_API_KEY.slice(-4));

const MANIM_PATH = path.join(process.cwd(), "src", "manimation.py");

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders);
        return res.end();
    }

    if (req.method !== "POST") {
        res.writeHead(404, corsHeaders);
        return res.end("Not found");
    }

    if (req.url === "/api/write-manim") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", async () => {
            try {
                if (!body || typeof body !== "string") {
                    res.writeHead(400, corsHeaders);
                    return res.end("Invalid content");
                }

                await writeFile(MANIM_PATH, body, "utf8");
                res.writeHead(200, corsHeaders);
                return res.end("ok");
            } catch (err) {
                res.writeHead(500, corsHeaders);
                return res.end(err?.message || "Failed to write file");
            }
        });
        return;
    }

    if (req.url === "/api/delete-manim") {
        try { await writeFile(MANIM_PATH, "", "utf8"); } catch (e) { console.log(`Failed to delete manim: ${e}`) }
    }

    if (req.url !== "/api/animation") {
        res.writeHead(404, corsHeaders);
        return res.end("Not found");
    }

    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
        const { userInput } = JSON.parse(body || "{}");
        if (!userInput) { res.end("No valid input"); return; };

        const upstream = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-5.1-codex-mini",
                input: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userInput },
                ],
            }),
        });

        const upstreamText = await upstream.text();
        if (!upstream.ok) {
        res.writeHead(upstream.status, { "Content-Type": "application/json", ...corsHeaders });
        return res.end(upstreamText);
        }

        const json = JSON.parse(upstreamText);
        const text =
        json?.output?.find((i) => i.type === "message")?.content?.find((c) => c.type === "output_text")?.text
        ?? "{}";

        res.writeHead(200, { "Content-Type": "text/plain", ...corsHeaders });
        console.log(`\nOUTPUT:\n${text}\n---------------------------`);
        res.end(text);
    });
});

server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
