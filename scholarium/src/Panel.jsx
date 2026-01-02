function Panel({ text, visible, onClose, animationSpec}) {

  useEffect(() => {
    if (!visible, !animationSpec) return;
    

  })
  return (
    <div className={`panel ${visible ? "visible" : ""}`}>
      <p id='question-displayer'>{text}</p>
      <button id="panel-close-button" aria-label="Close" onClick={onClose}>×</button>
      <svg
        id='animation-svg'
        className={visible ? "visible" : ""}
        viewBox="0 0 200 200"
        width="0"
        height="0"
        role="img"
        aria-label="React logo"
      >
      </svg>
    </div>
  );
}

export default Panel
