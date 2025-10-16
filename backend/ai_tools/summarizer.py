from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def summarize_text(text: str) -> str:
    """
    Usa GPT-4o-mini para generar un resumen coherente y estructurado.
    """
    if not text.strip():
        return "No hay contenido para resumir."

    prompt = f"""
    Resume el siguiente texto en un formato claro y conciso (máximo 5 oraciones).
    Texto:
    {text}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": "Eres un experto en redacción y síntesis de información."},
                  {"role": "user", "content": prompt}],
        temperature=0.5,
    )

    return response.choices[0].message.content.strip()
