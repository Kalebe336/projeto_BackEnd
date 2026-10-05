const { getPool } = require('../config/database');
const pool = new Proxy({}, { get(_, prop) { return (...args) => getPool()[prop](...args); } });

async function listarPizzas() {
    const resultado = await pool.query(`
        SELECT r.*,
               (SELECT COUNT(*)::int FROM curtir c WHERE c.id_receita = r.id_receita) AS curtidas
        FROM receita r
        ORDER BY r.data_criacao DESC, r.id_receita DESC;
    `);
    return resultado.rows;
}

async function buscarPizzaPorId(id) {
    const resultado = await pool.query(`
        SELECT r.*,
               (SELECT COUNT(*)::int FROM curtir c WHERE c.id_receita = r.id_receita) AS curtidas
        FROM receita r
        WHERE r.id_receita = $1;
    `, [id]);
    return resultado.rows[0];
}

async function criarPizza(dados) {
    const resultado = await pool.query(`
        INSERT INTO receita
        (titulo, origem, imagem, descricao, ingredientes, modo_preparo, tempo_preparo, dificuldade)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8)
        RETURNING *;
    `, [
        dados.titulo, dados.origem, dados.imagem, dados.descricao,
        JSON.stringify(dados.ingredientes), JSON.stringify(dados.modo_preparo),
        dados.tempo_preparo, dados.dificuldade
    ]);
    return resultado.rows[0];
}

async function atualizarPizza(id, dados) {
    const resultado = await pool.query(`
        UPDATE receita
        SET titulo = $1,
            origem = $2,
            imagem = $3,
            descricao = $4,
            ingredientes = $5::jsonb,
            modo_preparo = $6::jsonb,
            tempo_preparo = $7,
            dificuldade = $8
        WHERE id_receita = $9
        RETURNING *;
    `, [
        dados.titulo, dados.origem, dados.imagem, dados.descricao,
        JSON.stringify(dados.ingredientes), JSON.stringify(dados.modo_preparo),
        dados.tempo_preparo, dados.dificuldade, id
    ]);
    return resultado.rows[0];
}

async function excluirPizza(id) {
    await pool.query('DELETE FROM receita WHERE id_receita = $1;', [id]);
}

async function curtirPizza(idReceita) {
    const resultado = await pool.query(`
        INSERT INTO curtir (id_receita)
        VALUES ($1)
        RETURNING *;
    `, [idReceita]);
    return resultado.rows[0];
}

async function descurtirPizza(idReceita) {
    await pool.query(`
        DELETE FROM curtir
        WHERE id_curtida = (
            SELECT id_curtida FROM curtir
            WHERE id_receita = $1
            ORDER BY id_curtida DESC
            LIMIT 1
        );
    `, [idReceita]);
}

async function comentarPizza(idReceita, nome, comentario) {
    const resultado = await pool.query(`
        INSERT INTO comentario (id_receita, nome, comentario)
        VALUES ($1, $2, $3)
        RETURNING *;
    `, [idReceita, nome, comentario]);
    return resultado.rows[0];
}

async function listarComentarios(idReceita) {
    const resultado = await pool.query(`
        SELECT id_comentario, nome, comentario, data_criacao
        FROM comentario
        WHERE id_receita = $1
        ORDER BY data_criacao DESC;
    `, [idReceita]);
    return resultado.rows;
}

module.exports = {
    listarPizzas,
    buscarPizzaPorId,
    criarPizza,
    atualizarPizza,
    excluirPizza,
    curtirPizza,
    descurtirPizza,
    comentarPizza,
    listarComentarios
};
