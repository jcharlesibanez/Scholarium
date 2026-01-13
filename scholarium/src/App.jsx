import React, { useEffect, useState } from 'react';
import { animate } from "animejs";
import Header from "./Header.jsx";
import Background from "./Background.jsx";

function App() {
  const [value, setValue] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const [animationContent, setAnimationContent] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [elapsedTime, setElapsedTime] = useState("...");

  async function createAnimationSpec(userInput) {
    try {
      const res = await fetch("http://localhost:1337/api/animation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      const data = await res.json();
      console.log(data);
      if (data === "No valid input" || typeof inputValue !== "string") {
        setValue("Please enter a valid input!");
      } else {
        setAnimationContent(data.animations);
        setSvgContent(data.svg);
      };
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (svgContent && panelVisible && animationContent) {
      animationContent.forEach((anim) => {
        const { targets, ...params } = anim;
        animate(targets, params);
      });
    }
  }, [svgContent, panelVisible, animationContent]);

  const handleGo = async (e) => {
    if (inputValue) {
      e.preventDefault();
      console.log("REQUEST SENT")
      const iTime = Date.now();
      setElapsedTime("...")
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
            autoComplete='off'
        ></input>
        <button id="go-button" type="submit">Go</button>
      </form>
    </div>
    </>
  );
}

export default App
