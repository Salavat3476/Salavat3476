import os
import tempfile

import streamlit as st

from fill_products import fill_excel


def main():
    st.title("Автозаполнение товаров из Excel")

    db_path = st.text_input("Путь к базе данных SQLite", "products.db")
    api_key = st.text_input(
        "OpenAI API Key", os.getenv("OPENAI_API_KEY"), type="password"
    )

    uploaded_file = st.file_uploader("Загрузите Excel-файл", type=["xlsx"])

    if uploaded_file and st.button("Обработать"):
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp_input:
            tmp_input.write(uploaded_file.getvalue())
            tmp_input_path = tmp_input.name

        output_path = tempfile.mktemp(suffix="_result.xlsx")

        fill_excel(tmp_input_path, db_path, output_path, api_key=api_key)

        with open(output_path, "rb") as f:
            st.download_button(
                label="Скачать результат",
                data=f,
                file_name="result.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )

        os.remove(tmp_input_path)
        os.remove(output_path)


if __name__ == "__main__":
    main()
