import React, { useEffect, useState } from 'react';
import { animate } from "animejs";
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

import Header from "./Header.jsx";
import Background from "./Background.jsx";
import EntryBar from "./EntryBar.jsx";

function App() {
  const [value, setValue] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const [data, setData] = useState(null);

  async function createAnimationSpec() {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input:
      `
      You are to create an animation on a webpage that shows atoms and rotating electrons.
      Generate JSON code with two keys.
      One key is "svg", it contains pure innerHTML for the svg.
      The other key is "animations", it contains anime.js code for an array of animations grouped by their targets in a JSON format, with key and value pairs for each property.
      Do not include any string formatting techniques, just pure JSON.
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

  const handleGo = async (userInput) => {
    setPanelVisible(true);
    let dotCount = 0;
    const loadingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setValue("Loading" + ".".repeat(dotCount));
    }, 500);

    try {
      await createAnimationSpec();
      clearInterval(loadingInterval);
    } catch (error) {
      clearInterval(loadingInterval);
      setValue("An error occured. Check the console. :(");
    }
  };

  const handlePanelClose = (e) => {
    e?.preventDefault();
    setPanelVisible(false);
    setData(null);
    setSvgContent(null);
    setValue("");
    console.clear();
  }

  return (
    <>
    <Header visible={panelVisible}/>
    <Background/>
    <div className={`panel ${panelVisible ? "visible" : ""}`}>
      <p id='question-displayer'>{value}</p>
      <button id="panel-close-button" aria-label="Close" onClick={handlePanelClose}>×</button>
      <svg
        id='animation-svg'
        className={panelVisible ? "visible" : ""}
        viewBox="0 0 520 520"
        width="520"
        height="520"
        role="img"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: "200px", height: "200px" }}
      >
      </svg>
    </div>
    <EntryBar onSubmit={handleGo} lowered={panelVisible} />
    </>
  );
}

export default App
