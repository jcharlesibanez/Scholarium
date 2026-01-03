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
      The other key is "animations", it contains anime.js code in a JSON format, with key and value pairs for each property.
      Do not include anything else in your output.
      `
    });
    console.log(response.output_text);
    const parsed = JSON.parse(response.output_text);
    setData(parsed);
    setSvgContent(parsed.svg);
  }

  useEffect(() => {
    if (svgContent && panelVisible && data) {
      data.animations.forEach(anim => {
        animate({
          ...anim
        });
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
    } catch (error) {
      setValue("Couldn't parse AI output as JSON.");
    }
  };

  const handlePanelClose = (e) => {
    e?.preventDefault();
    setPanelVisible(false);
    setValue("");
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
        viewBox="0 0 200 200"
        width="0"
        height="0"
        role="img"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      >
      </svg>
    </div>
    <EntryBar onSubmit={handleGo} lowered={panelVisible} />
    </>
  );
}

export default App
