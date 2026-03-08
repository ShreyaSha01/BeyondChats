import { useState, useEffect } from "react";
import axios from "axios";

function Integrations() {
  const [connected, setConnected] = useState(false);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost/api/gmail/status", { withCredentials: true })
      .then((response) => {
        if (response.data.connected) {
          setConnected(true);
        }
      })
      .catch((error) => {
        console.error("Error checking Gmail integration status:", error);
      });
  }, []);

  const connectGmail = () => {
    window.location.href = "http://localhost/api/auth/google";
  };

  const syncEmails = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost/api/sync-emails",
        { days },
        { withCredentials: true },
      );

      setMessage(response.data.message);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error syncing emails";
      setMessage(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Integrations</h1>

      <div className="integrations-container">
        <div className="integration-card">
          <h3>Gmail Integration</h3>

          {!connected && (
            <div>
              <p className="mb-4">Connect your Gmail account to sync emails.</p>
              <button className="btn" onClick={connectGmail}>
                Connect to Gmail
              </button>
            </div>
          )}

          {connected && (
            <div>
              <p className="mb-4">Gmail Connected ✓</p>

              <div className="mb-4">
                <label htmlFor="days-select" className="block mb-2 font-medium">
                  Sync emails from the last:
                </label>
                <select
                  id="days-select"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="select-input"
                >
                  <option value={1}>Last 1 Day</option>
                  <option value={7}>Last 7 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 90 Days</option>
                </select>
              </div>

              <button className="btn" onClick={syncEmails} disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading mr-2"></span>
                    Syncing Emails...
                  </>
                ) : (
                  "Sync Emails"
                )}
              </button>

              {message && (
                <p
                  className={`message-text mt-4 ${message.includes("Error") ? "error" : "success"}`}
                >
                  {message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Integrations;