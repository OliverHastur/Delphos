-- Tabela Principal 
CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    autor VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isbn VARCHAR(50),
    nota INTEGER, -- (1 a 5)
    numero_paginas INTEGER,
    preco_pago DECIMAL(10,2),
    status VARCHAR(50), -- LIDO, LENDO, QUERO LER
    titulo VARCHAR(255) NOT NULL,
    url_capa TEXT
);

-- Tabela de Apoio - Anotações
CREATE TABLE pergaminhos_anotacoes (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    conteudo TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Apoio - Personagens
CREATE TABLE panteao_personagens (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    nome VARCHAR(255),
    papel VARCHAR(100), -- Protagonista, Antagonista, Sombra
    notas_personagem TEXT
);