import { useEffect, useState } from "react";
import axios from "axios";

function Chats() {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedThreadData, setSelectedThreadData] = useState(null);
  const [emails, setEmails] = useState([]);
  const [reply, setReply] = useState("");

  useEffect(() => {
    axios.get("http://localhost/api/threads").then((res) => {
      setThreads(res.data);
    });
  }, []);

  const openThread = async (threadId) => {
    setSelectedThread(threadId);
    const threadData = threads.find((t) => t.thread_id === threadId);
    setSelectedThreadData(threadData);

    const res = await axios.get(`http://localhost/api/threads/${threadId}`);

    setEmails(res.data);
  };

  const sendReply = async () => {
    if (!reply) return;

    const lastEmail = emails[emails.length - 1];

    await axios.post("http://localhost/api/reply", {
      thread_id: selectedThread,
      message: reply,
      to: lastEmail.from,
      subject: "Reply",
    });

    setReply("");
    alert("Reply sent!");
  };

  return (
    <div>
      <h1 className="page-title">Chats</h1>

      <div className="chats-container">
        <div className="threads-list">
          <h2>Threads</h2>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            {threads.map((thread) => (
              <div
                key={thread.thread_id}
                className={`thread-item ${selectedThread === thread.thread_id ? "active" : ""}`}
                onClick={() => openThread(thread.thread_id)}
              >
                <p>{thread.subject || "No Subject"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="conversation-area">
          <div className="conversation-header">
            <h2>
              {selectedThreadData
                ? selectedThreadData.subject || "No Subject"
                : "Email Conversation"}
            </h2>
          </div>

          <div className="conversation-messages">
            {selectedThread === null && (
              <p>Select a thread to view the conversation</p>
            )}

            {emails.map((email) => (
              <div key={email.id} className="message">
                <p>
                  <strong>From:</strong> {email.from}
                </p>
                <p>
                  <strong>To:</strong> {email.to}
                </p>
                <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
                {email.attachments && email.attachments.length > 0 && (
                  <div className="attachments">
                    <strong>Attachments:</strong>
                    <div className="attachment-list">
                      {email.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={`http://localhost/api/attachments/${email.message_id}/${attachment.attachment_id}`}
                          className="attachment-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 {attachment.filename}
                          {attachment.size && (
                            <span className="attachment-size">
                              ({Math.round(attachment.size / 1024)} KB)
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedThread && (
            <div className="reply-section">
              <textarea
                placeholder="Write your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="reply-textarea"
              />
              <button className="btn" onClick={sendReply}>
                Send Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chats;