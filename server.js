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

// Acender as chamas do servidor
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Chamas acesas na porta ${PORT}. O Oráculo aguarda consultas.`);
});