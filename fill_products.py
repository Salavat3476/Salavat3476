import os
import sqlite3
from typing import Optional

import openai
import pandas as pd


def get_product_data(conn: sqlite3.Connection, seller_article: str) -> Optional[dict]:
    cur = conn.cursor()
    cur.execute(
        "SELECT category, brand, description, photo, dimensions FROM products WHERE seller_article = ?",
        (seller_article,),
    )
    row = cur.fetchone()
    if row:
        return {
            "category": row[0],
            "brand": row[1],
            "description": row[2],
            "photo": row[3],
            "dimensions": row[4],
        }
    return None


def generate_description(name: str, brand: str, category: str) -> str:
    prompt = (
        f"Создайте краткое и привлекательное маркетинговое описание товара. "
        f"Название: {name}. Бренд: {brand}. Категория: {category}."
    )
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        max_tokens=70,
    )
    return response.choices[0].text.strip()


def fill_excel(
    input_path: str,
    db_path: str,
    output_path: str,
    api_key: Optional[str] = None,
) -> None:
    if api_key:
        openai.api_key = api_key

    df = pd.read_excel(input_path, sheet_name="Товары")

    conn = sqlite3.connect(db_path)

    for idx, row in df.iterrows():
        seller_article = row.get("Артикул продавца")
        if not seller_article:
            continue

        product_data = get_product_data(conn, str(seller_article))
        if not product_data:
            continue

        if pd.isna(row.get("Категория продавца")) and product_data.get("category"):
            df.at[idx, "Категория продавца"] = product_data["category"]
        if pd.isna(row.get("Бренд")) and product_data.get("brand"):
            df.at[idx, "Бренд"] = product_data["brand"]
        if pd.isna(row.get("Фото")) and product_data.get("photo"):
            df.at[idx, "Фото"] = product_data["photo"]
        if pd.isna(row.get("Габариты")) and product_data.get("dimensions"):
            df.at[idx, "Габариты"] = product_data["dimensions"]

        description = row.get("Описание")
        if pd.isna(description):
            db_description = product_data.get("description")
            if db_description:
                df.at[idx, "Описание"] = db_description
            elif api_key:
                generated = generate_description(
                    name=str(row.get("Наименование")),
                    brand=str(df.at[idx, "Бренд"]),
                    category=str(df.at[idx, "Категория продавца"]),
                )
                df.at[idx, "Описание"] = generated

    conn.close()

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Товары", index=False)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Заполнение данных по товарам")
    parser.add_argument("--input", required=True, help="Путь к исходному Excel")
    parser.add_argument("--db", required=True, help="Путь к базе данных SQLite")
    parser.add_argument("--output", required=True, help="Путь для сохранения результата")
    parser.add_argument(
        "--api-key",
        default=os.getenv("OPENAI_API_KEY"),
        help="Ключ OpenAI API (можно также передать через переменную окружения OPENAI_API_KEY)",
    )

    args = parser.parse_args()

    fill_excel(args.input, args.db, args.output, api_key=args.api_key)
