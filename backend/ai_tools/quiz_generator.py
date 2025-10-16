import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_quiz(text: str):
    prompt = f"""
    Genera un quiz corto (máximo 5 preguntas) EN FORMATO JSON válidamente parseable, basado únicamente en el siguiente texto. NO añadas texto adicional, explicación ni code fences — DEVUELVE SOLO EL JSON.

    Texto:
    {text}

    Formato esperado:
    [
      {{
        "type": "open",
        "question": "Pregunta abierta...",
        "answer": "Respuesta esperada"
      }},
      {{
        "type": "multiple_choice",
        "question": "Pregunta de opción múltiple...",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correct": "Opción correcta"
      }}
    ]
    
    Reglas importantes:
    1. Genera entre 3 y 5 preguntas según la densidad del texto (si el texto es muy corto, 2 está permitido).
    2. Para multiple_choice usa **exactamente 4** opciones y pon `correct_index` (0..3) — no repitas la respuesta correcta como texto en otro campo.
    3. Para preguntas abiertas, `answer` debe ser concisa (1-2 frases).
    4. No inventes información que no esté en el texto: las preguntas y respuestas deben derivarse del texto dado.
    5. `source_excerpt` debe ser una frase o fragmento (<= 200 caracteres) tomado del texto que justifique la pregunta.
    6. Devuelve **solo** el JSON, sin comentarios ni texto extra.

    Formato de salida: JSON válido.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un generador de quices concisos y estructurados."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()

        # Limpieza por si el modelo incluye ```json ... ```
        content = content.replace("```json", "").replace("```", "").strip()

        quiz = json.loads(content)
        return quiz

    except Exception as e:
        print("Error generando quiz:", e)
        return [{
            "type": "open",
            "question": "No se pudo generar el quiz correctamente",
            "answer": str(e)
        }]
