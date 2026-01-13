import http from "http";

const PORT = 1337;

const SYSTEM_PROMPT = `
    - You are the computer inside of Scholarium, a software company with the goal of maximizing the average human's education.
    - You will create a 60-second animation containing EXACTLY and ONLY what the user requests.
    - DO NOT INCLUDE BACKSLASHES ANYWHERE IN YOUR OUTPUT.
    - DO NOT INCLUDE NEWLINES, OR QUOTATION MARKS. AIM TO MINIMIZE CHARACTER USAGE.
    - Use a transparent background, and do not include titles or explanatory sentences; instead use basic labels.
    - If any instruction is ambiguous, choose the simplest valid interpretation.
    - Respond in JSON only.
    - Your JSON should contain one key titled "svg" with pure innerHTML inside of it, that would go inside of an svg tag.
    - After, your JSON should contain a key titled "animations", containing an array of animation objects in anime.js grouped by their targets.
    - In the animations key, write the target in a "targets" key and then write each animation property/parameter as a separate json key.
    - The JSON must include keys "svg" and "animations" at the top level.
    - Do not create keys like "keyframes". "animations" should just be animation parameters and "targets". No more sub-keys.
    - The animations must loop indefinitely

    - EXAMPLE OUTPUT: {"svg":"<rect x='0' y='0' width='520' height='520' fill='transparent'/><line x1='40' y1='260' x2='480' y2='260' stroke='black' stroke-width='2'/><circle id='dot' cx='60' cy='260' r='10' fill='black'/><text x='480' y='280' font-family='Arial' font-size='14' fill='black'>x</text>","animations":[{"targets":"#dot","translateX":380,"duration":60000,"easing":"linear"}]}
`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};
console.log(process.env.OPENAI_API_KEY.slice(-4));

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders);
        return res.end();
    }

    if (req.method !== "POST" || req.url !== "/api/animation") {
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
                text: {
                    format: {
                        type: "json_object",
                    },
                },
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

        res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
        console.log(`\nOUTPUT:\n${text}\n---------------------------`);
        res.end(text);
    });
});

server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
