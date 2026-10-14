
"use strict";

// ==========================================
// DASHBOARD - SENSORES E COMANDOS DE VOZ
// ==========================================

const $ = (id) => document.getElementById(id);

const LIMITE_HISTORICO = 100;
const LIMITE_EVENTOS = 15;

const NOMES = {
  arLigado: ["Ar-condicionado", "ligado", "desligado"],
  luzLigada: ["Luz", "ligada", "desligada"]
};

const estado = {
  sensores: null,
  historico: [],
  eventos: [],
  arLigado: false,
  luzLigada: false,
  modoAuto: false,
  tempAlta: 28,
  luxBaixa: 40,
  autoRefresh: false,
  intervalo: 5
};

let temporizador = null;
let controleVoz = null;

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function aleatorio(min, max) {
  return min + Math.random() * (max - min);
}

function inteiroAleatorio(min, max) {
  return Math.floor(aleatorio(min, max + 1));
}

function arredondar(valor, casas = 1) {
  return Number(valor.toFixed(casas));
}

// ==========================================
// SENSORES SIMULADOS
// ==========================================

function lerSensores(anterior = null) {
  if (!anterior) {
    return {
      temperatura: arredondar(aleatorio(20, 30)),
      umidade: inteiroAleatorio(40, 70),
      luminosidade: inteiroAleatorio(30, 80),
      pessoas: inteiroAleatorio(0, 30)
    };
  }

  return {
    temperatura: arredondar(limitar(
      anterior.temperatura + aleatorio(-1, 1), 16, 32
    )),
    umidade: limitar(
      anterior.umidade + inteiroAleatorio(-3, 3), 30, 90
    ),
    luminosidade: limitar(
      anterior.luminosidade + inteiroAleatorio(-8, 8), 10, 100
    ),
    pessoas: limitar(
      anterior.pessoas + inteiroAleatorio(-4, 4), 0, 40
    )
  };
}

// Atualmente registra comandos simulados.
// Integração com Arduino pode ser adicionada aqui.
function enviarComando(chave, valor) {
  const prefixo = chave === "arLigado" ? "AR" : "LUZ";
  console.log(`[SIMULAÇÃO] ${prefixo}:${valor ? 1 : 0}`);
}

// ==========================================
// EVENTOS E CONTROLES
// ==========================================

function registrarEvento(texto) {
  const hora = new Date().toLocaleTimeString("pt-BR");

  estado.eventos.unshift({ hora, texto });
  estado.eventos.splice(LIMITE_EVENTOS);
}

function definir(chave, valor, motivo) {
  if (estado[chave] === valor) return;

  estado[chave] = valor;

  const [nome, ligado, desligado] = NOMES[chave];

  registrarEvento(
    `${nome} ${valor ? ligado : desligado} (${motivo})`
  );

  enviarComando(chave, valor);
}

function aplicarAutomacao(leitura) {
  const temGente = leitura.pessoas > 0;

  if (!temGente) {
    definir("arLigado", false, "sala vazia");
    definir("luzLigada", false, "sala vazia");
    return;
  }

  // Histerese: evita ligar e desligar sem parar.
  if (leitura.temperatura > estado.tempAlta) {
    definir("arLigado", true, "temperatura alta");
  } else if (leitura.temperatura < estado.tempAlta - 2) {
    definir("arLigado", false, "temperatura normal");
  }

  if (leitura.luminosidade < estado.luxBaixa) {
    definir("luzLigada", true, "pouca luz");
  } else if (leitura.luminosidade > estado.luxBaixa + 20) {
    definir("luzLigada", false, "luz suficiente");
  }
}

function atualizarSensores() {
  estado.sensores = lerSensores(estado.sensores);

  estado.historico.push({
    hora: new Date(),
    ...estado.sensores
  });

  if (estado.historico.length > LIMITE_HISTORICO) {
    estado.historico.shift();
  }

  if (estado.modoAuto) {
    aplicarAutomacao(estado.sensores);
  }
}

