function EntryBar({ onClick }) {

    return(
        <div className="entry-bar">
            <input id="input-box" placeholder="Just enter a topic"></input>
            <button id="go-button" onClick={onClick}>Go</button>
        </div>
    );
}

export default EntryBar
