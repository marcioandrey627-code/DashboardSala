"use strict";

/* =====================================================================
   DASHBOARD TESTE - lógica da aplicação (JavaScript)
   Conversão do dashboard.py (Streamlit) para HTML + CSS + JS.
   ===================================================================== */

// ---------- constantes ----------
const LIMITE_HISTORICO = 100;   // leituras guardadas
const LIMITE_EVENTOS = 15;      // eventos guardados no registro
const COR_GRAFICO = "#2563eb";
const COR_GRAFICO_PESSOAS = "#06b6d4";

// [nome, texto ligado, texto desligado]
const NOMES = {
  arLigado: ["Ar-condicionado", "ligado", "desligado"],
  luzLigada: ["Luz", "ligada", "desligada"],
};

// ---------- estado (equivale ao st.session_state do Python) ----------
const estado = {
  sensores: null,
  historico: [],
  eventos: [],
  arLigado: false,
  luzLigada: false,
  modoAuto: false,
  // configurações da barra lateral
  tempAlta: 28,
  luxBaixa: 40,
  autoRefresh: false,
  intervalo: 5,
};

let temporizador = null;   // guarda o setInterval da atualização automática

// atalho: $("id") em vez de document.getElementById("id")
const $ = (id) => document.getElementById(id);


// =====================================================================
// FUNÇÕES AUXILIARES
// =====================================================================
function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function aleatorio(min, max) {            // decimal entre min e max
  return min + Math.random() * (max - min);
}

function inteiroAleatorio(min, max) {     // inteiro entre min e max (inclusive)
  return Math.floor(aleatorio(min, max + 1));
}

function arredondar(valor, casas) {
  return Number(valor.toFixed(casas));
}


// =====================================================================
// SENSORES (simulados)
// =====================================================================
function lerSensores(anterior = null) {
  if (anterior === null) {
    return {
      temperatura: arredondar(aleatorio(20, 30), 1),
      umidade: inteiroAleatorio(40, 70),
      luminosidade: inteiroAleatorio(30, 80),
      pessoas: inteiroAleatorio(0, 30),
    };
  }
  return {
    temperatura: arredondar(limitar(anterior.temperatura + aleatorio(-1, 1), 16, 32), 1),
    umidade: limitar(anterior.umidade + inteiroAleatorio(-3, 3), 30, 90),
    luminosidade: limitar(anterior.luminosidade + inteiroAleatorio(-8, 8), 10, 100),
    pessoas: limitar(anterior.pessoas + inteiroAleatorio(-4, 4), 0, 40),
  };
}

// Ponto de integração com o Arduino: quando houver hardware real,
// este é o lugar de enviar o comando (ex.: fetch para "/ar/1" ou "AR:1" na serial).
function enviarComando(chave, valor) {
  const prefixo = chave === "arLigado" ? "AR" : "LUZ";
  console.log(`[comando] ${prefixo}:${valor ? 1 : 0}`);
}


// =====================================================================
// EVENTOS, AUTOMAÇÃO E CONTROLES
// =====================================================================
function registrarEvento(texto) {
  const hora = new Date().toLocaleTimeString("pt-BR");
  estado.eventos.unshift({ hora, texto });   // mais novo primeiro
  estado.eventos.splice(LIMITE_EVENTOS);     // descarta o que passar do limite
}

// Muda o ar/luz e registra o evento, mas só se o estado realmente mudou.
function definir(chave, valor, motivo) {
  if (estado[chave] !== valor) {
    estado[chave] = valor;
    const [nome, ligado, desligado] = NOMES[chave];
    registrarEvento(`${nome} ${valor ? ligado : desligado} (${motivo})`);
    enviarComando(chave, valor);
  }
}

function aplicarAutomacao(leitura) {
  const alta = estado.tempAlta;
  const baixa = estado.luxBaixa;
  const temGente = leitura.pessoas > 0;

  // Ar: liga acima do limite, só desliga 2 °C abaixo (evita liga/desliga toda hora)
  if (!temGente) {
    definir("arLigado", false, "sala vazia");
  } else if (leitura.temperatura > alta) {
    definir("arLigado", true, "temperatura alta");
  } else if (leitura.temperatura < alta - 2) {
    definir("arLigado", false, "temperatura ok");
  }

  // Luz: liga abaixo do limite, só desliga 20 pontos acima
  if (!temGente) {
    definir("luzLigada", false, "sala vazia");
  } else if (leitura.luminosidade < baixa) {
    definir("luzLigada", true, "pouca luz");
  } else if (leitura.luminosidade > baixa + 20) {
    definir("luzLigada", false, "luz suficiente");
  }
}

