import "./ChatWindow.css";
import Chat from "./Chat";
import { MyContext } from "./MyContext";
import { useContext, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    setShowSidebar,
  } = useContext(MyContext);
  const [loader, setLoader] = useState(false);

  const getReply = async () => {
    setLoader(true);
    setNewChat(false);
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8080");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch(`${apiUrl}/api/chat`, options);
      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized - please login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      console.log(reply);
      setReply(res.reply);
    } catch (error) {
      console.error("Chat error:", error);
    }
    setLoader(false);
  };

  //appending new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }
    setPrompt("");
  }, [reply]);

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div className="navLeft">
            <button className="menuBtn" onClick={() => setShowSidebar(true)}>
                <i className="fa-solid fa-bars"></i>
            </button>
            <span>NepAI</span>
        </div>
        <div className="userIconDiv">
          <span>
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      <Chat></Chat>
      <BeatLoader color="white" loading={loader}></BeatLoader>
      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          ></input>
          <button id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
        <p className="info">NepAI can make mistakes</p>
      </div>
    </div>
  );
}

export default ChatWindow;
