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
    Resume el siguiente texto en un formato claro y conciso (máximo 15 oraciones) todo debe parecer un mismo parrafo o maximo 2 parrafos si necesitas separar temas. Ten en cuenta que estos resumenes seran usados por estudiantes de universidad por lo que la claridad y entendibilidad debe ser escencial, tambien que la informacion que se de en el resumen debe ser util para examenes finales, quices y trabajos.
    Si el tema tiene que ver con ciencias y necesitas proporcionar formulas para el entendimiento lo haras
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
