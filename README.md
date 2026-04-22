# Verloren + UnheaveN Companion

Companion app PWA unificado para dois sistemas:
- Verloren RPG Sheets
- UnheaveN: ERA Palimpsest

## Objetivo
Oferecer um hub unico com acesso rapido aos dois sistemas, persistencia local e suporte offline.

## Estrutura atual
- `launcher.html`: hub principal de selecao de sistema.
- `index.html`: shell do Verloren (carrega modulos divididos em `js/verloren/*`).
- `era/index.html`: shell do ERA (carrega modulos Babel divididos por dominio).
- `js/verloren/`: modulo principal do Verloren, separado por responsabilidade.
- `systems/`: regras compartilhadas (dados, combate, turn economy, regras de sistema).
- `ui/`: componentes de UI especializados (ex.: workbench do Verloren).
- `core/`, `utils/`: base compartilhada e utilitarios.
- `sw.js`: Service Worker com cache shell/runtime/third-party.

## Modularizacao aplicada
- `js/app.js` virou facade de compatibilidade.
- Monolito do Verloren dividido em:
  - `js/verloren/00-data-theme-portrait.js`
  - `js/verloren/10-navigation-editor-core.js`
  - `js/verloren/20-races-presets-import.js`
  - `js/verloren/30-export-economy-engine-radar.js`
  - `js/verloren/40-world-system-grimorio.js`
  - `js/verloren/50-ficha-views-bootstrap.js`
- ERA dividido em:
  - `era-profiles.js`
  - `era-ficha-acervo.js` + `era-ficha-tab.js` (com `era-ficha.js` como facade)
  - `era-rolls-dados.js` + `era-rolls-combate.js` (com `era-rolls.js` como facade)
- `systems/actions.js` + `systems/turns.js` consolidados para uso principal em `systems/turn-economy.js`.

## Como executar localmente
Sem etapa de build obrigatoria.

Opcao 1:
```bash
python -m http.server 8080
```

Opcao 2:
```bash
npx serve .
```

Abra:
- `http://localhost:8080/launcher.html`

## Persistencia
- Dados salvos em `localStorage`.
- Estado, fichas e configuracoes ficam no navegador local.

## Validacao recente
- Checagem de handlers inline vs funcoes globais: OK.
- Checagem de sintaxe JS com Node (`--check`): PASS.
- Ordem de carga de scripts e split files revisada manualmente.

## Documentacao
- [Guia de Usuario](./GUIA_USUARIO.md)
- [Guia de Arquivos e Codigo](./GUIA_ARQUIVOS_E_CODIGO.md)
- [Log de mudancas feitas](./LOG_MUDANCAS_FEITAS.txt)
- [Log de mudancas a fazer](./LOG_MUDANCAS_A_FAZER.txt)
