from aiogram import Router, types
from aiogram.filters import Command

from utils import (
    authorize_user,
    is_authorized,
    get_price,
    generate_description,
    generate_image,
    get_instruction,
)

router = Router()


def _check_auth(message: types.Message) -> bool:
    if not is_authorized(message.from_user.id):
        return False
    return True


@router.message(Command("start"))
async def cmd_start(message: types.Message) -> None:
    first_time = authorize_user(message.from_user.id)
    if first_time:
        await message.answer("✅ Добро пожаловать! Вы зарегистрированы как сотрудник.")
    else:
        await message.answer("Вы уже зарегистрированы.")


@router.message(Command("расчет"))
async def cmd_price(message: types.Message) -> None:
    if not _check_auth(message):
        await message.answer("⛔ Доступ запрещён")
        return
    parts = message.text.split()
    if len(parts) < 3:
        await message.answer("Использование: /расчет <тип> <ширина>x<высота>")
        return
    item_type = parts[1]
    size = parts[2].lower().replace("×", "x")
    try:
        width, height = map(int, size.split("x"))
    except ValueError:
        await message.answer("Неверный формат размера. Пример: 1500x2000")
        return
    result = get_price(item_type, width, height)
    if result:
        await message.answer(
            f"Ближайший размер: {result['size']}. Цена: {result['price']} ₽."
        )
    else:
        await message.answer("Размер не найден в прайс-листе")


@router.message(Command("описание"))
async def cmd_description(message: types.Message) -> None:
    if not _check_auth(message):
        await message.answer("⛔ Доступ запрещён")
        return
    prompt = message.text.replace("/описание", "", 1).strip()
    if not prompt:
        await message.answer("Укажите параметры для описания")
        return
    text = await generate_description(prompt)
    await message.answer(text)


@router.message(Command("изображение"))
async def cmd_image(message: types.Message) -> None:
    if not _check_auth(message):
        await message.answer("⛔ Доступ запрещён")
        return
    prompt = message.text.replace("/изображение", "", 1).strip()
    if not prompt:
        await message.answer("Укажите параметры для изображения")
        return
    url = await generate_image(prompt)
    await message.answer_photo(url)


@router.message(Command("доставка"))
async def cmd_delivery(message: types.Message) -> None:
    if not _check_auth(message):
        await message.answer("⛔ Доступ запрещён")
        return
    region = message.text.replace("/доставка", "", 1).strip()
    text = (
        f"В {region or 'вашем регионе'} доступны способы оплаты и доставки:\n"
        "1. Счёт + договор + отправка.\n"
        "2. Наложенный платёж.\n"
        "3. Авито-доставка."
    )
    await message.answer(text)


@router.message(Command("инструкция"))
async def cmd_instruction(message: types.Message) -> None:
    if not _check_auth(message):
        await message.answer("⛔ Доступ запрещён")
        return
    parts = message.text.split()
    if len(parts) < 3:
        await message.answer("Использование: /инструкция <раздел> <тип>")
        return
    section = parts[1]
    item = parts[2]
    text = get_instruction(section, item)
    if text:
        await message.answer(text)
    else:
        await message.answer("Инструкция не найдена")