function atualizarSensores() {
  const nova = lerSensores(estado.sensores);
  estado.sensores = nova;
  estado.historico.push({ hora: new Date(), ...nova });
  if (estado.historico.length > LIMITE_HISTORICO) {
    estado.historico.splice(0, estado.historico.length - LIMITE_HISTORICO);
  }
  if (estado.modoAuto) {
    aplicarAutomacao(nova);
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
  if (ligado) {
    registrarEvento("Modo automático ligado");
    aplicarAutomacao(estado.sensores);
  } else {
    registrarEvento("Modo automático desligado");
  }
  desenhar();
}

// Botão "sem aula": sai do modo automático e desliga ar e luz.
function desligarTudo() {
  if (estado.modoAuto) {
    // Sem isso, a automação ligaria tudo de novo na próxima leitura
    estado.modoAuto = false;
    registrarEvento("Modo automático desligado");
  }
  definir("arLigado", false, "botão desligar tudo");
  definir("luzLigada", false, "botão desligar tudo");
  desenhar();
}

function limparHistorico() {
  estado.historico = estado.historico.slice(-1);   // mantém a última leitura
  desenhar();
}

function baixarCsv() {
  const linhas = ["hora,temperatura,umidade,luminosidade,pessoas"];
  for (const l of estado.historico) {
    linhas.push([l.hora.toISOString(), l.temperatura, l.umidade, l.luminosidade, l.pessoas].join(","));
  }
  const blob = new Blob([linhas.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "historico.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Liga/desliga a atualização automática (equivale ao run_every do Streamlit).
function configurarTemporizador() {
  clearInterval(temporizador);
  temporizador = null;
  if (estado.autoRefresh) {
    temporizador = setInterval(atualizarAgora, estado.intervalo * 1000);
  }
}


// =====================================================================
// ALERTAS
// =====================================================================
function calcularAlertas(s) {
  const alertas = [];
  if (s.temperatura > estado.tempAlta) alertas.push("🌡️ Temperatura muito alta");
  if (s.umidade < 40) alertas.push("💧 Ar muito seco");
  if (s.umidade > 75) alertas.push("💧 Umidade muito alta");
  if (s.pessoas === 0 && (estado.arLigado || estado.luzLigada)) {
    alertas.push("⚡ Ar ou luz ligados com a sala vazia");
  }
  return alertas;
}


// =====================================================================
// GRÁFICO (desenhado à mão no <canvas>, sem bibliotecas)
// =====================================================================
function desenharGrafico(canvas, valores, cor, casas) {
  const largura = canvas.clientWidth;
  const altura = canvas.clientHeight;
  if (largura === 0 || altura === 0) return;   // aba escondida: nada a desenhar

  const dpr = window.devicePixelRatio || 1;    // deixa nítido em telas de alta resolução
  canvas.width = largura * dpr;
  canvas.height = altura * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, largura, altura);

  const margemEsq = 46, margemDir = 14, margemTopo = 14, margemBase = 14;
  const w = largura - margemEsq - margemDir;
  const h = altura - margemTopo - margemBase;

  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) { min -= 1; max += 1; }
  const folga = (max - min) * 0.1;
  min -= folga;
  max += folga;

  const x = (i) => margemEsq + (valores.length === 1 ? w / 2 : (i / (valores.length - 1)) * w);
  const y = (v) => margemTopo + h - ((v - min) / (max - min)) * h;

  // linhas de grade + números do eixo vertical
  ctx.font = "12px sans-serif";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const py = y(v);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.beginPath();
    ctx.moveTo(margemEsq, py);
    ctx.lineTo(largura - margemDir, py);
    ctx.stroke();
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(v.toFixed(casas), margemEsq - 6, py);
  }

  // a linha dos dados
  ctx.strokeStyle = cor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  valores.forEach((v, i) => {
    if (i === 0) ctx.moveTo(x(i), y(v));
    else ctx.lineTo(x(i), y(v));
  });
  ctx.stroke();

  // bolinha na leitura mais recente
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.arc(x(valores.length - 1), y(valores[valores.length - 1]), 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function desenharGraficos() {
  const sensor = $("sensor-grafico").value;
  desenharGrafico($("grafico-sensor"), estado.historico.map((l) => l[sensor]),
                  COR_GRAFICO, sensor === "temperatura" ? 1 : 0);
  desenharGrafico($("grafico-pessoas"), estado.historico.map((l) => l.pessoas),
                  COR_GRAFICO_PESSOAS, 0);
}


// =====================================================================
// DESENHAR A TELA (lê o estado e atualiza o HTML)
// =====================================================================
// Mostra a variação (▲ / ▼) com cor. "inverso" = subir é ruim (ex.: temperatura).
function mostrarDelta(id, valor, texto, inverso) {
  const el = $(id);
  if (valor === null) {
    el.textContent = "";
    el.className = "delta";
    return;
  }
  let classe = "neutro";
  if (valor !== 0) {
    const bom = inverso ? valor < 0 : valor > 0;
    classe = bom ? "bom" : "ruim";
  }
  el.textContent = `${valor > 0 ? "▲" : valor < 0 ? "▼" : "•"} ${texto}`;
  el.className = `delta ${classe}`;
}

function mostrarPill(id, ligado, textoLigado, textoDesligado) {
  const el = $(id);
  el.className = `pill ${ligado ? "on" : "off"}`;
  el.textContent = ligado ? `🟢 ${textoLigado}` : `⚫ ${textoDesligado}`;
}

function desenhar() {
  const s = estado.sensores;
  const hist = estado.historico;
  const alertas = calcularAlertas(s);

  // banner
  $("banner-status").textContent = alertas.length ? `🟠 ${alertas.length} alerta(s)` : "🟢 Tudo normal";
  $("banner-modo").textContent = estado.modoAuto ? "🤖 Automático" : "🖐️ Manual";
  $("banner-hora").textContent = `🕒 ${hist[hist.length - 1].hora.toLocaleTimeString("pt-BR")}`;

  // métricas
  const variacao = hist.length > 1
    ? arredondar(s.temperatura - hist[hist.length - 2].temperatura, 1)
    : null;
  $("m-temp").textContent = `${s.temperatura.toFixed(1)} °C`;
  mostrarDelta("m-temp-delta", variacao,
               variacao === null ? "" : `${variacao > 0 ? "+" : ""}${variacao.toFixed(1)} °C`, true);
  $("m-umid").textContent = `${s.umidade} %`;
  $("m-lux").textContent = `${s.luminosidade} %`;
  $("m-presenca").textContent = s.pessoas > 0 ? "Tem pessoas" : "Não tem";

  // alertas
  const caixa = $("alertas");
  caixa.innerHTML = "";
  if (alertas.length > 0) {
    for (const texto of alertas) {
      const div = document.createElement("div");
      div.className = "alerta aviso";
      div.textContent = texto;
      caixa.appendChild(div);
    }
  } else {
    const div = document.createElement("div");
    div.className = "alerta ok";
    div.textContent = "Tudo normal";
    caixa.appendChild(div);
  }

  // aba controles
  $("modo-auto").checked = estado.modoAuto;
  mostrarPill("pill-ar", estado.arLigado, "LIGADO", "DESLIGADO");
  mostrarPill("pill-luz", estado.luzLigada, "LIGADA", "DESLIGADA");
  $("btn-ar").disabled = estado.modoAuto;
  $("btn-luz").disabled = estado.modoAuto;

  const lista = $("lista-eventos");
  lista.innerHTML = "";
  if (estado.eventos.length > 0) {
    for (const ev of estado.eventos) {
      const div = document.createElement("div");
      div.className = "evento";
      const negrito = document.createElement("b");
      negrito.textContent = ev.hora;
      div.appendChild(negrito);
      div.appendChild(document.createTextNode(`   ${ev.texto}`));
      lista.appendChild(div);
    }
  } else {
    const p = document.createElement("p");
    p.className = "vazio";
    p.textContent = "Nenhum evento ainda.";
    lista.appendChild(p);
  }

  // aba verificação
  $("m-pessoas").textContent = s.pessoas;
  if (hist.length > 1) {
    const dif = s.pessoas - hist[hist.length - 2].pessoas;
    mostrarDelta("m-pessoas-delta", dif, `${dif > 0 ? "+" : ""}${dif}`, false);
  } else {
    mostrarDelta("m-pessoas-delta", null, "", false);
  }

  desenharGraficos();
}

function mostrarAba(nome) {
  document.querySelectorAll(".aba-btn").forEach((botao) => {
    botao.classList.toggle("ativa", botao.dataset.aba === nome);
  });
  document.querySelectorAll(".aba").forEach((secao) => {
    secao.classList.toggle("ativa", secao.id === `aba-${nome}`);
  });
  desenharGraficos();   // o gráfico só tem tamanho depois que a aba aparece
}


// =====================================================================
// INÍCIO: liga os botões e faz a primeira leitura
// =====================================================================
function iniciar() {
  // barra lateral
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

  // botões e controles
  $("btn-atualizar").addEventListener("click", atualizarAgora);
  $("btn-baixar").addEventListener("click", baixarCsv);
  $("btn-limpar").addEventListener("click", limparHistorico);
  $("btn-desligar-tudo").addEventListener("click", desligarTudo);
  $("btn-ar").addEventListener("click", () => alternar("arLigado"));
  $("btn-luz").addEventListener("click", () => alternar("luzLigada"));
  $("modo-auto").addEventListener("change", (e) => mudarModoAuto(e.target.checked));
  $("sensor-grafico").addEventListener("change", desenharGraficos);

  // abas
  document.querySelectorAll(".aba-btn").forEach((botao) => {
    botao.addEventListener("click", () => mostrarAba(botao.dataset.aba));
  });

  // redesenha os gráficos se a janela mudar de tamanho
  window.addEventListener("resize", desenharGraficos);

  // primeira leitura e primeira tela
  atualizarSensores();
  desenhar();
}

iniciar();
