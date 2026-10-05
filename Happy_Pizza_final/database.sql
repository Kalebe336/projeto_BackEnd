-- HAPPY PIZZA - banco simplificado para projeto escolar
-- Crie o banco happy_pizza no PostgreSQL e execute este arquivo.
-- A publicação de receitas NÃO depende de tabela de usuários.

-- Se o projeto antigo tiver id_usuario, remove essa dependência.
DO $$
BEGIN
    IF to_regclass('public.receita') IS NOT NULL THEN
        ALTER TABLE receita DROP COLUMN IF EXISTS id_usuario CASCADE;
    END IF;
END $$;

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

DROP TABLE IF EXISTS curtir CASCADE;
DROP TABLE IF EXISTS comentario CASCADE;

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

INSERT INTO receita
(titulo, origem, imagem, descricao, ingredientes, modo_preparo, tempo_preparo, dificuldade)
SELECT
    'Pizza Margherita', 'Italiana',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    'Uma pizza clássica, simples e cheia de sabor.',
    '["500 g de farinha de trigo", "10 g de fermento biológico seco", "300 ml de água morna", "1 colher de chá de sal", "2 colheres de sopa de azeite", "200 g de molho de tomate", "250 g de muçarela", "Tomate em rodelas", "Manjericão fresco"]'::jsonb,
    '["Misture a farinha, o fermento e o sal.", "Adicione a água e o azeite e misture até formar uma massa.", "Sove por cerca de 8 minutos e deixe descansar por 1 hora.", "Abra a massa em formato de pizza e espalhe o molho.", "Adicione a muçarela e o tomate.", "Asse em forno bem quente até a borda dourar.", "Finalize com manjericão fresco e sirva."]'::jsonb,
    '1h 30min', 'Fácil'
WHERE NOT EXISTS (SELECT 1 FROM receita WHERE titulo = 'Pizza Margherita');
