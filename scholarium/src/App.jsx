import React, { useState } from 'react'
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
  const [value, setValue] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);

  const handleGo = async (userInput) => {
    setPanelVisible(true);
    let dotCount = 0;
    const loadingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setValue("Loading" + ".".repeat(dotCount));
    }, 500);

    try {
      const response = await client.responses.create({
        model: 'gpt-5-nano',
        input: prompt+userInput
      });

      prompt += `User:${userInput}\nYou:${response}\n`;

      setValue(response.output_text);
    } catch { setValue("An error occured in fetching a response..")
    } finally {
      clearInterval(loadingInterval);
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
    <Panel text={value} visible={panelVisible} onClose={handlePanelClose} />
    <EntryBar onSubmit={handleGo} lowered={panelVisible} />
    </>
  );
}

export default App
