function Panel({ text, visible, onClose }) {
  return (
    <div className={`panel ${visible ? "visible" : ""}`}>
      <button id="panel-close-button" aria-label="Close" onClick={onClose}>×</button>
      <p id="panel-output">{text}</p>
    </div>
  );
}

export default Panel