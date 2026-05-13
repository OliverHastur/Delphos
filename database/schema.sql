-- TABELA PRINCIPAL: Os Códices (Baseada no seu CSV)
CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    autor VARCHAR(255),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isbn VARCHAR(50),
    nota INTEGER, -- O Julgamento (1 a 5)
    numero_paginas INTEGER,
    preco_pago DECIMAL(10,2),
    status VARCHAR(50), -- LIDO, LENDO, QUERO LER (A UI traduz para o Fio das Moiras)
    titulo VARCHAR(255) NOT NULL,
    url_capa TEXT
);

-- TABELA DE APOIO: Os Pergaminhos (Notas Markdown)
CREATE TABLE pergaminhos_anotacoes (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    conteudo TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABELA DE APOIO: O Panteão (Personagens)
CREATE TABLE panteao_personagens (
    id SERIAL PRIMARY KEY,
    livro_id INTEGER REFERENCES livros(id) ON DELETE CASCADE,
    nome VARCHAR(255),
    papel VARCHAR(100), -- Protagonista, Antagonista, Sombra
    notas_personagem TEXT
);