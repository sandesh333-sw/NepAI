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
    setPrevChats,
    showSidebar, 
    setShowSidebar
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const response = await fetch(`/api/thread`);
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
    setPrevChats([]); 
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    try {
      const response = await fetch(`/api/thread/${newThreadId}`);
      const res = await response.json();
      console.log(res);
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `/api/thread/${threadId}`,
        { method: "DELETE" }
      );
      const res = await response.json();
      console.log(res);

      // Remove the deleted thread from state
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      // Optionally clear current thread if you deleted it
      if (currThreadId === threadId) {
        setCurrThreadId(null);
        setPrevChats([]);
        setNewChat(true);
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <section className={`sidebar ${showSidebar ? "open" : ""}`}>
      {/* mobile close button */}
      <div className="mobile-close" onClick={() => setShowSidebar(false)}>
          <i className="fa-solid fa-xmark"></i>
      </div>

      {/* new chat button */}
      <button onClick={createNewChat}>
        <img src="/mainlogo.png" className="logo" alt="NepAI Logo" />
        <span>
          <i className="fa-solid fa-pencil"></i>
        </span>
      </button>

      {/* history */}
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li key={idx} onClick={() => {
              changeThread(thread.threadId);
              setShowSidebar(false); // Close sidebar on mobile after selection
          }}>
            {thread.title}
            <i className="fa-solid fa-trash"
            onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
            }}
            >
                </i>{" "}
          </li>
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
