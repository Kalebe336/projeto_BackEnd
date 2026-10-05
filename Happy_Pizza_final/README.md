# Happy Pizza

Projeto web de receitas de pizza com Front-end, Node.js, Express e PostgreSQL.

## Configuração rápida

1. Tenha o PostgreSQL instalado e em execução.
2. Entre em `backend`.
3. Copie `.env.example` para `.env`.
4. Coloque sua senha do PostgreSQL em `DB_PASSWORD`.
5. Execute `npm install`.
6. Execute `npm start`.
7. Abra `http://localhost:3000`.

O sistema **cria automaticamente o banco `happy_pizza` e as tabelas** na primeira execução, desde que o usuário do PostgreSQL tenha permissão para criar bancos.

Se seu usuário não puder criar bancos, crie manualmente um banco chamado `happy_pizza` no pgAdmin e execute `database.sql`.

## Teste do banco

Abra:
`http://localhost:3000/api/status-db`

Se aparecer `"ok": true`, o PostgreSQL está conectado.

## Importante

A publicação de receitas não depende de tabela de usuários. As receitas possuem título, imagem, descrição, ingredientes, modo de preparo, tempo e dificuldade.
