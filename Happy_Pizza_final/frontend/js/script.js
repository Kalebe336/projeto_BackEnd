const API = '/api/receitas';

async function lerResposta(resposta) {
    const texto = await resposta.text();
    if (!texto.trim()) return {};
    try { return JSON.parse(texto); }
    catch { return { erro: texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || `Erro HTTP ${resposta.status}` }; }
}

const lista = document.getElementById('listaReceitas');
const statusEl = document.getElementById('status');
const modalPublicar = document.getElementById('modalPublicar');
const modalDetalhes = document.getElementById('modalDetalhes');
const detalhes = document.getElementById('detalhesReceita');
const form = document.getElementById('formReceita');
const toast = document.getElementById('toast');

let receitas = [];

document.getElementById('btnPublicar').onclick = () => abrir(modalPublicar);
document.getElementById('btnPublicarHero').onclick = () => abrir(modalPublicar);

document.querySelectorAll('[data-fechar]').forEach(btn => {
    btn.addEventListener('click', () => fechar(document.getElementById(btn.dataset.fechar)));
});

[modalPublicar, modalDetalhes].forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) fechar(modal);
    });
});

document.getElementById('busca').addEventListener('input', renderizar);
document.getElementById('filtroDificuldade').addEventListener('change', renderizar);

function abrir(modal) {
    modal.classList.add('aberto');
    document.body.style.overflow = 'hidden';
}

function fechar(modal) {
    modal.classList.remove('aberto');
    document.body.style.overflow = '';
}

function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add('mostrar');
    setTimeout(() => toast.classList.remove('mostrar'), 2800);
}

