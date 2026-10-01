import random
import streamlit as st

st.set_page_config(page_title="DASHBORD TESTE", page_icon="🏀", layout="wide" )
st.title("🏀 DASHBORD TESTE - dashboard")

def ler_sensores():
    temperatura = round(random.uniform(16, 32), 1)
    umidade = random.randint(30, 90)
    luminosidade = random.randint(10, 100)
    presenca = random.choice([True, False])
    return temperatura, umidade, luminosidade, presenca
temperatura, umidade, luminosidade, presenca = ler_sensores()
c1, c2, c3, c4 = st.columns(4)
c1.metric("Temperatura", f"{temperatura} °C")
c2.metric("Umidade", f"{umidade} %")
c3.metric("Luminosidade", f"{luminosidade} %")
c4.metric("Presença", "tem" if presenca else "Não tem")
if st.button("ligar Ar-Codicionador"):
    st.write("Ar-Codicionador ligado!")
if "temperatura" not in st.session_state:
    st.session_state.temperatura = []
st.session_state.temperatura.append(temperatura)
st.write(st.session_state.temperatura)
