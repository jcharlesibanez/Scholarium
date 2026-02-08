import http from "http";
import path from "path";
import { createReadStream } from "fs";
import { writeFile, mkdir, readdir, stat, readFile } from "fs/promises";
import { spawn } from "child_process";

const PORT = 1337;

const SYSTEM_PROMPT = `
You generate educational Manim Community v0.19.0 animations that maximize conceptual understanding.
You are creating a visual explanation like 3Blue1Brown or Khan Academy would.
Output ONLY valid Python code with NO explanations or comments.

EDUCATIONAL PRINCIPLES:
- Start simple, build complexity gradually
- Use visual metaphors and analogies
- Show transformations and processes, not just static results
- Highlight key insights with color, motion, or emphasis
- For algorithms: show step-by-step execution with data structures
- For math: show geometric intuition and algebraic steps side-by-side
- For concepts: use concrete examples before abstractions
- Your video must be capable of teaching the entire concept at hand by itself, with no other aides.

ABSOLUTE RULES:
1. ONLY use items from whitelist below
2. NEVER add parameters not explicitly listed
3. If you need something not whitelisted, build it manually from basic shapes
4. Test every method/parameter against whitelist before using

MANDATORY IMPORTS:
from manim import *

WHITELISTED MOBJECTS:
- Circle(radius=1, color=BLUE)
- Square(side_length=2, color=RED)
- Rectangle(width=3, height=2, color=GREEN)
- Triangle(color=YELLOW)
- Line(start=ORIGIN, end=RIGHT, color=WHITE)
- DashedLine(start=ORIGIN, end=RIGHT, color=WHITE)
- Dot(point=ORIGIN, color=YELLOW, radius=0.08)
- Arrow(start=ORIGIN, end=RIGHT, color=WHITE, buff=0)
- DoubleArrow(start=LEFT, end=RIGHT, color=WHITE, buff=0)
- Text('string', font_size=24, color=WHITE)
- MathTex(r'x^2', font_size=36, color=WHITE)
- Tex(r'text', font_size=24, color=WHITE)
- Code(code='def f():\\n    return x', language='python', font_size=14, background='window')
- VGroup(obj1, obj2, ...)
- Axes(x_range=[-5,5,1], y_range=[-5,5,1], x_length=10, y_length=6)
- NumberPlane(x_range=[-7,7,1], y_range=[-5,5,1])
- NumberLine(x_range=[-5,5,1], length=10, include_numbers=True)
- Table([[1,2],[3,4]], col_labels=[Text('A'), Text('B')])

WHITELISTED METHODS:
POSITIONING:
- obj.shift(2*RIGHT) - use UP, DOWN, LEFT, RIGHT constants or combinations
- obj.move_to(ORIGIN)
- obj.next_to(other, UP, buff=0.5)
- obj.to_edge(UP, buff=0.5)
- obj.to_corner(UL)
- obj.align_to(other, UP)

STYLING:
- obj.scale(2)
- obj.rotate(PI/4)
- obj.set_fill(RED, opacity=0.5)
- obj.set_stroke(BLUE, width=4)
- obj.set_color(RED)
- obj.set_opacity(0.5)

GROUPS:
- VGroup(o1, o2, ...).arrange(DOWN, buff=0.5)
- VGroup(o1, o2, ...).arrange(RIGHT, buff=1)
- group.add(obj)

AXES/GRAPHS:
- axes.plot(lambda x: x**2, x_range=[-3,3], color=BLUE)
- axes.c2p(x, y) - converts coordinates to point
- axes.p2c(point) - converts point to coordinates
- axes.get_graph_label(graph, r'f(x)', x_val=2, direction=UP)

TEXT:
- text[0:5] - slice Text or MathTex objects
- VGroup(*text) - group characters

WHITELISTED ANIMATIONS:
BASIC:
- Create(obj, run_time=1)
- Uncreate(obj, run_time=1)
- FadeIn(obj, run_time=1)
- FadeOut(obj, run_time=1)
- Write(obj, run_time=1.5)
- Unwrite(obj, run_time=1)
- DrawBorderThenFill(obj, run_time=1.5)
- GrowFromCenter(obj, run_time=1)
- SpinInFromNothing(obj, run_time=1)

MOVEMENT (use .animate):
- obj.animate.shift(2*RIGHT)
- obj.animate.move_to(UP)
- obj.animate.scale(2)
- obj.animate.rotate(PI/2)
- obj.animate.set_color(RED)
- obj.animate.set_opacity(0.5)

TRANSFORMS:
- Transform(obj1, obj2, run_time=2)
- ReplacementTransform(obj1, obj2, run_time=2)
- TransformFromCopy(obj1, obj2, run_time=1.5)

INDICATION (for emphasis):
- Indicate(obj, run_time=1)
- Flash(obj, run_time=1)
- Circumscribe(obj, color=YELLOW, run_time=1.5)
- ShowPassingFlash(obj, run_time=1)

GROUPS:
- AnimationGroup(anim1, anim2, lag_ratio=0.5)
- Succession(anim1, anim2)

USAGE:
- self.play(anim1, anim2) - play simultaneously
- self.play(anim1, run_time=2)
- self.wait(1)

TIMING REQUIREMENTS:
- Each self.play(): run_time 0.5-2.5 seconds (1-1.5 typical)
- self.wait(): 0.2-1 second max
- Total video: aim for 20-40 seconds
- Don't rush, but keep it engaging

REQUIRED STRUCTURE:
class ConceptExplanation(Scene):
    def construct(self):
        # Build understanding step by step
        # Use visual hierarchy and progressive disclosure

COLORS: RED, BLUE, GREEN, YELLOW, ORANGE, PURPLE, WHITE, BLACK, PINK, TEAL, GOLD, MAROON, GREY

DIRECTIONS: UP, DOWN, LEFT, RIGHT, UL, UR, DL, DR, ORIGIN

COMMON PATTERNS FOR PEDAGOGY:
- Arrays/Lists: Use Rectangle objects arranged horizontally
- Pointers: Use Arrow objects
- Highlighting: Use set_color() or Circumscribe()
- State changes: Use Transform() or ReplacementTransform()
- Comparison: Place objects side-by-side with VGroup().arrange(RIGHT)
- Step-by-step: FadeOut old state, FadeIn new state
- Code + Visualization: Code on left (scale 0.7), visualization on right

FOR ALGORITHMS:
- Show input clearly
- Animate each step of execution
- Use color to track current element/operation
- Show intermediate states
- Highlight the "aha" moment

FOR MATH:
- Start with visual intuition
- Connect to algebraic form
- Show transformations geometrically
- Use color coding consistently (e.g., same variable = same color)

FOR DATA STRUCTURES:
- Show structure clearly with shapes
- Animate operations (insert, delete, traverse)
- Use arrows for pointers/references
- Color code nodes by state

FORBIDDEN:
- Methods not in whitelist (e.g., get_tangent_line, get_derivative)
- Parameters not explicitly listed
- Inventing attributes or methods
- Comments or explanatory text in code
- Assuming methods exist - verify against whitelist first

WHEN UNSURE: Use basic shapes (Rectangle, Circle, Line, Text, Arrow) and manual positioning.
Calculate positions mathematically rather than using non-whitelisted helpers.
`;

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};
console.log(process.env.ANTHROPIC_API_KEY?.slice(-4));

