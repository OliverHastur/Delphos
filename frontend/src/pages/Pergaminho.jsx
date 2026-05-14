import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STATUS_INFO = {
  QUERO_LER: { label: 'Nas Estrelas (Quero Ler)', color: '#9a9a9a' },
  LENDO: { label: 'Em Travessia (Lendo)', color: '#3498db' },
  LIDO: { label: 'Consumado (Lido)', color: '#c5a059' }, 
  ABANDONADO: { label: 'Nas Sombras (Abandonado)', color: '#8b0000' } 
};

function Pergaminho() {
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [pergaminhos, setPergaminhos] = useState([]);
  const [personagens, setPersonagens] = useState([]);
  const [estigmasDisponiveis, setEstigmasDisponiveis] = useState([]);
  
  const [novoConteudo, setNovoConteudo] = useState('');
  const [novoPersonagem, setNovoPersonagem] = useState({ nome: '', papel: '', descricao: '' });
  const [estigmaSelecionado, setEstigmaSelecionado] = useState('');
  const [loading, setLoading] = useState(true);

  const [modoEdicao, setModoEdicao] = useState(false);
  const [statusEdit, setStatusEdit] = useState('');
  const [notaEdit, setNotaEdit] = useState('');

  const carregarSantuario = async () => {
    try {
      const livroRes = await axios.get(`http://localhost:3333/livros/${id}`);
      const pergaminhosRes = await axios.get(`http://localhost:3333/livros/${id}/pergaminhos`);
      const panteaoRes = await axios.get(`http://localhost:3333/livros/${id}/panteao`);
      const estigmasRes = await axios.get('http://localhost:3333/estigmas');
      
      setLivro(livroRes.data);
      setStatusEdit(livroRes.data.status || 'QUERO_LER');
      setNotaEdit(livroRes.data.nota || '');
      setPergaminhos(pergaminhosRes.data);
      setPersonagens(panteaoRes.data);
      setEstigmasDisponiveis(estigmasRes.data);
      setLoading(false);
    } catch (error) {
      console.error("As visões estão nubladas:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSantuario();
  }, [id]);

  const proferirJulgamento = async () => {
    try {
      const notaFormatada = notaEdit === '' ? null : parseInt(notaEdit);
      await axios.put(`http://localhost:3333/livros/${id}/julgamento`, { status: statusEdit, nota: notaFormatada });
      carregarSantuario(); // Recarrega para atualizar os dados
      setModoEdicao(false);
    } catch (error) {
      console.error("Erro ao alterar o destino da obra:", error);
    }
  };

  const selarPergaminho = async () => {
    if (!novoConteudo.trim()) return;
    try {
      const response = await axios.post(`http://localhost:3333/livros/${id}/pergaminhos`, { conteudo: novoConteudo });
      setPergaminhos([response.data, ...pergaminhos]);
      setNovoConteudo('');
    } catch (error) {
      console.error("Erro ao gravar na pedra:", error);
    }
  };

  const esculpirPersonagem = async () => {
    if (!novoPersonagem.nome.trim()) return;
    try {
      const response = await axios.post(`http://localhost:3333/livros/${id}/panteao`, novoPersonagem);
      setPersonagens([...personagens, response.data]);
      setNovoPersonagem({ nome: '', papel: '', descricao: '' });
    } catch (error) {
      console.error("Erro ao esculpir personagem:", error);
    }
  };

  const vincularEstigma = async () => {
    if (!estigmaSelecionado) return;
    try {
      await axios.post(`http://localhost:3333/livros/${id}/estigmas`, { estigma_id: parseInt(estigmaSelecionado) });
      carregarSantuario(); // Atualiza a página para mostrar a nova tag
      setEstigmaSelecionado('');
    } catch (error) {
      console.error("Erro ao vincular estigma:", error);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'Cinzel', color: 'var(--accent-gold)' }}>A invocar as memórias...</div>;
  if (!livro) return <div style={{ textAlign: 'center', marginTop: '100px' }}>Obra não encontrada nas ruínas.</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" style={{ color: 'var(--accent-gold)', textDecoration: 'none', marginBottom: '30px', display: 'inline-block', fontSize: '1.1rem' }}>
        &larr; Retornar à Estante
      </Link>
      
      {/* CABEÇALHO MONUMENTAL */}
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
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ padding: '10px 20px', backgroundColor: '#111', borderRadius: '4px', border: `1px solid ${STATUS_INFO[livro.status]?.color || '#333'}` }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>O Fio das Moiras</span>
              <span style={{ color: STATUS_INFO[livro.status]?.color || 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {STATUS_INFO[livro.status]?.label || livro.status}
              </span>
            </div>
          </div>

          {/* EXIBIÇÃO E ADIÇÃO DE ESTIGMAS (TAGS) */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {livro.estigmas && livro.estigmas.map(tag => (
                <span key={tag.id} style={{ padding: '4px 10px', backgroundColor: '#222', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid #444', fontSize: '0.8rem' }}>
                  {tag.nome}
                </span>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={estigmaSelecionado} 
                onChange={(e) => setEstigmaSelecionado(e.target.value)}
                style={{ padding: '6px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', fontFamily: 'Lora, serif', fontSize: '0.9rem' }}
              >
                <option value="">Selecione um Estigma...</option>
                {estigmasDisponiveis.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.nome}</option>
                ))}
              </select>
              <button 
                onClick={vincularEstigma}
                style={{ backgroundColor: 'transparent', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                + Adicionar
              </button>
            </div>
          </div>

          {/* ÁREA DO JULGAMENTO INTERATIVA */}
          <div style={{ padding: '20px', borderTop: '1px dashed #333', marginTop: '20px', backgroundColor: '#151515', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>O Destino da Obra</h3>
              {!modoEdicao && (
                <button onClick={() => setModoEdicao(true)} style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Lora, serif' }}>
                  Alterar Destino
                </button>
              )}
            </div>

            {modoEdicao ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <select value={statusEdit} onChange={(e) => setStatusEdit(e.target.value)} style={{ padding: '8px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', fontFamily: 'Lora, serif' }}>
                  <option value="QUERO_LER">Quero Ler</option>
                  <option value="LENDO">Lendo</option>
                  <option value="LIDO">Lido</option>
                  <option value="ABANDONADO">Abandonado</option>
                </select>
                <input type="number" min="1" max="5" placeholder="Nota (1 a 5)" value={notaEdit} onChange={(e) => setNotaEdit(e.target.value)} style={{ width: '100px', padding: '8px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', fontFamily: 'Lora, serif' }} />
                <button onClick={proferirJulgamento} style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--bg-dark)', border: 'none', padding: '8px 15px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Confirmar</button>
                <button onClick={() => setModoEdicao(false)} style={{ backgroundColor: 'transparent', color: 'var(--accent-danger)', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Cancelar</button>
              </div>
            ) : (
              <p style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontSize: '1.1rem' }}>
                {livro.nota ? `Veredicto: ${livro.nota} de 5 Estrelas` : "Esta obra ainda aguarda o seu veredicto final."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO O PANTEÃO */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '30px' }}>O Panteão</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
          <input type="text" placeholder="Nome da Figura..." value={novoPersonagem.nome} onChange={(e) => setNovoPersonagem({...novoPersonagem, nome: e.target.value})} style={{ padding: '10px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', fontFamily: 'Lora, serif' }} />
          <input type="text" placeholder="Papel (Ex: Protagonista)" value={novoPersonagem.papel} onChange={(e) => setNovoPersonagem({...novoPersonagem, papel: e.target.value})} style={{ padding: '10px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', fontFamily: 'Lora, serif' }} />
          <textarea placeholder="Anotações sobre a índole..." value={novoPersonagem.descricao} onChange={(e) => setNovoPersonagem({...novoPersonagem, descricao: e.target.value})} style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', borderRadius: '4px', height: '80px', resize: 'vertical', fontFamily: 'Lora, serif' }} />
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={esculpirPersonagem} style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--bg-dark)', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Cinzel, serif' }}>Esculpir Face</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {personagens.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: 'span 2' }}>Nenhuma alma caminha por estes corredores.</p> : personagens.map((pers) => (
            <div key={pers.id} style={{ backgroundColor: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333', borderTop: '3px solid var(--accent-gold)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{pers.nome}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px' }}>{pers.papel}</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{pers.descricao}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* SEÇÃO DOS PERGAMINHOS */}
      <div style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '2rem', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '30px' }}>Os Pergaminhos</h2>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '40px' }}>
          <textarea value={novoConteudo} onChange={(e) => setNovoConteudo(e.target.value)} placeholder="Escreva as suas notas em Markdown..." style={{ width: '100%', height: '150px', backgroundColor: '#111', color: 'var(--text-primary)', border: '1px solid #444', padding: '15px', borderRadius: '4px', fontFamily: 'Lora, serif', resize: 'vertical', outline: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
            <button onClick={selarPergaminho} style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--bg-dark)', border: 'none', padding: '10px 25px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Cinzel, serif' }}>Selar Pergaminho</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pergaminhos.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>O silêncio impera.</p> : pergaminhos.map((nota) => (
            <div key={nota.id} style={{ backgroundColor: '#111', padding: '25px', borderRadius: '8px', borderLeft: '2px solid var(--accent-gold)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '15px', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>Gravado em: {new Date(nota.data_criacao).toLocaleString('pt-BR')}</div>
              <div className="markdown-body" style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{nota.conteudo}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Pergaminho;