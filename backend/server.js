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

// Rota Principal
app.get('/livros', async (req, res) => {
    try {
        // Busca livros e ordena pelo ID
        const result = await pool.query('SELECT * FROM livros ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao consultar os pergaminhos:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
    }

});

// A Rota Específica: Invocar um único Códice pelo seu ID
app.get('/livros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // O $1 é a forma segura do PostgreSQL evitar ataques de injeção
        const result = await pool.query('SELECT * FROM livros WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relíquia não encontrada nas ruínas.' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao consultar a câmara do códice:', err.message);
        res.status(500).json({ error: 'Erro interno no templo.' });
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

// Acender as chamas do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Chamas acesas na porta ${PORT}. O Oráculo aguarda consultas.`);
});