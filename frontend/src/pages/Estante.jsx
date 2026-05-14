import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

function Estante() {
  const [livros, setLivros] = useState([]);
  const [estigmas, setEstigmas] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  
  // Estados da Forja
  const [forjaAberta, setForjaAberta] = useState(false);
  const [novoCodice, setNovoCodice] = useState({ titulo: '', autor: '', url_capa: '', paginas: '' });

  const carregarEstante = async () => {
    try {
      const livrosRes = await axios.get('http://localhost:3333/livros');
      const estigmasRes = await axios.get('http://localhost:3333/estigmas');
      
      setLivros(livrosRes.data);
      setEstigmas(estigmasRes.data);
    } catch (error) {
      console.error("As visões estão nubladas:", error);
    }
  };

  useEffect(() => {
    carregarEstante();
  }, []);

  const forjarCodice = async (e) => {
    e.preventDefault();
    if (!novoCodice.titulo.trim() || !novoCodice.autor.trim()) return;

    try {
      console.log("A tentar forjar:", novoCodice); // Log para diagnóstico no F12
      const response = await axios.post('http://localhost:3333/livros', novoCodice);
      
      // Atualiza o estado local
      setLivros([...livros, { ...response.data, estigmas: [] }]);
      setNovoCodice({ titulo: '', autor: '', url_capa: '', paginas: '' });
      setForjaAberta(false); // Fecha o painel
      
      // Força o recarregamento da página para garantir a sincronização com o banco
      window.location.reload(); 
    } catch (error) {
      console.error("Erro na forja:", error.response?.data || error.message);
      alert("O Oráculo recusou a obra. Verifique o terminal do backend.");
    }
  };

  const livrosFiltrados = filtroAtivo 
    ? livros.filter(livro => livro.estigmas && livro.estigmas.some(tag => tag.id === filtroAtivo))
    : livros;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1><BookOpen size={40} style={{ marginBottom: '-10px', marginRight: '15px', color: 'var(--accent-gold)' }} />O Códice de Atena</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontStyle: 'italic' }}>
          Onde as memórias repousam nas pedras do tempo.
        </p>
      </header>

      {/* A FORJA (Adicionar Livro) */}
      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          onClick={() => setForjaAberta(!forjaAberta)}
          style={{ 
            backgroundColor: forjaAberta ? 'transparent' : 'var(--accent-gold)', 
            color: forjaAberta ? 'var(--text-secondary)' : 'var(--bg-dark)', 
            border: forjaAberta ? '1px solid #444' : 'none', 
            padding: '10px 25px', 
            borderRadius: '30px', 
            cursor: 'pointer', 
            fontFamily: 'Cinzel, serif', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
        >
          {forjaAberta ? 'Fechar Forja' : <><Plus size={18} /> Forjar Novo Códice</>}
        </button>

        {forjaAberta && (
          <form onSubmit={forjarCodice} style={{ 
            marginTop: '20px', 
            backgroundColor: 'var(--bg-panel)', 
            padding: '25px', 
            borderRadius: '8px', 
            border: '1px solid var(--accent-gold)', 
            width: '100%', 
            maxWidth: '600px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '15px',
            boxShadow: '0 4px 15px rgba(197, 160, 89, 0.1)'
          }}>
            <h3 style={{ margin: 0, color: 'var(--accent-gold)', textAlign: 'center', fontFamily: 'Cinzel, serif' }}>Os Dados da Obra</h3>
            
            <input type="text" placeholder="Título da Obra *" required value={novoCodice.titulo} onChange={e => setNovoCodice({...novoCodice, titulo: e.target.value})} style={{ padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            <input type="text" placeholder="Autor *" required value={novoCodice.autor} onChange={e => setNovoCodice({...novoCodice, autor: e.target.value})} style={{ padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <input type="text" placeholder="URL da Capa (Opcional)" value={novoCodice.url_capa} onChange={e => setNovoCodice({...novoCodice, url_capa: e.target.value})} style={{ flex: 2, padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
              <input type="number" placeholder="Páginas" value={novoCodice.paginas} onChange={e => setNovoCodice({...novoCodice, paginas: e.target.value})} style={{ flex: 1, padding: '10px', backgroundColor: '#111', color: '#fff', border: '1px solid #444', borderRadius: '4px' }} />
            </div>

            <button type="submit" style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--bg-dark)', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              Moldar na Pedra
            </button>
          </form>
        )}
      </div>

      {/* BARRA DE ESTIGMAS (FILTROS) */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => setFiltroAtivo(null)}
          style={{ padding: '8px 16px', backgroundColor: filtroAtivo === null ? 'var(--accent-gold)' : '#111', color: filtroAtivo === null ? 'var(--bg-dark)' : 'var(--text-secondary)', border: `1px solid ${filtroAtivo === null ? 'var(--accent-gold)' : '#333'}`, borderRadius: '20px', cursor: 'pointer', fontFamily: 'Lora, serif', fontWeight: filtroAtivo === null ? 'bold' : 'normal', transition: 'all 0.2s ease' }}
        >
          Todos os Códices
        </button>
        
        {estigmas.map(tag => (
          <button 
            key={tag.id} onClick={() => setFiltroAtivo(tag.id)}
            style={{ padding: '8px 16px', backgroundColor: filtroAtivo === tag.id ? 'var(--accent-gold)' : '#111', color: filtroAtivo === tag.id ? 'var(--bg-dark)' : 'var(--text-secondary)', border: `1px solid ${filtroAtivo === tag.id ? 'var(--accent-gold)' : '#333'}`, borderRadius: '20px', cursor: 'pointer', fontFamily: 'Lora, serif', fontWeight: filtroAtivo === tag.id ? 'bold' : 'normal', transition: 'all 0.2s ease' }}
          >
            {tag.nome}
          </button>
        ))}
      </div>

      {/* GRID DE LIVROS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
        {livrosFiltrados.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1 / -1', fontStyle: 'italic', marginTop: '20px' }}>
            Nenhum códice encontrado com este estigma.
          </p>
        ) : (
          livrosFiltrados.map((livro) => (
            <Link to={`/livro/${livro.id}`} key={livro.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div 
                style={{ backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.3s ease, border-color 0.3s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#333'; }}
              >
                <div style={{ height: '300px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {livro.url_capa ? (
                    <img src={livro.url_capa} alt={`Capa de ${livro.titulo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontFamily: 'Cinzel', color: 'var(--text-secondary)', opacity: 0.5 }}>Sem Registro</span>
                  )}
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: '1.3' }}>{livro.titulo}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>{livro.autor}</p>
                    
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {livro.estigmas && livro.estigmas.map(tag => (
                        <span key={tag.id} style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#222', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid #444' }}>
                          {tag.nome}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Estante;