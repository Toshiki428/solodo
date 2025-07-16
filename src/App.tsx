import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Logs from './pages/Logs';
import Statistics from './pages/Statistics';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
