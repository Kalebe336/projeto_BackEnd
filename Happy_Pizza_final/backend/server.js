const express = require('express');
const cors = require('cors');
const path = require('path');
const { prepararBanco, configBanco, getPool } = require('./config/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api', (req, res) => {
    res.json({
        nome: 'Happy Pizza API',
        versao: '1.0.0',
        status: 'online',
        endpoints: { receitas: '/api/receitas' }
    });
});

app.get('/api/status-db', async (req, res) => {
    try {
        await getPool().query('SELECT 1');
        res.json({ ok: true, banco: configBanco });
    } catch (erro) {
        console.error('Falha na conexão com o PostgreSQL:', erro);
        res.status(500).json({ ok: false, banco: configBanco, erro: erro.message });
    }
});

async function iniciar() {
    try {
        await prepararBanco();
        const receitaRoutes = require('./routes/pizzaRoutes');
        app.use('/api/receitas', receitaRoutes);

        // Qualquer rota /api que não exista retorna JSON, nunca HTML.
        app.use('/api', (req, res) => {
            res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
        });

        // Front-end para as demais rotas do site.
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        // Erros do Express também serão devolvidos como JSON nas APIs.
        app.use((erro, req, res, next) => {
            console.error('Erro do servidor:', erro);
            if (req.path.startsWith('/api')) {
                return res.status(500).json({ erro: erro.message || 'Erro interno do servidor.' });
            }
            res.status(500).send('Erro interno do servidor.');
        });

        app.listen(PORT, () => {
            console.log(`Happy Pizza rodando em http://localhost:${PORT}`);
            console.log(`Banco conectado: ${configBanco.database}`);
        });
    } catch (erro) {
        console.error('\nNão foi possível iniciar o Happy Pizza.');
        console.error('Verifique PostgreSQL, usuário, senha e porta.');
        console.error('Detalhe:', erro.message);
        process.exit(1);
    }
}

iniciar();
