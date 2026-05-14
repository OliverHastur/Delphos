import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function Estante() {
  const [livros, setLivros] = useState([]);
  const [estigmas, setEstigmas] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState(null); // null significa "Todos"

  useEffect(() => {
    // Busca os livros e as tags ao mesmo tempo
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
    
    carregarEstante();
  }, []);

  // Lógica de Filtro: Se filtroAtivo for null, mostra tudo. Senão, filtra pelas tags do livro.
  const livrosFiltrados = filtroAtivo 
    ? livros.filter(livro => livro.estigmas.some(tag => tag.id === filtroAtivo))
    : livros;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1><BookOpen size={40} style={{ marginBottom: '-10px', marginRight: '15px', color: 'var(--accent-gold)' }} />O Códice de Atena</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontStyle: 'italic' }}>
          Onde as memórias repousam nas pedras do tempo.
        </p>
      </header>

      {/* BARRA DE ESTIGMAS (FILTROS) */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
        <button 
          onClick={() => setFiltroAtivo(null)}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: filtroAtivo === null ? 'var(--accent-gold)' : '#111',
            color: filtroAtivo === null ? 'var(--bg-dark)' : 'var(--text-secondary)',
            border: `1px solid ${filtroAtivo === null ? 'var(--accent-gold)' : '#333'}`,
            borderRadius: '20px',
            cursor: 'pointer',
            fontFamily: 'Lora, serif',
            fontWeight: filtroAtivo === null ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
        >
          Todos os Códices
        </button>
        
        {estigmas.map(tag => (
          <button 
            key={tag.id}
            onClick={() => setFiltroAtivo(tag.id)}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: filtroAtivo === tag.id ? 'var(--accent-gold)' : '#111',
              color: filtroAtivo === tag.id ? 'var(--bg-dark)' : 'var(--text-secondary)',
              border: `1px solid ${filtroAtivo === tag.id ? 'var(--accent-gold)' : '#333'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Lora, serif',
              fontWeight: filtroAtivo === tag.id ? 'bold' : 'normal',
              transition: 'all 0.2s ease'
            }}
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
            <Link 
              to={`/livro/${livro.id}`} 
              key={livro.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div 
                style={{ 
                  backgroundColor: 'var(--bg-panel)', 
                  borderRadius: '8px', 
                  border: '1px solid #333',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = 'var(--accent-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                <div style={{ height: '300px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {livro.url_capa ? (
                    <img 
                      src={livro.url_capa} 
                      alt={`Capa de ${livro.titulo}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontFamily: 'Cinzel', color: 'var(--text-secondary)', opacity: 0.5 }}>Sem Registro</span>
                  )}
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: '1.3' }}>{livro.titulo}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>{livro.autor}</p>
                    
                    {/* Exibição das Tags no Card do Livro */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {livro.estigmas.map(tag => (
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