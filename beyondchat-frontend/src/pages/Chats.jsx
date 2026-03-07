import { useEffect, useState } from "react";
import axios from "axios";

function Chats() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    axios.get("http://localhost/api/threads").then((res) => {
      setThreads(res.data);
    });
  }, []);

  const openThread = async (threadId) => {
    setSelectedThread(threadId);

    const res = await axios.get(
      `http://localhost/api/threads/${threadId}`
    );

    setEmails(res.data);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <div style={{ width: "30%", borderRight: "1px solid #ddd", padding: "10px" }}>
        <h2>Threads</h2>

        {threads.map((thread) => (
          <div
            key={thread.thread_id}
            onClick={() => openThread(thread.thread_id)}
            style={{
              padding: "10px",
              borderBottom: "1px solid #eee",
              cursor: "pointer",
            }}
          >
            <p>Thread: {thread.thread_id}</p>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Email Conversation</h2>

        {selectedThread === null && <p>Select a thread</p>}

        {emails.map((email) => (
          <div
            key={email.id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p><strong>From:</strong> {email.from}</p>
            <p><strong>To:</strong> {email.to}</p>

            <div
              dangerouslySetInnerHTML={{
                __html: email.body_html,
              }}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

export default Chats;