function atualizarAgora() {
  atualizarSensores();
  desenhar();
}

function alternar(chave) {
  definir(chave, !estado[chave], "manual");
  desenhar();
}

function mudarModoAuto(ligado) {
  estado.modoAuto = ligado;

  registrarEvento(
    `Modo automático ${ligado ? "ligado" : "desligado"}`
  );

  if (ligado) aplicarAutomacao(estado.sensores);

  desenhar();
}

function desligarTudo() {
  if (estado.modoAuto) {
    estado.modoAuto = false;
    registrarEvento("Modo automático desligado");
  }

  definir("arLigado", false, "desligar tudo");
  definir("luzLigada", false, "desligar tudo");

  desenhar();
}

function limparHistorico() {
  estado.historico = estado.historico.slice(-1);
  desenhar();
}

function baixarCsv() {
  const linhas = [
    "hora,temperatura,umidade,luminosidade,pessoas"
  ];

  for (const leitura of estado.historico) {
    linhas.push([
      leitura.hora.toISOString(),
      leitura.temperatura,
      leitura.umidade,
      leitura.luminosidade,
      leitura.pessoas
    ].join(","));
  }

  const blob = new Blob(
    [linhas.join("\n")],
    { type: "text/csv;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "historico.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function configurarTemporizador() {
  clearInterval(temporizador);

  if (estado.autoRefresh) {
    temporizador = setInterval(
      atualizarAgora,
      estado.intervalo * 1000
    );
  }
}

// ==========================================
// ALERTAS
// ==========================================

function calcularAlertas(sensor) {
  const alertas = [];

  if (sensor.temperatura > estado.tempAlta) {
    alertas.push("🌡️ Temperatura muito alta");
  }

  if (sensor.umidade < 40) {
    alertas.push("💧 Ar muito seco");
  }

  if (sensor.umidade > 75) {
    alertas.push("💧 Umidade muito alta");
  }

  if (
    sensor.pessoas === 0 &&
    (estado.arLigado || estado.luzLigada)
  ) {
    alertas.push("⚡ Equipamentos ligados com sala vazia");
  }

  return alertas;
}

// ==========================================
// GRÁFICOS
// ==========================================

function desenharGrafico(canvas, valores, cor, casas = 0) {
  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;

  if (!largura || !altura || !valores.length) return;

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(largura * dpr);
  canvas.height = Math.round(altura * dpr);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, largura, altura);

  const margem = {
    esquerda: 46,
    direita: 14,
    topo: 14,
    baixo: 20
  };

  const w = largura - margem.esquerda - margem.direita;
  const h = altura - margem.topo - margem.baixo;

  if (w <= 0 || h <= 0) return;

  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);

  if (minimo === maximo) {
    minimo -= 1;
    maximo += 1;
  }

  const folga = (maximo - minimo) * 0.1;
  minimo -= folga;
  maximo += folga;

  const x = (i) => margem.esquerda +
    (valores.length === 1
      ? w / 2
      : (i / (valores.length - 1)) * w);

  const y = (v) => margem.topo + h -
    ((v - minimo) / (maximo - minimo)) * h;

  ctx.font = "12px sans-serif";
  ctx.lineWidth = 1;

  // Grade e valores verticais.
  for (let i = 0; i <= 4; i++) {
    const valor = minimo + ((maximo - minimo) * i) / 4;
    const py = y(valor);

    ctx.strokeStyle = "rgba(148,163,184,0.35)";
    ctx.beginPath();
    ctx.moveTo(margem.esquerda, py);
    ctx.lineTo(largura - margem.direita, py);
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(
      valor.toFixed(casas),
      margem.esquerda - 6,
      py
    );
  }

  // Linha do gráfico.
  ctx.strokeStyle = cor;
  ctx.lineWidth = 2;
  ctx.beginPath();

  valores.forEach((valor, i) => {
    if (i === 0) ctx.moveTo(x(i), y(valor));
    else ctx.lineTo(x(i), y(valor));
  });

  ctx.stroke();

  // Ponto mais recente.
  const ultimo = valores.length - 1;

  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.arc(x(ultimo), y(valores[ultimo]), 4, 0, Math.PI * 2);
  ctx.fill();
}

function desenharGraficos() {
  const sensor = $("sensor-grafico").value;

  desenharGrafico(
    $("grafico-sensor"),
    estado.historico.map((l) => l[sensor]),
    "#2563eb",
    sensor === "temperatura" ? 1 : 0
  );

  desenharGrafico(
    $("grafico-pessoas"),
    estado.historico.map((l) => l.pessoas),
    "#06b6d4",
    0
  );
}

// ==========================================
// ATUALIZAÇÃO VISUAL
// ==========================================

function mostrarDelta(id, valor, texto, inverso = false) {
  const elemento = $(id);

  if (valor === null) {
    elemento.textContent = "";
    elemento.className = "delta";
    return;
  }

  const bom = inverso ? valor < 0 : valor > 0;

  elemento.textContent =
    `${valor > 0 ? "▲" : valor < 0 ? "▼" : "•"} ${texto}`;

  elemento.className = valor === 0
    ? "delta neutro"
    : `delta ${bom ? "bom" : "ruim"}`;
}

function mostrarPill(id, ligado, textoLigado, textoDesligado) {
  const elemento = $(id);

  elemento.className = `pill ${ligado ? "on" : "off"}`;
  elemento.textContent = ligado
    ? `🟢 ${textoLigado}`
    : `⚫ ${textoDesligado}`;
}

function desenhar() {
  const s = estado.sensores;
  const hist = estado.historico;
  if (!s) return;

  const alertas = calcularAlertas(s);

  $("banner-status").textContent = alertas.length
    ? `🟠 ${alertas.length} alerta(s)`
    : "🟢 Tudo normal";

  $("banner-modo").textContent = estado.modoAuto
    ? "🤖 Automático"
    : "🖐️ Manual";

  $("banner-hora").textContent =
    `🕒 ${hist[hist.length - 1].hora.toLocaleTimeString("pt-BR")}`;

  $("m-temp").textContent = `${s.temperatura.toFixed(1)} °C`;
  $("m-umid").textContent = `${s.umidade} %`;
  $("m-lux").textContent = `${s.luminosidade} %`;

  $("m-presenca").textContent =
    s.pessoas > 0 ? "Tem pessoas" : "Não tem";

  const anterior = hist.length > 1
    ? hist[hist.length - 2]
    : null;

  const difTemp = anterior
    ? arredondar(s.temperatura - anterior.temperatura)
    : null;

  mostrarDelta(
    "m-temp-delta",
    difTemp,
    difTemp === null ? "" : `${difTemp.toFixed(1)} °C`,
    true
  );

  $("m-pessoas").textContent = s.pessoas;

  const difPessoas = anterior
    ? s.pessoas - anterior.pessoas
    : null;

  mostrarDelta(
    "m-pessoas-delta",
    difPessoas,
    difPessoas === null ? "" : String(difPessoas)
  );

  // Alertas.
  const caixa = $("alertas");
  caixa.replaceChildren();

  if (alertas.length === 0) {
    const div = document.createElement("div");
    div.className = "alerta ok";
    div.textContent = "Tudo normal";
    caixa.appendChild(div);
  } else {
    alertas.forEach((texto) => {
      const div = document.createElement("div");
      div.className = "alerta aviso";
      div.textContent = texto;
      caixa.appendChild(div);
    });
  }

  // Controles.
  $("modo-auto").checked = estado.modoAuto;

  mostrarPill(
    "pill-ar", estado.arLigado, "LIGADO", "DESLIGADO"
  );

  mostrarPill(
    "pill-luz", estado.luzLigada, "LIGADA", "DESLIGADA"
  );

  $("btn-ar").disabled = estado.modoAuto;
  $("btn-luz").disabled = estado.modoAuto;

  // Registro de eventos.
  const lista = $("lista-eventos");
  lista.replaceChildren();

  if (estado.eventos.length === 0) {
    const p = document.createElement("p");
    p.className = "vazio";
    p.textContent = "Nenhum evento ainda.";
    lista.appendChild(p);
  } else {
    estado.eventos.forEach((evento) => {
      const div = document.createElement("div");
      div.className = "evento";

      const b = document.createElement("b");
      b.textContent = evento.hora;

      div.appendChild(b);
      div.appendChild(
        document.createTextNode(` ${evento.texto}`)
      );

      lista.appendChild(div);
    });
  }

  desenharGraficos();
}

function mostrarAba(nome) {
  document.querySelectorAll(".aba-btn").forEach((botao) => {
    botao.classList.toggle(
      "ativa",
      botao.dataset.aba === nome
    );
  });

  document.querySelectorAll(".aba").forEach((secao) => {
    secao.classList.toggle(
      "ativa",
      secao.id === `aba-${nome}`
    );
  });

  desenharGraficos();
}

// ==========================================
// RECONHECIMENTO DE VOZ
// ==========================================

class VozController {
  static suportado() {
    return Boolean(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );
  }

  constructor({ onStatus, onTranscript, onSpeech, onCommand }) {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      throw new Error("Reconhecimento de voz indisponível");
    }

    this.reconhecimento = new Recognition();
    this.reconhecimento.lang = "pt-BR";
    this.reconhecimento.continuous = false;
    this.reconhecimento.interimResults = true;

    this.ativo = false;
    this.onStatus = onStatus;
    this.onTranscript = onTranscript;
    this.onSpeech = onSpeech;
    this.onCommand = onCommand;

    this.reconhecimento.onstart = () => {
      this.ativo = true;
      this.onStatus("Ouvindo...");
      this.onSpeech(true);
    };

    this.reconhecimento.onend = () => {
      this.ativo = false;
      this.onSpeech(false);
      this.onStatus("Microfone desligado");
    };

    this.reconhecimento.onerror = (evento) => {
      this.ativo = false;
      this.onSpeech(false);
      this.onStatus(`Erro no microfone: ${evento.error}`);
    };

    this.reconhecimento.onresult = (evento) => {
      const resultados = Array.from(evento.results);

      const texto = resultados
        .map((r) => r[0].transcript)
        .join(" ");

      this.onTranscript(texto);

      // Só executa comandos quando a fala for finalizada.
      const finais = resultados.filter((r) => r.isFinal);
      if (!finais.length) return;

      const falaFinal = finais
        .map((r) => r[0].transcript)
        .join(" ");

      const comando = VozController.identificarComando(falaFinal);

      if (comando) {
        this.onCommand(comando);
        this.onStatus(`Comando recebido: ${falaFinal.trim()}`);
      } else {
        this.onStatus("Comando não reconhecido");
      }
    };
  }

  static identificarComando(texto) {
    const frase = texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const ligar = /\b(ligar|liga|acender|acenda)\b/.test(frase);
    const desligar = /\b(desligar|desliga|apagar|apague)\b/.test(frase);

    const ar = /\b(ar|ar-condicionado|climatizacao)\b/.test(frase);
    const luz = /\b(luz|luzes|iluminacao)\b/.test(frase);

    // Desligar é analisado antes de ligar.
    if (desligar && ar) return "desligar_ar";
    if (desligar && luz) return "desligar_luz";
    if (ligar && ar) return "ligar_ar";
    if (ligar && luz) return "ligar_luz";

    if (/\b(simular|atualizar|atualize)\b/.test(frase)) {
      return "simular";
    }

    return null;
  }

  iniciar() {
    if (this.ativo) return;

    try {
      this.reconhecimento.start();
      this.onStatus("Solicitando microfone...");
    } catch (erro) {
      this.onStatus(`Não foi possível iniciar: ${erro.message}`);
    }
  }

  parar() {
    this.reconhecimento.stop();
  }
}

