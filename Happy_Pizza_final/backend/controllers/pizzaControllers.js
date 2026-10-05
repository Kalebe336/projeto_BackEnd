const pizzaModel = require('../models/pizzaModels');

function normalizarReceita(body) {
    const ingredientes = Array.isArray(body.ingredientes)
        ? body.ingredientes.filter(item => String(item).trim())
        : String(body.ingredientes || '').split('\n').map(item => item.trim()).filter(Boolean);

    const modo_preparo = Array.isArray(body.modo_preparo)
        ? body.modo_preparo.filter(item => String(item).trim())
        : String(body.modo_preparo || '').split('\n').map(item => item.trim()).filter(Boolean);

    return {
        titulo: String(body.titulo || '').trim(),
        origem: String(body.origem || 'Italiana').trim(),
        imagem: String(body.imagem || '').trim(),
        descricao: String(body.descricao || '').trim(),
        ingredientes,
        modo_preparo,
        tempo_preparo: String(body.tempo_preparo || '').trim(),
        dificuldade: String(body.dificuldade || 'Fácil').trim()
    };
}

function validarReceita(dados) {
    if (!dados.titulo) return 'Informe o título da receita.';
    if (!dados.ingredientes.length) return 'Adicione pelo menos um ingrediente.';
    if (!dados.modo_preparo.length) return 'Adicione pelo menos um passo do modo de preparo.';
    return null;
}

async function listarPizzas(req, res) {
    try {
        res.json(await pizzaModel.listarPizzas());
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar receitas.' });
    }
}

async function buscarPizza(req, res) {
    try {
        const pizza = await pizzaModel.buscarPizzaPorId(Number(req.params.id));
        if (!pizza) return res.status(404).json({ erro: 'Receita não encontrada.' });

        pizza.comentarios = await pizzaModel.listarComentarios(Number(req.params.id));
        res.json(pizza);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar receita.' });
    }
}

async function criarPizza(req, res) {
    try {
        const dados = normalizarReceita(req.body);
        const erro = validarReceita(dados);
        if (erro) return res.status(400).json({ erro });

        const receita = await pizzaModel.criarPizza(dados);
        res.status(201).json(receita);
    } catch (erro) {
        console.error(erro);
        console.error('ERRO AO PUBLICAR:', erro);
        if (erro.code === '22P02') return res.status(400).json({ erro: 'Algum dado da receita está em formato inválido.' });
        res.status(500).json({ erro: `Erro ao publicar receita: ${erro.message || 'erro no banco de dados'}` });
    }
}

async function atualizarPizza(req, res) {
    try {
        const dados = normalizarReceita(req.body);
        const erro = validarReceita(dados);
        if (erro) return res.status(400).json({ erro });

        const receita = await pizzaModel.atualizarPizza(Number(req.params.id), dados);
        if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' });

        res.json(receita);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao atualizar receita.' });
    }
}

async function excluirPizza(req, res) {
    try {
        const receita = await pizzaModel.buscarPizzaPorId(Number(req.params.id));
        if (!receita) return res.status(404).json({ erro: 'Receita não encontrada.' });

        await pizzaModel.excluirPizza(Number(req.params.id));
        res.json({ mensagem: 'Receita excluída com sucesso.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir receita.' });
    }
}

async function curtirPizza(req, res) {
    try {
        const idReceita = Number(req.params.id);
        const existente = await pizzaModel.buscarPizzaPorId(idReceita);
        if (!existente) return res.status(404).json({ erro: 'Receita não encontrada.' });

        const curtida = await pizzaModel.curtirPizza(idReceita);
        res.status(201).json({ mensagem: 'Receita curtida.', curtida: true, id_curtida: curtida.id_curtida });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao curtir receita.' });
    }
}

async function descurtirPizza(req, res) {
    try {
        await pizzaModel.descurtirPizza(Number(req.params.id));
        res.json({ mensagem: 'Curtida removida.' });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao remover curtida.' });
    }
}

async function comentarPizza(req, res) {
    try {
        const comentario = String(req.body.comentario || '').trim();
        const nome = String(req.body.nome || 'Visitante').trim() || 'Visitante';
        if (!comentario) {
            return res.status(400).json({ erro: 'O comentário é obrigatório.' });
        }
        const novo = await pizzaModel.comentarPizza(Number(req.params.id), nome, comentario);
        res.status(201).json(novo);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao publicar comentário.' });
    }
}

async function listarComentarios(req, res) {
    try {
        res.json(await pizzaModel.listarComentarios(Number(req.params.id)));
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar comentários.' });
    }
}

module.exports = {
    listarPizzas, buscarPizza, criarPizza, atualizarPizza, excluirPizza,
    curtirPizza, descurtirPizza, comentarPizza, listarComentarios
};
