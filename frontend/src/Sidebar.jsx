import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext";
import { useAuth } from "./contexts/AuthContext";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

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
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getAllThreads = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const response = await fetch(`${apiUrl}/api/thread`, {
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login");
          setAllThreads([]);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      console.log(res);

      // Ensure res is an array before mapping
      const filteredData = Array.isArray(res) ? res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      })) : [];

      console.log(filteredData);

      setAllThreads(filteredData);
    } catch (error) {
      console.error("Error fetching threads:", error);
      setAllThreads([]);
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
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const response = await fetch(`${apiUrl}/api/thread/${newThreadId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      console.log(res);
      // Ensure res is an array
      setPrevChats(Array.isArray(res) ? res : []);
      setNewChat(false);
      setReply(null);
    } catch (error) {
      console.error("Error fetching thread:", error);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
      const response = await fetch(
        `${apiUrl}/api/thread/${threadId}`,
        { 
          method: "DELETE",
          credentials: "include"
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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

      {/* user info */}
      <div className="user-section">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    </section>
  );
}

export default SideBar;
