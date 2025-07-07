import json
from pathlib import Path
from typing import Any, Dict, Optional

import openai

from config import OPENAI_API_KEY, AUTHORIZED_USERS_FILE, PRICE_FILE, KNOWLEDGE_FILE


openai.api_key = OPENAI_API_KEY


def _load_json(path: str) -> Any:
    file = Path(path)
    if not file.exists():
        return {}
    with file.open("r", encoding="utf-8") as f:
        return json.load(f)


def _save_json(path: str, data: Any) -> None:
    file = Path(path)
    file.parent.mkdir(parents=True, exist_ok=True)
    with file.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# Authorization utilities

def authorize_user(user_id: int) -> bool:
    users = _load_json(AUTHORIZED_USERS_FILE)
    if not isinstance(users, list):
        users = []
    if user_id not in users:
        users.append(user_id)
        _save_json(AUTHORIZED_USERS_FILE, users)
        return True
    return False


def is_authorized(user_id: int) -> bool:
    users = _load_json(AUTHORIZED_USERS_FILE)
    if not isinstance(users, list):
        return False
    return user_id in users


# Price calculation

def get_price(item_type: str, width: int, height: int) -> Optional[Dict[str, Any]]:
    data = _load_json(PRICE_FILE)
    table = data.get(item_type.lower())
    if not isinstance(table, dict):
        return None
    closest = None
    closest_area = None
    for size_str, price in table.items():
        try:
            w_str, h_str = size_str.lower().replace("x", "×").split("×")
            w, h = int(w_str), int(h_str)
        except ValueError:
            continue
        if w >= width and h >= height:
            area = w * h
            if closest_area is None or area < closest_area:
                closest_area = area
                closest = {"size": f"{w}×{h}", "price": price}
    return closest


# OpenAI helpers
async def generate_description(prompt: str) -> str:
    resp = await openai.ChatCompletion.acreate(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
    )
    return resp.choices[0].message.content.strip()


async def generate_image(prompt: str) -> str:
    resp = await openai.Image.acreate(prompt=prompt, n=1, size="512x512")
    return resp.data[0].url


# Instructions
def get_instruction(section: str, item: str) -> Optional[str]:
    data = _load_json(KNOWLEDGE_FILE)
    return data.get(section, {}).get(item)
