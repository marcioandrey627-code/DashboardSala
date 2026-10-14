# 🏫 Dashboard Smart Class

Painel web feito em **Python + Streamlit** para monitorar e controlar uma sala de aula inteligente. Os dados dos sensores são **simulados**, e o projeto pode ser integrado a um **Arduino** para usar leituras reais.

## ✨ Funcionalidades

- 📊 **Monitoramento em tempo real:** temperatura, umidade, luminosidade e presença
- 🤖 **Modo automático:** liga e desliga o ar-condicionado e a luz conforme regras configuráveis
- 🖐️ **Modo manual:** controle do ar e da luz por botões
- ⏻ **Desligar tudo:** botão para desligar ar e luz de uma vez, quando não há aula
- ⚠️ **Alertas:** temperatura alta, ar seco, umidade alta e equipamentos ligados com a sala vazia
- 📈 **Histórico em gráficos** e download dos dados em CSV
- 📋 **Registro de eventos** com o horário de cada ação
- 🔄 **Atualização automática** com intervalo ajustável
- ⚙️ **Configurações na barra lateral:** limites de temperatura e luminosidade

## 🛠️ Tecnologias

- Python 3
- [Streamlit](https://streamlit.io/)
- [Pandas](https://pandas.pydata.org/)

## ▶️ Como executar

1. Instale as dependências:

```bash
pip install -U streamlit pandas
```

2. Rode o painel:

```bash
streamlit run dashboard.py
```

3. Abra o endereço mostrado no terminal (normalmente `http://localhost:8501`).

> Requer Streamlit 1.37 ou superior.

## 🧠 Como a automação funciona

| Equipamento | Liga quando | Desliga quando |
|---|---|---|
| ❄️ Ar-condicionado | temperatura acima do limite e há pessoas | temperatura 2 °C abaixo do limite, ou sala vazia |
| 💡 Luz | luminosidade abaixo do limite e há pessoas | luminosidade 20 pontos acima do limite, ou sala vazia |

Os limites são ajustados na barra lateral. A diferença entre ligar e desligar (histerese) evita que os equipamentos fiquem ligando e desligando toda hora.

## 🔌 Integração com Arduino (opcional)

O Arduino lê os sensores e envia os dados ao Python (por USB/serial ou WiFi), e o painel devolve os comandos de ligar e desligar.

```
Sensores ──► Arduino ──► USB ou WiFi ──► Python/Streamlit ──► Navegador
                ▲                              │
                └──── comandos ligar/desligar ─┘
```

Esta parte ainda não está no código atual, que usa dados simulados.

## 📁 Estrutura

```
.
├── dashboard.py   # aplicação principal
└── README.md
```

## 📌 Status

Projeto em desenvolvimento, criado para estudo e demonstração.
