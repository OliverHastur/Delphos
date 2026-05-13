import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

function Estante() {
  const [livros, setLivros] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3333/livros')
      .then(response => {
        setLivros(response.data);
      })
      .catch(error => {
        console.error("As visões estão nubladas:", error);
      });
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
        <h1><BookOpen size={40} style={{ marginBottom: '-10px', marginRight: '15px', color: 'var(--accent-gold)' }} />O Códice de Atena</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', fontStyle: 'italic' }}>
          Onde as memórias repousam nas pedras do tempo.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
        {livros.map((livro) => (
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
                  <span style={{ fontFamily: 'Cinzel', color: 'var(--text-secondary)', opacity: 0.5 }}>Sem Registro Visual</span>
                )}
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: '1.3' }}>{livro.titulo}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{livro.autor}</p>
                </div>
                <p style={{ 
                  fontSize: '0.8rem', 
                  marginTop: '15px', 
                  color: 'var(--bg-dark)', 
                  backgroundColor: 'var(--accent-gold)',
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  alignSelf: 'flex-start'
                }}>
                  {livro.status}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Estante;