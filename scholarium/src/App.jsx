import React, { useState } from 'react';
import Header from "./Header.jsx";
import Background from "./Background.jsx";

function App() {
  const [value, setValue] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [elapsedTime, setElapsedTime] = useState("...");
  const [videoFile, setVideoFile] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyVisible, setReplyVisible] = useState(false);
  const [replyPending, setReplyPending] = useState(false);

  async function writeManim(code) {
    try {
      const formatManimCode = (sourceText) => {
        let source = typeof sourceText === "string" ? sourceText.trim() : "";
        if (!source) throw new Error("No Manim code received.");

        if (source.startsWith("```")) {
          source = source.replace(/^```[a-zA-Z]*\s*/, "").replace(/```$/, "").trim();
        }

        if (!source.includes("\n") && source.includes(";")) {
          source = source.split(";").map((line) => line.trim()).filter(Boolean).join("\n");
        }

        const lines = source.split(/\r?\n/).map((line) => line.trim());
        const importLines = [];
        const bodyLines = [];

        for (const line of lines) {
          if (line.startsWith("from manim import") || line.startsWith("import manim")) {
            importLines.push(line);
          } else if (line.length) {
            bodyLines.push(line);
          }
        }

        const hasImport = importLines.length > 0 || source.includes("from manim import") || source.includes("import manim");
        const hasSceneClass = /class\s+\w+\s*\(\s*Scene\s*\)/.test(source);
        const hasConstruct = /def\s+construct\s*\(\s*self\s*\)/.test(source);

        const header = hasImport ? "" : "from manim import *\n\n";
        if (hasSceneClass && hasConstruct) {
          return `${header}${source}\n`;
        }

        const imports = importLines.length ? `${importLines.join("\n")}\n\n` : header;
        const body = bodyLines.length ? bodyLines.map((line) => `        ${line}`).join("\n") : "        pass";

        return `${imports}class AutoScene(Scene):\n    def construct(self):\n${body}\n`;
      };

      const formatted = formatManimCode(code);
      const res = await fetch("http://localhost:1337/api/write-manim", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: formatted,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to write manimation.py");
      }

      const renderRes = await fetch("http://localhost:1337/api/render-manim", {
        method: "POST",
      });
      if (!renderRes.ok) {
        const errorText = await renderRes.text();
        throw new Error(errorText || "Failed to render Manim animation");
      }

      const videoUrl = await renderRes.text();
      console.log("manimation.py updated and rendered");
      setVideoFile(videoUrl);
      console.log("videoFileState updated!");
    } catch (e) {
      console.log(e);
    }
  }

  async function createAnimationSpec(userInput) {
    try {
      const res = await fetch("http://localhost:1337/api/animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      const text = await res.text();
      console.log(text);
      if (text !== "No valid input" && typeof text === "string") {
        await writeManim(text);
      } else {
        setValue("Please enter a valid input!");
      };
    } catch (e) {
      console.log(e);
    }
  }

  async function createAnimationSpecWithContext(userInput) {
    try {
      const res = await fetch("http://localhost:1337/api/animation-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      const text = await res.text();
      console.log(text);
      if (text !== "No valid input" && typeof text === "string") {
        await writeManim(text);
      } else {
        setValue("Please enter a valid input!");
      };
    } catch (e) {
      console.log(e);
    }
  }

  const handleGo = async (e) => {
    if (inputValue) {
      e.preventDefault();
      console.log("REQUEST SENT")
      const iTime = Date.now();
      setElapsedTime("...")
      setPanelVisible(true);
      if (videoFile) setVideoFile(null);
      if (replyText) setReplyText("");
      let dotCount = 0;
      const loadingInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        setValue("Loading" + ".".repeat(dotCount));
      }, 500);

      try {
        await createAnimationSpec(inputValue);
        clearInterval(loadingInterval);
        setValue(null);
        const fTime = Date.now();
        setElapsedTime(`Elapsed time: ${(fTime - iTime)/1000} s`);
        console.log(`${(fTime - iTime)/1000} s`);
      } catch (error) {
        clearInterval(loadingInterval);
        setValue("An error occured. Check the console. :(");
      }
    } else {
      setValue("Enter a request!");
    }
  };

  const handlePanelClose = (e) => {
    e?.preventDefault();
    setPanelVisible(false);
    setVideoFile(null);
    setReplyText("");
    setReplyVisible(false);
    setValue(null);
    setElapsedTime(null);
    console.clear();
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText || replyPending) return;
    setReplyPending(true);
    setValue("Responding");
    try {
      await createAnimationSpecWithContext(replyText);
      setReplyText("");
      setValue(null);
    } catch (error) {
      setValue("An error occured. Check the console. :(");
    } finally {
      setReplyPending(false);
    }
  };

  return (
    <>
    <Header visible={panelVisible}/>
    <Background/>
    <div className={`panel ${panelVisible ? "visible" : ""}`} style={{ display:"flex", justifyContent:"center", alignItems:"center", width: panelVisible ? "min(520px, 90vw)" : "0px" }}>
      <p id='question-displayer'>{value}</p>
      <button id="panel-close-button" aria-label="Close" onClick={handlePanelClose}>×</button>
      <div
        className="video-shell"
        onMouseEnter={() => setReplyVisible(true)}
        onMouseLeave={() => setReplyVisible(false)}
      >
        <video
          id='video'
          className={ panelVisible ? "visible" : "" }
          src={ videoFile ?? "" }
          controls
          style={ videoFile ? { width:"100%", height:"100%"} : { width:"0%", height:"0%"}}
        >
        </video>
        <form
          className={`video-reply ${replyVisible && videoFile ? "visible" : ""}`}
          onSubmit={handleReplySubmit}
        >
          <input
            className="video-reply-input"
            placeholder="Refine the animation..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={!videoFile || replyPending}
          />
          <button
            className="video-reply-send"
            type="submit"
            disabled={!videoFile || replyPending}
          >
            Go
          </button>
        </form>
      </div>
    </div>
    <div className="entry-stack">
      <div className="timer" style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        <p style={{ fontSize:"14px" }}>{elapsedTime}</p>
      </div>
      <form className={`entry-bar${panelVisible ? " lowered" : ""}`} onSubmit={handleGo}>
        <input 
            id="input-box"
            placeholder="Just enter a topic"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete='off'
        ></input>
        <button id="go-button" type="submit">Go</button>
      </form>
    </div>
    </>
  );
}

export default App
