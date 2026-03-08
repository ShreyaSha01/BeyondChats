import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import Chats from "./pages/Chats";

function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route path="integrations" element={<Integrations />} />
            <Route path="chats" element={<Chats />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;