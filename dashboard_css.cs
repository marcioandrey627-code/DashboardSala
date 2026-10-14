/* ========== BASE ========== */
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #ffffff;
  color: #0f172a;
}

.layout { display: flex; min-height: 100vh; }

/* ========== BARRA LATERAL ========== */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  background: #f1f5f9;
  border-right: 1px solid #e2e8f0;
  padding: 24px 20px;
}
.sidebar h2 { margin-top: 0; }
.sidebar label { display: block; margin: 18px 0 6px; font-size: 0.9rem; }
.sidebar input[type="range"] { width: 100%; accent-color: #2563eb; }
.legenda { color: #64748b; font-size: 0.85rem; }
.linha { display: flex; align-items: center; gap: 8px; }
input[type="checkbox"] { accent-color: #2563eb; width: 18px; height: 18px; }

/* ========== CONTEÚDO ========== */
.conteudo {
  flex: 1;
  min-width: 0;            /* deixa o conteúdo encolher (importante p/ os gráficos) */
  max-width: 1300px;
  padding: 2rem;
}

/* ========== BANNER ========== */
.banner {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #06b6d4 100%);
  color: #ffffff;
  padding: 22px 28px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 18px;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
}
.banner .titulo { font-size: 1.9rem; font-weight: 800; letter-spacing: 0.5px; }
.banner .subtitulo { opacity: 0.85; font-size: 0.95rem; margin-top: 2px; }
.banner .pills { display: flex; gap: 8px; flex-wrap: wrap; }
.banner .status {
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

/* ========== CARDS E MÉTRICAS ========== */
.card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 18px;
}
.metricas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.metrica .rotulo { opacity: 0.75; font-size: 0.9rem; }
.metrica .valor { font-size: 2rem; font-weight: 700; margin: 4px 0; }
.metrica .delta { font-size: 0.85rem; font-weight: 600; min-height: 1.2em; }
.delta.bom { color: #16a34a; }
.delta.ruim { color: #dc2626; }
.delta.neutro { color: #64748b; }
.metrica-pessoas { max-width: 320px; margin-bottom: 14px; }

/* ========== BOTÕES ========== */
.btn {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn.primario { background: #2563eb; border-color: #2563eb; color: #ffffff; }
.btn.primario:hover:not(:disabled) { background: #1d4ed8; color: #ffffff; }
.linha-botoes { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 12px 0; }

/* ========== ALERTAS ========== */
.alerta { padding: 12px 16px; border-radius: 10px; margin: 8px 0; font-size: 0.95rem; }
.alerta.aviso { background: #fef9c3; color: #854d0e; }
.alerta.ok { background: #dcfce7; color: #166534; }

/* ========== ABAS ========== */
.abas { display: flex; gap: 4px; border-bottom: 1px solid #e2e8f0; margin-top: 18px; }
.aba-btn {
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 1rem;
  color: #64748b;
  cursor: pointer;
}
.aba-btn.ativa { color: #2563eb; border-bottom-color: #2563eb; }
.aba { display: none; padding-top: 8px; }
.aba.ativa { display: block; }

select {
  display: block;
  margin: 6px 0 12px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
}

canvas.grafico { width: 100%; height: 280px; display: block; }

.duas-colunas { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
.duas-colunas h3 { margin-top: 0; }

/* ========== ETIQUETAS (pill) E EVENTOS ========== */
.pill {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 10px;
}
.pill.on { background: rgba(34, 197, 94, 0.15); color: #16a34a; border: 1px solid rgba(34, 197, 94, 0.4); }
.pill.off { background: rgba(148, 163, 184, 0.15); color: #64748b; border: 1px solid rgba(148, 163, 184, 0.4); }

.evento {
  padding: 8px 12px;
  border-left: 3px solid #2563eb;
  background: rgba(37, 99, 235, 0.07);
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 0.9rem;
}
.evento b { color: #2563eb; }
.vazio { color: #64748b; font-size: 0.9rem; }

/* ========== CELULAR ========== */
@media (max-width: 800px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; border-right: none; border-bottom: 1px solid #e2e8f0; }
  .conteudo { padding: 1rem; }
  .metricas { grid-template-columns: repeat(2, 1fr); }
  .duas-colunas { grid-template-columns: 1fr; }
  .banner .titulo { font-size: 1.4rem; }
}
