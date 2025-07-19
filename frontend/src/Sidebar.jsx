import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid";

function SideBar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats, // ✅ typo fixed
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread");
      const res = await response.json();
      console.log(res);

      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));

      console.log(filteredData);

      setAllThreads(filteredData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, []);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]); // ✅ typo fixed
  };

  const changeThread = async (newThreadId) => {
  setCurrThreadId(newThreadId);
  try {
    const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
    const res = await response.json();
    console.log(res);
    setPrevChats(res);
    setNewChat(false);
    setReply(null);
  } catch (error) {
    console.log(error);
  }
};


  return (
    <section className="sidebar">
      {/* new chat button */}
      <button onClick={createNewChat}>
        <img src="src/assets/mainlogo.png" className="logo" alt="appimage" />
        <span>
          <i className="fa-solid fa-pencil"></i>
        </span>
      </button>

      {/* history */}
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li key={idx}
          onClick={(e) => changeThread(thread.threadId)}
          >
            {thread.title}</li>
        ))}
      </ul>

      {/* sign in */}
      <div className="sign">
        <p>By NepAI &hearts;</p>
      </div>
    </section>
  );
}

export default SideBar;
