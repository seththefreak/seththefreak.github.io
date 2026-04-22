# Guia de Usuario

## 1. Visao geral
Este companion app unifica dois sistemas em uma instalacao PWA:
- Verloren RPG Sheets
- UnheaveN: ERA Palimpsest

O ponto de entrada principal e o hub `launcher.html`.

## 2. Como abrir o app
1. Abra `launcher.html` no navegador.
2. Escolha um sistema:
   - `Abrir Verloren`
   - `Abrir ERA`
3. O app salva o ultimo sistema aberto para acesso rapido no botao `Ultimo sistema`.

## 3. Instalacao como PWA
1. No hub ou dentro do ERA, clique em `Instalar`.
2. Se o navegador for compativel, confirme a instalacao.
3. Depois de instalado, o app funciona em modo standalone e com cache offline.

## 4. Uso rapido do Verloren
Arquivo principal: `index.html`

### 4.1 Biblioteca
- Lista fichas e presets.
- Filtros por classificacao, tipo e busca.
- Acoes comuns:
  - criar nova ficha
  - duplicar ficha
  - excluir ficha

### 4.2 Editor de ficha
- Edite nome, conceito, atributos, modos, tracos, vantagens e vulnerabilidades.
- Sistema de nivel e impeto integrado.
- Economia e equipamentos:
  - carteira
  - inventario
  - loja
  - historico de transacoes

### 4.3 Presets
- Visualize e gerencie presets raciais.
- Crie ficha nova a partir de preset.

### 4.4 Sistema e Mundo
- `Sistema`: referencia de regras, combate, condicoes, magia e grimonio.
- `Mundo`: secoes de lore, bestiario, metaflora e dados de apoio.

## 5. Uso rapido do ERA
Arquivo principal: `era/index.html`

O ERA funciona como app proprio dentro do mesmo PWA e possui abas principais:
- Ficha
- Dados
- Combate
- Arsenal
- Sistema/Referencia

Tambem existe acesso ao `Hub de sistemas` para voltar ao launcher.

## 6. Persistencia de dados
- Os dados sao salvos localmente no navegador (`localStorage`).
- Chaves principais incluem estado do companion, pagina ativa e ficha ativa.
- Recomendacao: use exportacao/backup periodico se disponivel no fluxo de uso.

## 7. Dicas de uso seguro
- Evite limpar dados do navegador sem backup.
- Ao trocar de dispositivo/navegador, exporte e importe dados.
- Em caso de comportamento estranho, recarregue a pagina para renovar cache.

## 8. Solucao de problemas
### Botao Instalar desativado
- O navegador pode nao suportar o prompt de instalacao.
- Tente Chrome/Edge atualizados.

### Mudancas nao aparecem apos atualizacao
- Recarregue a pagina.
- Feche e abra o app novamente para forcar troca de Service Worker.

### Ficha ativa nao abre como esperado
- Volte para Biblioteca e abra a ficha manualmente.
- Verifique se a ficha nao foi removida.
