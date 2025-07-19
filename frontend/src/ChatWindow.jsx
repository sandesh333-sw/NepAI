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
  } = useContext(MyContext);
  const [loader, setLoader] = useState(false);

  const getReply = async () => {
    setLoader(true);
    setNewChat(false);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const res = await response.json();
      console.log(reply);
      setReply(res.reply);
    } catch (error) {
      console.log(error);
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
        <span>NepAI</span>
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
