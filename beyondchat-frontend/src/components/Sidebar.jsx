import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#1f2937",
        color: "white",
        padding: "20px",
      }}
    >
      <h2>BeyondChats</h2>

      <nav style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <Link to="/integrations" style={{ color: "white" }}>
          Integrations
        </Link>

        <Link to="/chats" style={{ color: "white" }}>
          Chats
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;