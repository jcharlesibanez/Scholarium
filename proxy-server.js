import http from "http";

const PORT = 8787;
const OPENAI_URL = "https://api.openai.com/v1/responses";
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `
- You are the computer inside of Scholarium, a software company with the goal of maximizing the average human's education.
- You will create a 60-second animation containing EXACTLY and ONLY what the user requests.
- Do NOT include any escape sequences or string formatting ( such as \\n or \\\\ ) in your output.
- Use a transparent background, and do not include titles or explanatory sentences; instead use basic labels.
- If any instruction is ambiguous, choose the simplest valid interpretation.
`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    svg: { type: "string", description: "arrays of anime.js animations grouped by their targets" },
    animations: { type: "string", description: "pure innerHTML that would be pasted inside of an svg (don't include svg tags)" },
  },
  required: ["svg", "animations"],
  additionalProperties: false,
};

http
  .createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, cors);
      return res.end();
    }

    if (req.method !== "POST" || req.url !== "/api/animation") {
      res.writeHead(404, cors);
      return res.end("Not found");
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      let parsedBody = {};
      try {
        parsedBody = body ? JSON.parse(body) : {};
      } catch {
        res.writeHead(400, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify({ error: { message: "Invalid JSON body" } }));
      }
      const userInput = typeof parsedBody?.userInput === "string" ? parsedBody.userInput : "";
      if (!userInput.trim()) {
        res.writeHead(400, { "Content-Type": "application/json", ...cors });
        return res.end(JSON.stringify({ error: { message: "Missing userInput" } }));
      }

      const payload = {
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userInput },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "animation",
            schema: RESPONSE_SCHEMA,
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

      const text = await upstream.text();
      res.writeHead(upstream.status, { "Content-Type": "application/json", ...cors });
      res.end(text);
    });
  })
  .listen(PORT, () => {
    console.log(`Proxy running at http://localhost:${PORT}`);
  });
