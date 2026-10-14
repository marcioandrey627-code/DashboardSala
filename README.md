# Dashboard de Monitoramento de Sala 🏫

Aplicação web demonstrativa para acompanhar condições de uma sala, visualizar leituras simuladas de sensores e testar regras de automação de iluminação e ar-condicionado.

> **Estado atual:** protótipo com dados simulados. **Não há integração real com sensores, Arduino, ar-condicionado ou iluminação.** Os comandos são apenas registrados no console do navegador.

## Funcionalidades

- **Sensores simulados:** temperatura, umidade, luminosidade e quantidade de pessoas.
- **Visão geral:** valores recentes, indicação de estado e alertas.
- **Gráficos:** histórico de um sensor selecionado e histórico de presença (desenhados em Canvas).
- **Controle manual:** simulação dos comandos de ligar/desligar ar e luz.
- **Modo automático:** aplica regras de temperatura, luminosidade e presença.
- **Atualização:** botão para nova leitura ou atualização automática com intervalo configurável.
- **Histórico:** exportação das leituras em CSV, limpeza do histórico e registro dos últimos eventos.
- **Layout responsivo:** adapta-se a telas menores.

## Tecnologias

HTML5, CSS3 e JavaScript puro, sem frameworks e sem necessidade de instalar dependências.

## Como executar

1. Baixe ou clone este repositório.
2. Mantenha `index.html`, `dashboard_css.css` e `dashboard.js` na **mesma pasta**.
3. Abra `index.html` no navegador ou use a extensão **Live Server** no Visual Studio Code (clique com o botão direito no arquivo e escolha **Open with Live Server**).
4. Teste o botão **Atualizar agora**, as abas **Sensores**, **Controles** e **Verificação**.

Também é possível publicar os arquivos estáticos usando **GitHub Pages** (veja a seção *Publicação*).

## Estrutura

```text
dashboard-monitoramento-sala/
├── index.html           # Elementos e estrutura das telas
├── dashboard_css.css    # Estilo, layout e responsividade
├── dashboard.js         # Estado, sensores simulados, regras, gráficos e eventos
├── README.md            # Instruções e documentação
└── CONTRIBUTING.md      # Orientações para colaborar
```

## Como funciona

1. `index.html` carrega os estilos e o script.
2. Ao iniciar, `dashboard.js` gera a primeira leitura simulada.
3. O painel atualiza indicadores, alertas e gráficos.
4. A opção **Atualizar agora** produz outra leitura. A atualização automática é opcional.
5. No modo automático, as regras decidem ligar/desligar os **estados simulados** de ar e luz conforme presença, temperatura e luminosidade.

### Regras de automação

- **Sala vazia:** ar e luz são desligados pelo modo automático.
- **Ar:** se houver pessoas, liga quando a temperatura está acima do limite escolhido; desliga quando cai abaixo de `limite - 2 °C`.
- **Luz:** se houver pessoas, liga quando a luminosidade está abaixo do limite escolhido; desliga quando supera `limite + 20`.
- Essas faixas evitam alternâncias constantes próximas ao limite (histerese).
- Se o modo automático estiver ligado, os botões individuais de ar e luz ficam desativados.
- O botão **Desligar tudo (sem aula)** também desativa o modo automático.

## Arquivos e pontos importantes do código

| Arquivo | Responsabilidade | Onde procurar |
| --- | --- | --- |
| `index.html` | Campos, botões, abas, canvases e IDs | `head`, seções de cada aba |
| `dashboard_css.css` | Aparência e adaptação para celular | `.sidebar`, `.banner`, `.metricas`, `@media` |
| `dashboard.js` | Estado da aplicação | objeto `estado` |
| `dashboard.js` | Geração de dados fictícios | `lerSensores()` |
| `dashboard.js` | Regras automáticas | `aplicarAutomacao()` |
| `dashboard.js` | Renderização e gráficos | `desenhar()` e `desenharGraficos()` |
| `dashboard.js` | Eventos e cliques | `iniciar()` |
| `dashboard.js` | Integração futura com hardware | `enviarComando()` (hoje apenas `console.log`) |

## Limitações atuais

- Valores de sensores, incluindo o número de pessoas, são **fictícios**.
- Não existe backend ou banco de dados; o histórico fica em memória e reinicia ao recarregar a página.
- Não há autenticação nem integração física com dispositivos.
- A exportação CSV gera um arquivo com as leituras da sessão atual.

## Próximas etapas possíveis

- Integrar um dispositivo real ou API para receber leituras.
- Persistir histórico em uma base de dados.
- Adicionar testes automatizados e melhorar acessibilidade.
- Documentar esquema de comunicação e segurança antes de controlar equipamentos reais.

## Publicação com GitHub Pages

Em **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/(root)`, e salve. O GitHub exibirá o endereço do site quando a publicação terminar. Não publique senhas, tokens ou dados pessoais no repositório ou no site.

## Trabalho em equipe

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) antes de alterar arquivos. Use **Issues** para registrar tarefas e **Pull Requests** para propor mudanças.

## Créditos

Projeto desenvolvido pela equipe responsável pelo Dashboard de Monitoramento de Sala. Adicione aqui os nomes e as responsabilidades que cada integrante autorizar publicar.
