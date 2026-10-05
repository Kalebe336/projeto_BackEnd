const { Pool, Client } = require('pg');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const linhas = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const linha of linhas) {
        const texto = linha.trim();
        if (!texto || texto.startsWith('#')) continue;
        const posicao = texto.indexOf('=');
        if (posicao === -1) continue;
        const chave = texto.slice(0, posicao).trim();
        const valor = texto.slice(posicao + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[chave]) process.env[chave] = valor;
    }
}

const config = {
    user: String(process.env.DB_USER || 'postgres'),
    host: String(process.env.DB_HOST || 'localhost'),
    database: String(process.env.DB_NAME || 'happy_pizza'),
    port: Number(process.env.DB_PORT || 5432),
    password: String(process.env.DB_PASSWORD ?? '')
};

let pool = null;

async function criarBancoSeNaoExistir() {
    const cliente = new Client({
        user: config.user,
        host: config.host,
        database: String(process.env.DB_MAINTENANCE_DB || 'postgres'),
        port: config.port,
        password: config.password
    });

    await cliente.connect();
    try {
        const resultado = await cliente.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [config.database]
        );

        if (resultado.rowCount === 0) {
            // Identificador do banco vem das configurações locais, não de entrada do usuário.
            const nomeSeguro = config.database.replace(/"/g, '""');
            await cliente.query(`CREATE DATABASE "${nomeSeguro}"`);
            console.log(`Banco "${config.database}" criado automaticamente.`);
        }
    } finally {
        await cliente.end();
    }
}

function obterPool() {
    if (!pool) pool = new Pool(config);
    return pool;
}

async function prepararBanco() {
    await criarBancoSeNaoExistir();
    pool = new Pool(config);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS receita (
            id_receita SERIAL PRIMARY KEY,
            titulo VARCHAR(150) NOT NULL,
            origem VARCHAR(80) DEFAULT 'Italiana',
            imagem TEXT DEFAULT '',
            descricao TEXT DEFAULT '',
            ingredientes JSONB NOT NULL DEFAULT '[]'::jsonb,
            modo_preparo JSONB NOT NULL DEFAULT '[]'::jsonb,
            tempo_preparo VARCHAR(50) DEFAULT '',
            dificuldade VARCHAR(30) DEFAULT 'Fácil',
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS curtir (
            id_curtida SERIAL PRIMARY KEY,
            id_receita INTEGER NOT NULL REFERENCES receita(id_receita) ON DELETE CASCADE,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS comentario (
            id_comentario SERIAL PRIMARY KEY,
            id_receita INTEGER NOT NULL REFERENCES receita(id_receita) ON DELETE CASCADE,
            nome VARCHAR(100) DEFAULT 'Visitante',
            comentario TEXT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_curtir_receita ON curtir(id_receita);
        CREATE INDEX IF NOT EXISTS idx_comentario_receita ON comentario(id_receita);
    `);
    return pool;
}

function getPool() {
    if (!pool) throw new Error('Banco ainda não foi inicializado.');
    return pool;
}

module.exports = {
    getPool,
    prepararBanco,
    configBanco: {
        user: config.user,
        host: config.host,
        database: config.database,
        port: config.port,
        senhaConfigurada: Boolean(process.env.DB_PASSWORD)
    }
};
