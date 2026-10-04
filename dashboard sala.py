import random
import streamlit as st

st.set_page_config(page_title="DASHBORD TESTE", page_icon="🏫", layout="wide" )
st.title("🏫 DASHBORD TESTE - dashboard")

def ler_sensores():
    temperatura = round(random.uniform(16, 32), 1)
    umidade = random.randint(30, 90)
    luminosidade = random.randint(10, 100)
    presenca = random.choice([True, False])
    return temperatura, umidade, luminosidade, presenca
temperatura, umidade, luminosidade, presenca = ler_sensores()
def sortear_verifica_presenca():
    st.session_state.verificar_presenca = random.randint(0, 40)
if "temperatura" not in st.session_state:
    st.session_state.temperatura = []
if "ar_ligado" not in st.session_state:
    st.session_state.ar_ligado = False
if "luz_ligada" not in st.session_state:
    st.session_state.luz_ligada = False
if "verificar_presenca" not in st.session_state:
    st.session_state.verificar_presenca = 0
st.metric("Verifica presença", "Tem pessoas" if st.session_state.verificar_presenca > 0 else "nao")
if len(st.session_state.temperatura) > 0:
    variacao = round(temperatura - st.session_state.temperatura[-1], 1)
else:
    variacao = None
c1, c2, c3, c4 = st.columns(4)
with c1:
    with st.container(border=True):
        st.metric(
            "Temperatura",
            f"{temperatura} °C",
            delta=f"{variacao:+} °C" if variacao is not None else None,
            delta_color="inverse",
        )
with c2:
    with st.container(border=True):
        st.metric("Umidade", f"{umidade} %")
with c3:
    with st.container(border=True):
        st.metric("Luminosidade", f"{luminosidade} %")
with c4:
    with st.container(border=True):
       st.metric("Presença", "tem" if st.session_state.verificar_presenca > 0 else "Não tem")
st.session_state.temperatura.append(temperatura)
st.caption("Atualizado em tempo real (dados simulados)") 
if temperatura > 28:
    st.warning("Temperatura muito alta")
else:
    st.success("Temperatura está boa")
aba1, aba2, aba3 = st.tabs(["Sensores", "Controles", "Verificação"])
with aba1:
    st.subheader("Histórico de temperaturas")
    st.line_chart(st.session_state.temperatura)
with aba2:
    st.subheader("Controles da sala")
    col_ar, col_luz = st.columns(2)
with aba3:
    st.subheader("Verificação de Pessoas")
    st.metric("Pessoas nesta sala", st.session_state.verificar_presenca)
    st.button("Atualizar Prenseça", on_click=sortear_verifica_presenca)
with col_ar:
        with st.container(border=True):
            st.markdown("### ❄️ Ar-condicionado")
            if st.button("Ligar/Desligar ar"):
                st.session_state.ar_ligado = not st.session_state.ar_ligado
            if st.session_state.ar_ligado:
                st.success("🟢 LIGADO")
            else:
                st.info("⚫ DESLIGADO")
 
with col_luz:
        with st.container(border=True):
            st.markdown("### 💡 Luz")
            if st.button("Ligar/Desligar luz"):
                st.session_state.luz_ligada = not st.session_state.luz_ligada
            if st.session_state.luz_ligada:
                st.success("🟢 LIGADA")
            else:
                st.info("⚫ DESLIGADA")
