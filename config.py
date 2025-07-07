import os

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_TELEGRAM_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_KEY")

AUTHORIZED_USERS_FILE = "data/authorized_users.json"
PRICE_FILE = "data/prajs_dlya_bota_DIAPAZON.json"
KNOWLEDGE_FILE = "data/knowledge_base.json"
