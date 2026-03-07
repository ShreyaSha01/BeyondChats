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
        { withCredentials: true }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error syncing emails");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Integrations</h1>

      {!connected && (
        <button onClick={connectGmail}>
          Connect to Gmail
        </button>
      )}

      {connected && (
        <>
          <p>Gmail Connected</p>

          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
          >
            <option value={1}>Last 1 Day</option>
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button onClick={syncEmails} disabled={loading}>
            {loading ? "Syncing Emails..." : "Sync Emails"}
          </button>

          {loading && <p>Fetching emails from Gmail...</p>}

          {message && <p>{message}</p>}
        </>
      )}
    </div>
  );
}

export default Integrations;