// ==========================================
// INTEGRAÇÃO DA VOZ COM O DASHBOARD
// ==========================================

function configurarVoz() {
  const widget = $("voz-widget");
  const botao = $("btn-voz");
  const status = $("voz-status");
  const transcricao = $("voz-texto");

  if (!VozController.suportado()) {
    botao.disabled = true;
    status.textContent = "Voz não suportada neste navegador";
    return;
  }

  controleVoz = new VozController({
    onStatus(mensagem) {
      status.textContent = mensagem;
      botao.textContent = controleVoz.ativo
        ? "⏹ Parar voz"
        : "🎙️ Iniciar voz";

      botao.setAttribute(
        "aria-pressed",
        String(controleVoz.ativo)
      );
    },

    onTranscript(texto) {
      transcricao.textContent = texto;
    },

    onSpeech(falando) {
      widget.classList.toggle("falando", falando);
    },

    onCommand(comando) {
      const comandosManuais = [
        "ligar_ar",
        "desligar_ar",
        "ligar_luz",
        "desligar_luz"
      ];

      // Interrompe a automação se houver comando manual.
      if (comandosManuais.includes(comando) && estado.modoAuto) {
        estado.modoAuto = false;
        registrarEvento(
          "Modo automático desligado (comando de voz)"
        );
      }

      switch (comando) {
        case "ligar_ar":
          definir("arLigado", true, "comando de voz");
          desenhar();
          break;

        case "desligar_ar":
          definir("arLigado", false, "comando de voz");
          desenhar();
          break;

        case "ligar_luz":
          definir("luzLigada", true, "comando de voz");
          desenhar();
          break;

        case "desligar_luz":
          definir("luzLigada", false, "comando de voz");
          desenhar();
          break;

        case "simular":
          atualizarAgora();
          break;
      }
    }
  });

  botao.addEventListener("click", () => {
    if (controleVoz.ativo) {
      controleVoz.parar();
    } else {
      controleVoz.iniciar();
    }
  });
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

function iniciar() {
  $("temp-alta").addEventListener("input", (e) => {
    estado.tempAlta = Number(e.target.value);
    $("temp-alta-valor").textContent = estado.tempAlta;
    desenhar();
  });

  $("lux-baixa").addEventListener("input", (e) => {
    estado.luxBaixa = Number(e.target.value);
    $("lux-baixa-valor").textContent = estado.luxBaixa;
    desenhar();
  });

  $("auto-refresh").addEventListener("change", (e) => {
    estado.autoRefresh = e.target.checked;
    $("intervalo").disabled = !estado.autoRefresh;
    configurarTemporizador();
  });

  $("intervalo").addEventListener("input", (e) => {
    estado.intervalo = Number(e.target.value);
    $("intervalo-valor").textContent = estado.intervalo;
    configurarTemporizador();
  });

  $("btn-atualizar").addEventListener(
    "click", atualizarAgora
  );

  $("btn-baixar").addEventListener(
    "click", baixarCsv
  );

  $("btn-limpar").addEventListener(
    "click", limparHistorico
  );

  $("btn-desligar-tudo").addEventListener(
    "click", desligarTudo
  );

  $("btn-ar").addEventListener("click", () => {
    alternar("arLigado");
  });

  $("btn-luz").addEventListener("click", () => {
    alternar("luzLigada");
  });

  $("modo-auto").addEventListener("change", (e) => {
    mudarModoAuto(e.target.checked);
  });

  $("sensor-grafico").addEventListener(
    "change", desenharGraficos
  );

  document.querySelectorAll(".aba-btn").forEach((botao) => {
    botao.addEventListener("click", () => {
      mostrarAba(botao.dataset.aba);
    });
  });

  window.addEventListener("resize", desenharGraficos);

  atualizarSensores();
  desenhar();
  configurarVoz();
}

document.addEventListener("DOMContentLoaded", iniciar);
