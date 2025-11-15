import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/page.jsx';

function App() {
  return (
    <Router>
          <Routes>
          {/* Rotta pubblica - Home page */}
          <Route path="/" element={<Home />} />
        </Routes>
    </Router>
  );
}

export default App;