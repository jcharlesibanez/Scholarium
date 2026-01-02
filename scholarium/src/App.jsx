import React, { useEffect, useState } from 'react'
import reactLogo from "./assets/react.svg"
import { animate } from "animejs"

import prompt from "./prompt.js"
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

import Header from "./Header.jsx"
import Background from "./Background.jsx"
import Panel from "./Panel.jsx"
import EntryBar from "./EntryBar.jsx"

function App() {
  const [ rotations, setRotations ] = useState(0);

  const [value, setValue] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);
  const [animationSpec, setAnimationSpec] = useState(null);
  let rt = "";

  async function createAnimationSpec() {
    const response = await client.responses.create({
      model: "gpt-5-nano",
      input: `Explain to me how atoms work`
    });
    rt = response.output_text;
    setAnimationSpec(JSON.parse(response.output_text));
  }

  const handleGo = async (userInput) => {
    setPanelVisible(true);
    let dotCount = 0;
    const loadingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setValue("Loading" + ".".repeat(dotCount));
    }, 500);

    try {
      const animationSpec = await createAnimationSpec();
      setValue(rt);
    } catch (error) {
      setValue("Couldn't parse AI output as JSON.");
    } finally {
      clearInterval(loadingInterval);
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
    <Panel text={value} visible={panelVisible} onClose={handlePanelClose} animationSpec={animationSpec}/>
    <EntryBar onSubmit={handleGo} lowered={panelVisible} />
    </>
  );
}

export default App
