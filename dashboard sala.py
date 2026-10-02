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
if "temperatura" not in st.session_state:
    st.session_state.temperatura = []
if "ar_ligado" not in st.session_state:
    st.session_state.ar_ligado = False
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
        st.metric("Presença", "tem" if presenca else "Não tem")
st.session_state.temperatura.append(temperatura)
st.subheader("🌡️ Temperatura do ar-condicionado")
st.caption("Atualizado em tempo real (dados simulados)") 
if temperatura > 28:
    st.warning("Temperatura muito alta")
else:
    st.success("Temperatura está boa")
aba1, aba2 = st.tabs(["Sensores", "Controles"])
with aba1:
    st.subheader("Histórico de temperaturas")
    st.line_chart(st.session_state.temperatura)
with aba2:
    if st.button("Ligar/Desligar Ar-Condicionador"):
        st.session_state.ar_ligado = not st.session_state.ar_ligado
    st.write(
        "Ar-Condicionador:",
        "LIGADO" if st.session_state.ar_ligado else "DESLIGADO",
    )
    if st.button("Verificar temperatura"):
        if temperatura > 28:
            st.warning("Muito quente")
        elif temperatura < 20:
            st.info("Frio")
        else:
            st.success("Normal")
