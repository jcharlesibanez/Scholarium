const http = require("http");
const { existsSync, readFileSync } = require("fs");
const { join } = require("path");

const PORT = Number(process.env.PORT) || 8787;
const OPENAI_URL = "https://api.openai.com/v1/responses";

const SYSTEM_PROMPT = `
- You are the computer inside of Scholarium, a software company with the goal of maximizing the average human's education.
- You will create a 60-second animation containing EXACTLY and ONLY what the user requests.
- Do NOT include any escape sequences or string formatting ( such as \\n or \\\\ ) in your output.
- Use a transparent background, and do not include titles or explanatory sentences; instead use basic labels.
- If any instruction is ambiguous, choose the simplest valid interpretation.
`;

const SCHEMA = {
  type: "object",
  properties: {
    svg: { type: "string", description: "arrays of anime.js animations grouped by their targets" },
    animations: { type: "string", description: "pure innerHTML that would be pasted inside of an svg (don't include svg tags)" },
  },
  required: ["svg", "animations"],
  additionalProperties: false,
};

const readEnvKey = () => {
  const envPath = join(__dirname, "scholarium", ".env.local");
  if (!existsSync(envPath)) {
    return "";
  }

  const content = readFileSync(envPath, "utf8");
  const line = content.split(/\r?\n/).find((value) => value.startsWith("VITE_OPENAI_API_KEY="));
  return line ? line.slice("VITE_OPENAI_API_KEY=".length).trim() : "";
};

const apiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || readEnvKey()).trim();

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY. Set it in the environment or scholarium/.env.local.");
  process.exit(1);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { "Content-Type": "application/json", ...corsHeaders });
  res.end(JSON.stringify(payload));
};

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/animation") {
    try {
      const body = await readJsonBody(req);
      const userInput = typeof body?.userInput === "string" ? body.userInput.trim() : "";
      if (!userInput) {
        sendJson(res, 400, { error: { message: "Missing userInput" } });
        return;
      }

      const payload = {
        model: "gpt-4.1-mini",
        instructions: SYSTEM_PROMPT,
        input: userInput,
        text: {
          format: {
            type: "json_schema",
            json_schema: {
              name: "animation",
              schema: SCHEMA,
            },
          },
        },
      };

      const upstream = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const upstreamText = await upstream.text();
      if (!upstream.ok) {
        res.writeHead(upstream.status, { "Content-Type": "application/json", ...corsHeaders });
        res.end(upstreamText);
        return;
      }

      const upstreamJson = JSON.parse(upstreamText);
      const outputText =
        upstreamJson?.output?.find((item) => item.type === "message")?.content?.find((content) => content.type === "output_text")
          ?.text ?? "";
      if (!outputText) {
        sendJson(res, 502, { error: { message: "OpenAI response was empty" } });
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(outputText);
      } catch (err) {
        sendJson(res, 502, { error: { message: "OpenAI response was not valid JSON" } });
        return;
      }

      sendJson(res, 200, parsed);
    } catch (err) {
      sendJson(res, 500, { error: { message: err?.message || "Server error" } });
    }
    return;
  }

  res.writeHead(404, corsHeaders);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`OpenAI proxy listening on http://localhost:${PORT}`);
});
