from deep_translator import GoogleTranslator

def translate_text(
    text,
    lang
):

    return GoogleTranslator(
        source='auto',
        target=lang
    ).translate(text)