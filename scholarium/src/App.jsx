import React, { useEffect, useState } from 'react';
import reactLogo from "./assets/react.svg";
import { animate } from "animejs";

import prompt from "./prompt.js";
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

import Header from "./Header.jsx";
import Background from "./Background.jsx";
import EntryBar from "./EntryBar.jsx";

function App() {
  const [ rotations, setRotations ] = useState(0);

  const [value, setValue] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  let rt = "";

  async function createAnimationSpec() {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: `Generate pure anime.js code that can be copy-pasted directly into the innerHTML of an svg that explains the sharing of atoms. Do not write anything else.`
    });
    console.log(response.output_text);
    setSvgContent(response.output_text);
  }

  useEffect(() => {
    
  });

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
    } finally {
      clearInterval(loadingInterval);
      setValue("");
    }
    

    setRotations(prev => prev + 1);
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
        dangerouslySetInnerHTML={svgContent}
      >
      </svg>
    </div>
    <EntryBar onSubmit={handleGo} lowered={panelVisible} />
    </>
  );
}

export default App
