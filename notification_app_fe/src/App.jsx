import { Navigate, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityNotifications from './pages/PriorityNotifications';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5f7fb 0%, #eef2ff 100%)' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<AllNotifications />} />
        <Route path="/priority" element={<PriorityNotifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default App;