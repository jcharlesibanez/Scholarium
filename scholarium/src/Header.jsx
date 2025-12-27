function Header({ visible }) {
    return (
        <header>
            <meta charset="UTF-8"></meta>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
            <title>Scholarium</title>
            <div className={`scholarium-header ${visible ? "hidden" : ""}`}>
                <h1>SCHOLARIUM</h1>
            </div>
        </header>
    );
}

export default Header