const CLAUDE_MODEL = "claude-opus-4-5-20251101";
const ANTHROPIC_VERSION = "2023-06-01";

const MANIM_PATH = path.join(process.cwd(), "src", "manimation.py");
const MANIM_MEDIA_ROOT = path.join(process.cwd(), "media");
const RENDERED_VIDEO_PATH = path.join(MANIM_MEDIA_ROOT, "rendered.mp4");

async function getSceneName() {
    const source = await readFile(MANIM_PATH, "utf8");
    const match = source.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*Scene\s*\)/);
    return match ? match[1] : "AutoScene";
}

async function findNewestMp4(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const candidates = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            const nested = await findNewestMp4(fullPath);
            if (nested) candidates.push(nested);
            continue;
        }

        if (entry.isFile() && entry.name.toLowerCase().endsWith(".mp4")) {
            const fileStat = await stat(fullPath);
            candidates.push({ fullPath, mtimeMs: fileStat.mtimeMs });
        }
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return candidates[0];
}

async function renderManim() {
    await mkdir(MANIM_MEDIA_ROOT, { recursive: true });
    const sceneName = await getSceneName();

    await new Promise((resolve, reject) => {
        const render = spawn("manim", ["-ql", MANIM_PATH, sceneName], {
            cwd: process.cwd(),
            stdio: "pipe",
            shell: true,
        });

        let stderr = "";
        render.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
        render.on("error", reject);
        render.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(stderr || "Manim render failed"));
        });
    });

    const newest = await findNewestMp4(path.join(MANIM_MEDIA_ROOT, "videos"));
    if (!newest) throw new Error("Render completed but no mp4 was found");

    const sourceBuffer = await readFile(newest.fullPath);
    await writeFile(RENDERED_VIDEO_PATH, sourceBuffer);
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, corsHeaders);
        return res.end();
    }

    if (req.url.startsWith("/media/rendered.mp4") && req.method === "GET") {
        try {
            const videoStat = await stat(RENDERED_VIDEO_PATH);
            res.writeHead(200, {
                "Content-Type": "video/mp4",
                "Content-Length": videoStat.size,
                "Cache-Control": "no-store",
                ...corsHeaders,
            });
            createReadStream(RENDERED_VIDEO_PATH).pipe(res);
            return;
        } catch {
            res.writeHead(404, corsHeaders);
            return res.end("Rendered video not found");
        }
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

    if (req.url === "/api/render-manim") {
        try {
            await renderManim();
            res.writeHead(200, { "Content-Type": "text/plain", ...corsHeaders });
            return res.end(`http://localhost:1337/media/rendered.mp4?v=${Date.now()}`);
        } catch (err) {
            res.writeHead(500, corsHeaders);
            return res.end(err?.message || "Failed to render manim");
        }
    }

    if (req.url === "/api/animation-context") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", async () => {
            try {
                const { userInput } = JSON.parse(body || "{}");
                if (!userInput) { res.end("No valid input"); return; }

                const priorCode = await readFile(MANIM_PATH, "utf8");
                const combinedInput = `PREVIOUS_CODE:\n${priorCode}\n\nUSER_REQUEST:\n${userInput}\n\nReturn full updated Manim code only.`;

                const upstream = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "x-api-key": process.env.ANTHROPIC_API_KEY,
                        "anthropic-version": ANTHROPIC_VERSION,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: CLAUDE_MODEL,
                        max_tokens: 2048,
                        system: SYSTEM_PROMPT,
                        messages: [
                            { role: "user", content: combinedInput },
                        ],
                    }),
                });

                const upstreamText = await upstream.text();
                if (!upstream.ok) {
                    res.writeHead(upstream.status, { "Content-Type": "application/json", ...corsHeaders });
                    return res.end(upstreamText);
                }

                const json = JSON.parse(upstreamText);
                const text = json?.content?.find((c) => c.type === "text")?.text ?? "";

                res.writeHead(200, { "Content-Type": "text/plain", ...corsHeaders });
                console.log(`\nOUTPUT:\n${text}\n---------------------------`);
                res.end(text);
            } catch (err) {
                res.writeHead(500, corsHeaders);
                return res.end(err?.message || "Failed to generate animation with context");
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

        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": process.env.ANTHROPIC_API_KEY,
                "anthropic-version": ANTHROPIC_VERSION,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 2048,
                system: SYSTEM_PROMPT,
                messages: [
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
        const text = json?.content?.find((c) => c.type === "text")?.text ?? "";

        res.writeHead(200, { "Content-Type": "text/plain", ...corsHeaders });
        console.log(`\nOUTPUT:\n${text}\n---------------------------`);
        res.end(text);
    });
});

server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`))
