function EntryBar({ onSubmit }) {

    return(
        <form className="entry-bar" onSubmit={onSubmit}>
            <input id="input-box" placeholder="Just enter a topic"></input>
            <button id="go-button" type="submit">Go</button>
        </form>
    );
}

export default EntryBar
