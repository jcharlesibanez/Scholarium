function Panel({ qtext, visible, onClose }) {
  return (
    <div className={`panel ${visible ? "visible" : ""}`}>
      <p id='question-displayer'>{qtext}</p>
      <button id="panel-close-button" aria-label="Close" onClick={onClose}>×</button>
      <svg id='animation-svg' className={visible ? "visible" : ""} width="0" height="0"></svg>
    </div>
  );
}

export default Panel