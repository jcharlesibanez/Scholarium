import React, { useState } from 'react'
function EntryBar({ onSubmit, lowered }) {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setInputValue("");
    }

    return(
        <form className={`entry-bar${lowered ? " lowered" : ""}`} onSubmit={handleSubmit}>
            <input 
                id="input-box"
                placeholder="Just enter a topic"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            ></input>
            <button id="go-button" type="submit">Go</button>
        </form>
    );
}

export default EntryBar
