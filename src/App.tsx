import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Logs from './pages/Logs';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
