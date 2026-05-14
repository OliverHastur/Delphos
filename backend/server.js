require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão postgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('O Oráculo de Delphos está a escutar...');
});

// A Forja: Adicionar um novo Códice ao templo
app.post('/livros', async (req, res) => {
    try {
        const { titulo, autor, url_capa, paginas } = req.body;
        
        // Validação básica de pilares
        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Um códice precisa ter pelo menos Título e Autor.' });
        }
        
        const result = await pool.query(
            `INSERT INTO livros (titulo, autor, url_capa, paginas, status) 
             VALUES ($1, $2, $3, $4, 'QUERO_LER') RETURNING *`,
            [titulo, autor, url_capa || null, paginas ? parseInt(paginas) : null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao forjar novo códice:', err.message);
        res.status(500).json({ error: 'Erro interno na forja do templo.' });
    }
});

// Rota Principal: Invocar todos os Códices com os seus respectivos Estigmas (Tags)
app.get('/livros', async (req, res) => {
    try {
        const query = `
            SELECT l.*,
                   COALESCE(json_agg(json_build_object('id', e.id, 'nome', e.nome)) FILTER (WHERE e.id IS NOT NULL), '[]') as estigmas
            FROM livros l
            LEFT JOIN livro_estigma le ON l.id = le.livro_id
            LEFT JOIN estigmas_tags e ON le.estigma_id = e.id
            GROUP BY l.id
            ORDER BY l.id ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao invocar os códices:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Buscar todos os Estigmas (Tags) disponíveis no banco
app.get('/estigmas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estigmas_tags ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao invocar estigmas:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// A Rota Específica: Invocar um único Códice com os seus Estigmas
app.get('/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT l.*,
                   COALESCE(json_agg(json_build_object('id', e.id, 'nome', e.nome)) FILTER (WHERE e.id IS NOT NULL), '[]') as estigmas
            FROM livros l
            LEFT JOIN livro_estigma le ON l.id = le.livro_id
            LEFT JOIN estigmas_tags e ON le.estigma_id = e.id
            WHERE l.id = $1
            GROUP BY l.id
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relíquia não encontrada nas ruínas.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao consultar a câmara do códice:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Vincular um novo Estigma (Tag) a um Códice
app.post('/livros/:id/estigmas', async (req, res) => {
    try {
        const livro_id = parseInt(req.params.id);
        const estigma_id = parseInt(req.body.estigma_id);

        if (isNaN(livro_id) || isNaN(estigma_id)) {
            return res.status(400).json({ error: 'Identificadores inválidos para a cerimônia.' });
        }
        
        await pool.query(
            'INSERT INTO livro_estigma (livro_id, estigma_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [livro_id, estigma_id]
        );
        res.json({ message: 'Estigma gravado com sucesso na pedra.' });
    } catch (err) {
        console.error('Erro ao vincular estigma:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Forja de Estigmas: Criar uma nova tag global
app.post('/estigmas', async (req, res) => {
    try {
        const { nome } = req.body;
        const result = await pool.query(
            'INSERT INTO estigmas_tags (nome) VALUES ($1) RETURNING *',
            [nome]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao forjar novo estigma:', err.message);
        res.status(500).json({ error: 'Este estigma já existe ou o templo está instável.' });
    }
});

// Ler os Pergaminhos de uma obra específica
app.get('/livros/:id/pergaminhos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM pergaminhos_anotacoes WHERE livro_id = $1 ORDER BY data_criacao DESC', 
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao ler os pergaminhos:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Gravar um novo Pergaminho (Nota)
app.post('/livros/:id/pergaminhos', async (req, res) => {
    try {
        const { id } = req.params;
        const { conteudo } = req.body;
        const result = await pool.query(
            'INSERT INTO pergaminhos_anotacoes (livro_id, conteudo) VALUES ($1, $2) RETURNING *',
            [id, conteudo]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao selar o pergaminho:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Ler o Panteão (Personagens) de uma obra
app.get('/livros/:id/panteao', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM panteao_personagens WHERE livro_id = $1 ORDER BY id ASC', 
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao invocar o panteão:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Registrar um novo personagem no Panteão
app.post('/livros/:id/panteao', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, papel, descricao } = req.body;
        const result = await pool.query(
            'INSERT INTO panteao_personagens (livro_id, nome, papel, descricao) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, nome, papel, descricao]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao esculpir personagem:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// O Julgamento: Atualizar o status e a nota de um Códice
app.put('/livros/:id/julgamento', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, nota } = req.body;
        
        const result = await pool.query(
            'UPDATE livros SET status = $1, nota = $2 WHERE id = $3 RETURNING *',
            [status, nota, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao proferir o julgamento:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }
});

// Acender as chamas do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Chamas acesas na porta ${PORT}. O Oráculo aguarda consultas.`);
});