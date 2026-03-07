import { useState, useEffect } from "react";
import axios from "axios";

function Integrations() {
  const [connected, setConnected] = useState(false);
  const [days, setDays] = useState(7);

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
    await axios.post("http://localhost/api/sync-emails", {
      days: days,
    });

    alert("Email sync started!");
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
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button onClick={syncEmails}>
            Sync Emails
          </button>
        </>
      )}
    </div>
  );
}

export default Integrations;