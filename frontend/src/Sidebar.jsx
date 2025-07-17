import "./Sidebar.css";


function SideBar() {
    return ( 
        <section className="sidebar">
            {/*new chat button */}
            <button>
                <img src="src/assets/mainlogo.png" className="logo" alt="appimage"></img>
                <span><i className="fa-solid fa-pencil"></i></span>
            </button>
            {/*history */}
            <ul className="history">
                <li>Thread1</li>
                <li>Thread2</li>
                <li>Thread3</li>
            </ul>

            {/*sign in */}
            <div className="sign">
                <p>By NepAI &hearts;</p>
            </div>
        </section>
     );
}

export default SideBar;