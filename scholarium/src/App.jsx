// IMPROVEMENTS TO MAKE JANUARY 7TH:
// - FIX ANIMATION ABILITY
// - ADD LONGER ANIMATIONS
// - LEARN HOW TO BEST PROMPT AI

import React, { useEffect, useState } from 'react';
import { animate } from "animejs";
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

import Header from "./Header.jsx";
import Background from "./Background.jsx";

function App() {
  const [value, setValue] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const [data, setData] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [elapsedTime, setElapsedTime] = useState("...");

  async function createAnimationSpec(userInput) {
    const response = await client.responses.create({
      model: "gpt-4.1-nano",
      input:
      `
      You are to create an indefinitely repeating animation on a webpage that responds to the following prompt: "${userInput}"
      Generate JSON code with two keys.
      One key is "svg", it contains pure innerHTML for the svg.
      The other key is "animations", it contains anime.js code for an array of animations grouped by their targets in a JSON format, with key and value pairs for each property.
      Do not include any string formatting techniques, just pure JSON.
      Include text labels.
      Keep in mind that your illustration will appear over a black background. Do not hardcode a black background into your animation, but format it for a black background.
      DO NOT INCLUDE BACKSLASHES IN YOUR OUTPUT.
      DO NOT INCLUDE SVG TAGS, JUST THE INNERHTML.
      Do not include anything else in your output.
      `
    });
    console.log(response.output_text);
    let parsed = JSON.parse(response.output_text);
    if (!data) {
      setData(parsed);
      setSvgContent(parsed.svg);
    }
  }

  useEffect(() => {
    if (svgContent && panelVisible && data) {
      data.animations.forEach(anim => {
        const { targets, ...params } = anim;
        if (!targets) return;
        animate(targets, params);
      });
    }
  }, [svgContent, panelVisible, data]);

  const handleGo = async (e) => {
    if (inputValue) {
      e.preventDefault();
      const iTime = Date.now();
      setPanelVisible(true);
      if (svgContent) setSvgContent(null);
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
    setData(null);
    setSvgContent(null);
    setValue(null);
    setElapsedTime(null);
    console.clear();
  }

  return (
    <>
    <Header visible={panelVisible}/>
    <Background/>
    <div className={`panel ${panelVisible ? "visible" : ""}`} style={{ display:"flex", justifyContent:"center", alignItems:"center", width: panelVisible ? "min(520px, 90vw)" : "0px" }}>
      <p id='question-displayer'>{value}</p>
      <button id="panel-close-button" aria-label="Close" onClick={handlePanelClose}>×</button>
      <svg
        id='animation-svg'
        className={ panelVisible ? "visible" : "" }
        viewBox={ svgContent ? "0 0 520 520" : "0 0 0 0"}
        role="img"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={ svgContent ? { width:"100%", height:"100%"} : { width:"0%", height:"0%"}}
      >
      </svg>
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
        ></input>
        <button id="go-button" type="submit">Go</button>
      </form>
    </div>
    </>
  );
}

export default App
