import React, { useState } from 'react'

import Header from "./Header.jsx"
import Background from "./Background.jsx"
import Panel from "./Panel.jsx"
import EntryBar from "./EntryBar.jsx"

function App() {
  const [value, setValue] = useState("Initial Text");

  const handleClick = () => {
    setValue(prev => prev === "Initial Text" ? "Button pressed!" : "Initial Text")
  }
  return (
    <>
    <Background/>
    <Panel text={value} />
    <EntryBar onClick={handleClick} />
    <Header/>
    </>
  );
}

export default App
