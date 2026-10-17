# PokeAtlas

## Autor

Gabriel Lopes da Silva - Matrícula 22611427
Enzo Rodrigues Nascimento - Matrícula 22612071
Lucas Vicente - lucas.vicente@sempreceub.com

## Descrição

O PokeAtlas é uma aplicação web responsiva para pesquisar Pokémon por nome ou número e consultar rapidamente seus tipos, altura, peso, experiência base e quantidade de habilidades. Agora com persistência de dados via Supabase para salvar seus Pokémon favoritos.

## API utilizada

- [PokéAPI](https://pokeapi.co/)
- Endpoint consumido: `https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`
- [Supabase](https://supabase.com/) - Banco de dados PostgreSQL para persistência de favoritos

## Funcionalidades

- Busca por nome ou número do Pokémon.
- Atalhos para pesquisas rápidas.
- Exibição de imagem oficial, número, nome, tipos e atributos.
- **Salvar Pokémon favoritos** (persistência no banco de dados).
- **Listar e remover favoritos** armazenados no Supabase.
- **Contador de favoritos** - mostra quantos Pokémon estão salvos.
- **Clique para visualizar** - clique em um favorito para ver seus detalhes.
- **Verificação de duplicados** - impede favoritar o mesmo Pokémon duas vezes.
- **Limpar duplicados** - botão para remover Pokémon duplicados do banco.
- **Notificações toast** - feedback visual elegante para ações.
- Mensagem de carregamento e tratamento amigável para Pokémon inexistente ou indisponibilidade da API.
- Layout responsivo para computador e celular.

## Configuração do Supabase

Para usar a funcionalidade de favoritos, você precisa configurar o Supabase:

### Opção 1: Usar o script SQL (recomendado)

1. Crie uma conta e um projeto no [Supabase](https://supabase.com/) (recomendado: região South America).
2. No Supabase, vá ao **SQL Editor** (ícone de terminal na sidebar).
3. Clique em "New Query" e cole o conteúdo do arquivo `supabase-setup.sql`.
4. Clique em "Run" para executar o script. Isso criará a tabela e configurará as políticas automaticamente.
5. Em Project Settings → API, copie a URL do projeto e a chave anon public.
6. Substitua as constantes `SUPABASE_URL` e `SUPABASE_ANON_KEY` no arquivo `script.js` com suas credenciais.

### Opção 2: Configuração manual

1. Crie uma conta e um projeto no [Supabase](https://supabase.com/).
2. No Table Editor, crie a tabela `favoritos` com as colunas:
   - `id` (bigint, primary key)
   - `criado_em` (timestamptz, default now())
   - `nome_item` (text)
   - `pokemon_id` (bigint)
   - `tipos` (text)
   - `sprite` (text)
3. Em Project Settings → API, copie a URL do projeto e a chave anon public.
4. Configure as políticas de acesso (RLS) da tabela permitindo leitura e escrita para usuários anônimos.
5. Substitua as constantes `SUPABASE_URL` e `SUPABASE_ANON_KEY` no arquivo `script.js` com suas credenciais.

**Limitação conhecida:** As políticas RLS estão configuradas para acesso aberto a usuários anônimos. Em produção, recomenda-se implementar autenticação de usuários.

## Como executar localmente

### Opção 1: Direto no navegador

1. Clone o repositório:
   ```bash
   git clone https://github.com/gabriellopesssv/projeto.git
   ```
2. Configure o Supabase no arquivo `script.js` (veja seção acima).
3. Abra o arquivo `index.html` no navegador.

### Opção 2: Com Docker

1. Certifique-se de ter o Docker Desktop instalado (`docker --version`).
2. Clone o repositório:
   ```bash
   git clone https://github.com/gabriellopesssv/projeto.git
   cd projeto
   ```
3. Configure o Supabase no arquivo `script.js` (veja seção acima).
4. Construa a imagem Docker:
   ```bash
   docker build -t pokeatlas-app .
   ```
5. Execute o container:
   ```bash
   docker run -d -p 8080:80 --name pokeatlas pokeatlas-app
   ```
6. Acesse http://localhost:8080 no navegador.

Comandos úteis:
- `docker ps` - listar containers em execução
- `docker logs pokeatlas` - ver logs do container
- `docker stop pokeatlas` - parar o container
- `docker rm pokeatlas` - remover o container

### Publicar no Docker Hub

1. Faça login no Docker Hub:
   ```bash
   docker login
   ```
2. Renomeie a imagem com seu usuário:
   ```bash
   docker tag pokeatlas-app seu-usuario-dockerhub/pokeatlas-app:1.0
   ```
3. Envie para o Docker Hub:
   ```bash
   docker push seu-usuario-dockerhub/pokeatlas-app:1.0
   ```

Agora qualquer pessoa pode rodar sua aplicação com:
```bash
docker run -d -p 8080:80 seu-usuario-dockerhub/pokeatlas-app:1.0
```

## Links

- **Aplicação no ar (GitHub Pages):** https://gabriellopesssv.github.io/projeto-bootcamp/
- **Repositório:** https://github.com/gabriellopesssv/projeto-bootcamp
- **Script SQL para setup do Supabase:** `supabase-setup.sql`
