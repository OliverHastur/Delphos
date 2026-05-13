import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function Pergaminho() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [pergaminhos, setPergaminhos] = useState([]);
  const [novoConteudo, setNovoConteudo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar o livro e os seus pergaminhos simultaneamente
    const carregarSantuario = async () => {
      try {
        const livroRes = await axios.get(`http://localhost:3333/livros/${id}`);
        const pergaminhosRes = await axios.get(`http://localhost:3333/livros/${id}/pergaminhos`);
        
        setLivro(livroRes.data);
        setPergaminhos(pergaminhosRes.data);
        setLoading(false);
      } catch (error) {
        console.error("As visões estão nubladas:", error);
        setLoading(false);
      }
    };
    
    carregarSantuario();
  }, [id]);

  const selarPergaminho = async () => {
    if (!novoConteudo.trim()) return;

    try {
      const response = await axios.post(`http://localhost:3333/livros/${id}/pergaminhos`, {
        conteudo: novoConteudo
      });
      // Adiciona o novo pergaminho no topo da lista sem recarregar a página
      setPergaminhos([response.data, ...pergaminhos]);
      setNovoConteudo(''); // Limpa a área de texto
    } catch (error) {
      console.error("Erro ao gravar na pedra:", error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Cinzel', color: 'var(--accent-gold)' }}>A invocar as memórias...</div>;
  if (!livro) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Obra não encontrada nas ruínas.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--accent-gold)', textDecoration: 'none', marginBottom: '30px', display: 'inline-block', fontSize: '1.1rem' }}>
        &larr; Retornar à Estante
      </Link>
      
      {/* Cabeçalho Monumental (Mantido igual) */}
      <div style={{ display: 'flex', gap: '40px', backgroundColor: 'var(--bg-panel)', padding: '40px', borderRadius: '8px', border: '1px solid #333', alignItems: 'flex-start' }}>
        <div style={{ width: '200px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', border: '1px solid #222' }}>
          {livro.url_capa ? (
            <img src={livro.url_capa} alt="Capa" style={{ width: '100%', display: 'block' }} />
          ) : (
            <div style={{ height: '300px', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontFamily: 'Cinzel', color: 'var(--text-secondary)' }}>Sem Capa</span>
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{livro.titulo}</h1>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '30px', fontFamily: 'Lora, serif' }}>{livro.autor}</h2>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#111', borderRadius: '4px', border: '1px solid #333' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>O Fio das Moiras</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{livro.status}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* SEÇÃO DOS PERGAMINHOS (NOVO) */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '30px' }}>Os Pergaminhos</h2>
        
        {/* Púlpito de Escrita */}
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '40px' }}>
          <textarea 
            value={novoConteudo}
            onChange={(e) => setNovoConteudo(e.target.value)}
            placeholder="Escreva as suas notas em Markdown. Estruture teias de personagens complexas, mapeie capítulos ou guarde citações marcantes..."
            style={{ 
              width: '100%', 
              height: '150px', 
              backgroundColor: '#111', 
              color: 'var(--text-primary)', 
              border: '1px solid #444', 
              padding: '15px', 
              borderRadius: '4px',
              fontFamily: 'Lora, serif',
              fontSize: '1rem',
              resize: 'vertical',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button 
              onClick={selarPergaminho}
              style={{ 
                backgroundColor: 'var(--accent-gold)', 
                color: 'var(--bg-dark)', 
                border: 'none', 
                padding: '10px 25px', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontFamily: 'Cinzel, serif'
              }}
            >
              Selar Pergaminho
            </button>
          </div>
        </div>

        {/* Lista de Registos Antigos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pergaminhos.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>Nenhum pensamento gravado ainda. O silêncio impera.</p>
          ) : (
            pergaminhos.map((nota) => (
              <div key={nota.id} style={{ backgroundColor: '#111', padding: '25px', borderRadius: '8px', border: '1px left var(--accent-gold)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
                  Gravado em: {new Date(nota.data_criacao).toLocaleString('pt-BR')}
                </div>
                
                {/* O Motor do Markdown em ação */}
                <div className="markdown-body" style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {nota.conteudo}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Pergaminho;