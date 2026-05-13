import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Estante from './pages/Estante';
import Pergaminho from './pages/Pergaminho';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Quando o caminho for "/", mostra a Estante */}
        <Route path="/" element={<Estante />} />
        
        {/* Quando o caminho for "/livro/NUMERO", mostra o Pergaminho */}
        <Route path="/livro/:id" element={<Pergaminho />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;