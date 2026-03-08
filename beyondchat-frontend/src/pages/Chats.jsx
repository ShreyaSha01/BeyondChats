import { useEffect, useState } from "react";
import axios from "axios";

function Chats() {
  const [threads, setThreads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedThreadData, setSelectedThreadData] = useState(null);
  const [emails, setEmails] = useState([]);
  const [reply, setReply] = useState("");
  const [threadSummaries, setThreadSummaries] = useState({});

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

    // Compute and cache thread summary
    if (res.data && res.data.length > 0) {
      const lastEmail = res.data[res.data.length - 1];
      const preview = stripHtml(lastEmail.body_html).substring(0, 80);
      const lastDate = new Date(lastEmail.sent_at).toLocaleDateString();

      setThreadSummaries((prev) => ({
        ...prev,
        [threadId]: {
          emailCount: res.data.length,
          preview,
          lastDate,
          lastFrom: lastEmail.from,
        },
      }));
    }
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
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

  const filteredThreads = threads.filter((thread) =>
    thread.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <h1 className="page-title">Chats</h1>

      <div className="chats-container">
        <div className="threads-list">
          <h2>Threads</h2>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="threads-scroll-area">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => {
                const summary = threadSummaries[thread.thread_id];
                return (
                  <div
                    key={thread.thread_id}
                    className={`thread-item ${selectedThread === thread.thread_id ? "active" : ""}`}
                    onClick={() => openThread(thread.thread_id)}
                  >
                    <div className="thread-subject">
                      {thread.subject || "No Subject"}
                    </div>
                    {summary ? (
                      <div className="thread-summary">
                        <div className="summary-preview">
                          {summary.preview}...
                        </div>
                        <div className="summary-meta">
                          <span className="summary-count">
                            {summary.emailCount} emails
                          </span>
                          <span className="summary-date">
                            {summary.lastDate}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="thread-placeholder">
                        Click to load preview
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                {searchQuery
                  ? "No threads match your search"
                  : "No threads found"}
              </div>
            )}
          </div>
        </div>

        <div className="conversation-area">
          <div className="conversation-header">
            <div className="header-content">
              <h2>
                {selectedThreadData
                  ? selectedThreadData.subject || "No Subject"
                  : "Email Conversation"}
              </h2>
              {threadSummaries[selectedThread] && (
                <div className="header-summary">
                  <span className="summary-stat">
                    📧 {threadSummaries[selectedThread].emailCount} emails
                  </span>
                  <span className="summary-stat">
                    👤 {threadSummaries[selectedThread].lastFrom}
                  </span>
                  <span className="summary-stat">
                    📅 {threadSummaries[selectedThread].lastDate}
                  </span>
                </div>
              )}
            </div>
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
