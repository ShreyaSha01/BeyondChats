import { useEffect, useState } from "react";
import axios from "axios";

function Chats() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost/api/threads")
      .then((res) => {
        setThreads(res.data);
      });
  }, []);

  return (
    <div>
      <h1>Email Threads</h1>

      {threads.map((thread) => (
        <div key={thread.thread_id}>
          <p>Thread ID: {thread.thread_id}</p>
        </div>
      ))}
    </div>
  );
}

export default Chats;