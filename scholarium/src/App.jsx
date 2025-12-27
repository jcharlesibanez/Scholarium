import React, { useState } from 'react'

import Header from "./Header.jsx"
import Background from "./Background.jsx"
import Panel from "./Panel.jsx"
import EntryBar from "./EntryBar.jsx"

function App() {
  const [value, setValue] = useState("");
  const [panelVisible, setPanelVisible] = useState(false);

  const handleGo = (e) => {
    e?.preventDefault();
    setValue("Loading...");
    setPanelVisible(true);
  };

  const handlePanelClose = (e) => {
    e?.preventDefault();
    setPanelVisible(false);
  }

  return (
    <>
    <Header visible={panelVisible}/>
    <Background/>
    <Panel text={value} visible={panelVisible} onClose={handlePanelClose} />
    <EntryBar onSubmit={handleGo} />
    </>
  );
}

export default App
