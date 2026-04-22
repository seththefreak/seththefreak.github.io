# Guia de Arquivos e Partes do Codigo

Este guia mapeia para que serve cada area do projeto apos a modularizacao.

## 1) Entradas principais

- `launcher.html`
  - Hub do app.
  - Direciona para Verloren ou ERA.

- `index.html`
  - Shell do Verloren.
  - Carrega CSS, dados, sistemas compartilhados, UI e modulos `js/verloren/*`.

- `era/index.html`
  - Shell do ERA.
  - Carrega React/ReactDOM/Babel + modulos ERA separados.

- `manifest.json`
  - Configuracao PWA.

- `sw.js`
  - Service Worker.
  - Cache de shell, runtime e third-party.

## 2) Base compartilhada

- `core/companion-core.js`
  - Inicializa namespaces globais:
    - `CompanionCore`
    - `CompanionUtils`
    - `CompanionSystems`
    - `CompanionUI`

- `utils/common.js`
  - Helpers comuns:
    - clamp e parse seguro
    - normalizacao para busca
    - formatacao com sinal
    - escape HTML
    - utilitarios de agregacao

## 3) Sistemas (regras/engine)

- `systems/dice.js`
  - Parser de formulas e rolagem de dados.

- `systems/combat.js`
  - Estado de encontro/combatentes:
    - iniciativa
    - HP
    - condicoes
    - ordem de turno

- `systems/turn-economy.js`
  - Economia de acoes + fluxo de turno (arquivo consolidado).
  - Substitui uso direto de `systems/actions.js` e `systems/turns.js` no runtime atual.

- `systems/verloren.js`
  - Regras derivadas do Verloren:
    - atributos derivados
    - checks
    - dano
    - convertor ficha -> combatente

- `systems/actions.js` e `systems/turns.js`
  - Legados mantidos para compatibilidade.
  - Uso principal atual: `systems/turn-economy.js`.

## 4) UI especializada

- `ui/verloren-system-workbench.js`
  - Workbench de combate e rolagens na aba Sistema.
  - Estado local de encounter, testes e dano.
  - Sincroniza ficha ativa e HP do PC no tracker.

## 5) Verloren (modularizado)

- `js/app.js`
  - Facade de compatibilidade.
  - Nao contem mais o monolito principal.

- `js/verloren/00-data-theme-portrait.js`
  - Estado base, persistencia, tema, retrato e utilitarios globais.
  - Inclui wrappers seguros de inline handlers (tokens codificados).

- `js/verloren/10-navigation-editor-core.js`
  - Navegacao principal, biblioteca, cards, abertura de ficha e editor base.

- `js/verloren/20-races-presets-import.js`
  - Racas/subracas, progressao racial, presets e importacoes relacionadas.

- `js/verloren/30-export-economy-engine-radar.js`
  - Exportacao (preview/PDF/PNG), economia, inventario, equipamentos e radar.

- `js/verloren/40-world-system-grimorio.js`
  - Conteudo de sistema/mundo/grimorio/bestiario/metaflora.

- `js/verloren/50-ficha-views-bootstrap.js`
  - Views de ficha (compacta/expandida), bootstrap final e restauracao de estado.

- `js/data/*.js`
  - Banco de dados local do Verloren:
    - racas
    - presets
    - equipamentos
    - mundo
    - grimorio

- `js/pwa.js`
  - Fluxo de instalacao e update do PWA no cliente.

- `js/launcher.js`
  - Estado do hub e ultimo sistema acessado.

- `js/splash.js`
  - Splash de abertura.

## 6) ERA (modularizado)

- `era/data.js`
  - Dados e tabelas do sistema ERA.

- `era/era-shared.js`
  - Helpers visuais e de estado compartilhado entre abas ERA.

- `era/era-profiles.js`
  - Hidratacao/sanitizacao de personagens e perfis.

- `era/era-ficha-acervo.js`
  - Catalogo/acervo de habilidades e hooks auxiliares associados.

- `era/era-ficha-tab.js`
  - Aba Ficha (recursos, pilares, subs, condicoes, efeitos e pericias).

- `era/era-ficha.js`
  - Facade de compatibilidade.

- `era/era-rolls-dados.js`
  - Aba Dados (rolagens e historico).

- `era/era-rolls-combate.js`
  - Aba Combate (tracker, acoes, iniciativa, HP e arsenal de ataque).

- `era/era-rolls.js`
  - Facade de compatibilidade.

- `era/era-reference.js`
  - Aba de referencia/sistema.

- `era/era-app.js`
  - Composicao final da app ERA (header, tabs, roteamento interno e render root).

## 7) CSS

- `css/`
  - Estilos por area:
    - base/layout
    - biblioteca/editor
    - economia/inventario
    - sistema/mundo
    - workbench
    - PWA/launcher

## 8) Ordem de carga relevante

### Verloren (`index.html`)
1. `js/data/*.js`
2. `core/companion-core.js`
3. `utils/common.js`
4. `systems/dice.js`, `systems/turn-economy.js`, `systems/combat.js`, `systems/verloren.js`
5. `ui/verloren-system-workbench.js`
6. `js/verloren/00..50`
7. `js/app.js` (facade)
8. `js/pwa.js`

### ERA (`era/index.html`)
1. base compartilhada (`js/pwa.js`, core/utils/systems)
2. React/ReactDOM/Babel
3. `era/data.js`
4. `era-shared.js`
5. `era-profiles.js`
6. `era-ficha-acervo.js`, `era-ficha-tab.js`
7. `era-rolls-dados.js`, `era-rolls-combate.js`
8. facades (`era-ficha.js`, `era-rolls.js`)
9. `era-reference.js`
10. `era-app.js`

## 9) Revisao de codigo (resumo tecnico)

Principais ajustes de seguranca/consistencia aplicados:
- Mitigacao de injecao em handlers inline de cards (ID codificado).
- Correcoes no tracker de combate para persistencia do HP do PC.
- Correcoes de cache stale de ficha ativa no workbench.

Validacoes executadas:
- Checagem de referencias inline vs funcoes globais: OK.
- Checagem de sintaxe JS (`node --check`) nos arquivos nao-Babel: PASS.
