import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ConnectedPage from './pages/ConnectedPage';
import MainPage from './pages/MainPage';
import ReroutPage from './pages/ReroutPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/reroute' element={<ReroutPage />} />
        <Route path='/connected' element={<ConnectedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
