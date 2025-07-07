import asyncio
from aiogram import Bot, Dispatcher
from handlers import router
from config import TELEGRAM_BOT_TOKEN


def main() -> None:
    bot = Bot(TELEGRAM_BOT_TOKEN, parse_mode="HTML")
    dp = Dispatcher()
    dp.include_router(router)
    asyncio.run(dp.start_polling(bot))


if __name__ == "__main__":
    main()