function escapar(texto = '') {
    return String(texto)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function imagemValida(url) {
    return url && /^https?:\/\//i.test(url) ? url : 'img/logo.png';
}


async function carregarReceitas() {
    try {
        statusEl.textContent = 'Carregando receitas...';
        const resposta = await fetch(API);
        if (!resposta.ok) throw new Error();
        receitas = await lerResposta(resposta);
        if (!Array.isArray(receitas)) throw new Error(receitas.erro || 'Resposta inválida do servidor.');
        renderizar();
    } catch {
        statusEl.textContent = 'Não foi possível carregar as receitas. Confira se o backend e o PostgreSQL estão ligados.';
        lista.innerHTML = '';
    }
}

function renderizar() {
    const busca = document.getElementById('busca').value.toLowerCase().trim();
    const dificuldade = document.getElementById('filtroDificuldade').value;

    const filtradas = receitas.filter(r => {
        const combinaBusca = `${r.titulo} ${r.origem} ${r.autor}`.toLowerCase().includes(busca);
        return combinaBusca && (!dificuldade || r.dificuldade === dificuldade);
    });

    statusEl.textContent = `${filtradas.length} receita(s) encontrada(s)`;

    if (!filtradas.length) {
        lista.innerHTML = '<div class="vazio">Nenhuma receita encontrada. A pizza não vai se fazer sozinha, infelizmente.</div>';
        return;
    }

    lista.innerHTML = filtradas.map(r => `
        <article class="card" onclick="abrirDetalhes(${r.id_receita})">
            <img class="card-img" src="${imagemValida(escapar(r.imagem))}" alt="${escapar(r.titulo)}"
                 onerror="this.src='img/logo.png'">
            <div class="card-body">
                <div class="card-top">
                    <span class="etiqueta">${escapar(r.origem || 'Receita')}</span>
                    <span>❤️ ${r.curtidas || 0}</span>
                </div>
                <h3>${escapar(r.titulo)}</h3>
                <p>${escapar(r.descricao || 'Uma receita deliciosa da comunidade Happy Pizza.')}</p>
                <div class="meta">
                    <span>⏱ ${escapar(r.tempo_preparo || 'Não informado')}</span>
                    <span>👨‍🍳 ${escapar(r.dificuldade || 'Fácil')}</span>
                </div>
                <p class="autor">Publicado por ${escapar(r.autor || 'Usuário')}</p>
            </div>
        </article>
    `).join('');
}

async function abrirDetalhes(id) {
    try {
        detalhes.innerHTML = '<p>Carregando receita...</p>';
        abrir(modalDetalhes);

        const resposta = await fetch(`${API}/${id}`);
        if (!resposta.ok) throw new Error();
        const r = await lerResposta(resposta);
        if (!resposta.ok) throw new Error(r.erro || 'Erro ao buscar receita.');

        const ingredientes = Array.isArray(r.ingredientes) ? r.ingredientes : [];
        const passos = Array.isArray(r.modo_preparo) ? r.modo_preparo : [];

        detalhes.innerHTML = `
            <img class="detalhe-img" src="${imagemValida(escapar(r.imagem))}" alt="${escapar(r.titulo)}"
                 onerror="this.src='img/logo.png'">
            <div class="detalhe-conteudo">
                <span class="etiqueta">${escapar(r.origem || 'Receita')}</span>
                <h2>${escapar(r.titulo)}</h2>
                <p class="autor">Por ${escapar(r.autor || 'Usuário')} · ❤️ ${r.curtidas || 0} curtidas</p>
                <p class="detalhe-descricao">${escapar(r.descricao || '')}</p>
                <div class="meta">
                    <span>⏱ ${escapar(r.tempo_preparo || 'Não informado')}</span>
                    <span>👨‍🍳 ${escapar(r.dificuldade || 'Fácil')}</span>
                </div>
                <div class="detalhe-grid">
                    <section class="detalhe-bloco">
                        <h3>🧂 Ingredientes</h3>
                        <ul>${ingredientes.map(i => `<li>${escapar(i)}</li>`).join('')}</ul>
                    </section>
                    <section class="detalhe-bloco">
                        <h3>👨‍🍳 Modo de fazer</h3>
                        <ol class="passos">${passos.map(p => `<li>${escapar(p)}</li>`).join('')}</ol>
                    </section>
                </div>
                <div class="acoes-detalhe">
                    <button class="btn btn-principal" onclick="curtir(${r.id_receita})">❤️ Curtir receita</button>
                    <button class="btn btn-secundario" onclick="compartilhar(${r.id_receita}, '${escapar(r.titulo)}')">🔗 Compartilhar</button>
                </div>
            </div>
        `;
    } catch {
        detalhes.innerHTML = '<p>Não foi possível carregar os detalhes da receita.</p>';
    }
}

async function curtir(id) {
    try {
        const resposta = await fetch(`${API}/${id}/curtir`, { method: 'POST' });
        const dados = await lerResposta(resposta);
        if (!resposta.ok) throw new Error(dados.erro);
        mostrarToast('Receita curtida! ❤️');
        carregarReceitas();
    } catch (erro) {
        mostrarToast(erro.message || 'Não foi possível curtir.');
    }
}

async function compartilhar(id, titulo) {
    const url = `${location.origin}/?receita=${id}`;
    try {
        if (navigator.share) {
            await navigator.share({title: `Happy Pizza - ${titulo}`, url});
        } else {
            await navigator.clipboard.writeText(url);
            mostrarToast('Link copiado!');
        }
    } catch {}
}

form.addEventListener('submit', async e => {
    e.preventDefault();

    const dados = Object.fromEntries(new FormData(form).entries());
    dados.ingredientes = dados.ingredientes.split('\n').map(x => x.trim()).filter(Boolean);
    dados.modo_preparo = dados.modo_preparo.split('\n').map(x => x.trim()).filter(Boolean);

    try {
        const resposta = await fetch(API, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dados)
        });
        const resultado = await lerResposta(resposta);

        if (!resposta.ok) throw new Error(resultado.erro || 'Erro ao publicar.');

        form.reset();
        fechar(modalPublicar);
        mostrarToast('Receita publicada com sucesso! 🍕');
        await carregarReceitas();
    } catch (erro) {
        mostrarToast(erro.message || 'Não foi possível publicar a receita.');
    }
});

const receitaUrl = new URLSearchParams(location.search).get('receita');
if (receitaUrl) {
    window.addEventListener('load', () => abrirDetalhes(Number(receitaUrl)));
}

carregarReceitas();

window.abrirDetalhes = abrirDetalhes;
window.curtir = curtir;
window.compartilhar = compartilhar;
