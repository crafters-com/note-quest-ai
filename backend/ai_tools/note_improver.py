import os
import time
import logging
from typing import Optional, Dict, Any, List

from django.conf import settings

logger = logging.getLogger(__name__)

# OpenAI SDK import
try:
    from openai import OpenAI
except Exception:
    OpenAI = None

# Config/defaults via settings or env
def _get_setting(name: str, default=None):
    return getattr(settings, name, os.getenv(name, default))

OPENAI_API_KEY = _get_setting("OPENAI_API_KEY", None)
OPENAI_MODEL_TEXT = _get_setting("OPENAI_MODEL_TEXT", "gpt-4o-mini")
OPENAI_MAX_RETRIES = int(_get_setting("OPENAI_MAX_RETRIES", 2))
OPENAI_TEMP = float(_get_setting("OPENAI_TEMP", 0.2))
OPENAI_MAX_TOKENS = int(_get_setting("OPENAI_MAX_TOKENS", 1000))

_openai_client = None
def get_openai_client():
    global _openai_client
    if _openai_client is not None:
        return _openai_client
    if OpenAI is None:
        raise RuntimeError("OpenAI SDK no está instalado.")
    api_key = OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY no configurada.")
    _openai_client = OpenAI(api_key=api_key)
    return _openai_client

# Low-level call with retries
def _call_openai_chat(model: str, messages: list, max_tokens: int, temperature: float, max_retries: int):
    client = get_openai_client()
    attempt = 0
    while True:
        try:
            resp = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            if resp and getattr(resp, "choices", None):
                choice = resp.choices[0]
                # Robust extract of content
                try:
                    if isinstance(choice, dict):
                        msg = choice.get("message", {}) or {}
                        out = msg.get("content", "") or ""
                    else:
                        msg = getattr(choice, "message", None)
                        if msg:
                            try:
                                out = msg["content"]
                            except Exception:
                                out = getattr(msg, "content", None) or ""
                except Exception:
                    out = getattr(resp, "text", "") or ""
                return (out or "").strip()
            return ""
        except Exception as e:
            attempt += 1
            logger.exception("OpenAI call failed (attempt %s): %s", attempt, e)
            if attempt > max_retries:
                raise
            time.sleep(1 + attempt * 2)

# Prompt template
_SYSTEM_PROMPT = (
    "Eres un editor experto en notas y verificación básica. "
    "Tu tarea es mejorar, completar y corregir la nota que te dé el usuario. "
    "Prioriza claridad, exactitud y referencia a la ambigüedad cuando no estés seguro. "
    "NO inventes fuentes ni cites hechos no verificables como si fueran ciertos. "
    "Si hay una afirmación que no puedes verificar con la información dada, señala la afirmación y marca con [VERIFICAR] "
    "y explica brevemente por qué requiere verificación.\n\n"
    "Salida esperada: responde en dos partes separadas por la cadena EXACTA:\n"
    "-----IMPROVED_MARKDOWN_START-----\n"
    "<Aquí va la nota mejorada en Markdown>\n"
    "-----IMPROVED_MARKDOWN_END-----\n\n"
    "-----CHANGELOG_JSON_START-----\n"
    "<Aquí va un JSON válido que describa los cambios, p.ej. {\"summary\":\"...\",\"changes\":[...]}\n"
    "-----CHANGELOG_JSON_END-----\n\n"
    "RESPONDE SÓLO con esas dos secciones exactamente con las marcas, sin explicaciones adicionales."
)

_USER_INSTRUCTIONS = (
    "Toma la nota original que te doy y realiza estas tareas:\n"
    "1) Corrige errores gramaticales y de estilo y normaliza el formato a Markdown.\n"
    "2) Completa información obvia que falte (p. ej. si hay un título sin desarrollo, añade un párrafo breve explicativo), "
    "   pero no inventes hechos específicos; si necesitas suponer, indica claramente [SUPOSICIÓN].\n"
    "3) Revisa afirmaciones factuales: si puedes corregir con alta confianza (basado solo en el contexto de la nota), hazlo; "
    "   si no puedes verificar, añade una marca [VERIFICAR] junto a la afirmación y una explicación corta.\n"
    "4) Devuelve también un JSON (en la sección de changelog) con resumen y lista de cambios. Cada elemento debe tener: "
    "{\"type\": \"corrected|expanded|format|marked_uncertain\", \"location\": \"una pista (primera linea / heading / parrafo 2)\", \"explanation\": \"qué y por qué\"}.\n"
)

def improve_note(note_text: str,
                 model: Optional[str] = None,
                 max_retries: int = OPENAI_MAX_RETRIES,
                 temperature: float = OPENAI_TEMP,
                 max_tokens: int = OPENAI_MAX_TOKENS) -> Dict[str, Any]:
    """
    Mejora y corrige la nota pasada en note_text.
    Retorna dict con keys: improved_markdown (str), changelog (dict), warnings (list)
    """
    if not note_text or not note_text.strip():
        return {"improved_markdown": "", "changelog": {"summary": "nota vacía", "changes": []}, "warnings": ["Nota vacía"]}

    model = model or OPENAI_MODEL_TEXT

    # Construir mensajes
    system = _SYSTEM_PROMPT
    user_msg = _USER_INSTRUCTIONS + "\n\nNota original:\n\n" + note_text[:200000]  # slice defensivo

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user_msg},
    ]

    try:
        raw = _call_openai_chat(model=model, messages=messages, max_tokens=max_tokens, temperature=temperature, max_retries=max_retries)
    except Exception as e:
        logger.exception("improve_note: error llamando a OpenAI: %s", e)
        return {"improved_markdown": "", "changelog": {"summary": "error", "changes": []}, "warnings": [str(e)]}

    # Intentar extraer las dos secciones por las marcas exactas
    improved = ""
    changelog = {"summary": "", "changes": []}
    warnings: List[str] = []

    try:
        # Buscar marcadores
        start_md = "-----IMPROVED_MARKDOWN_START-----"
        end_md = "-----IMPROVED_MARKDOWN_END-----"
        start_json = "-----CHANGELOG_JSON_START-----"
        end_json = "-----CHANGELOG_JSON_END-----"

        md = ""
        json_text = ""

        if start_md in raw and end_md in raw:
            md = raw.split(start_md, 1)[1].split(end_md, 1)[0].strip()
        else:
            # Si el modelo no respetó exactamente las marcas, intentar heurística:
            # buscar primera porción de Markdown (till JSON start) o tomar todo como markdown
            if start_json in raw:
                md = raw.split(start_json, 1)[0].strip()
            else:
                md = raw.strip()

        if start_json in raw and end_json in raw:
            json_text = raw.split(start_json, 1)[1].split(end_json, 1)[0].strip()
        else:
            # intentar heurística: buscar la primera línea que empiece con '{' y extraer hasta el último '}'.
            import re, json
            m = re.search(r'(\{.*\})', raw, flags=re.DOTALL)
            if m:
                json_text = m.group(1)
            else:
                json_text = ""

        improved = text_clean_md(md)

        if json_text:
            import json
            try:
                changelog = json.loads(json_text)
            except Exception as e:
                logger.exception("improve_note: json changelog parse error: %s", e)
                warnings.append("No se pudo parsear el changelog JSON retornado por la IA; se incluye raw_text en warnings.")
                changelog = {"summary": "", "changes_raw": json_text}

    except Exception as e:
        logger.exception("improve_note: error parsing response: %s", e)
        warnings.append("Error parsing response: " + str(e))
        improved = raw  # fallback: devolver todo el texto crudo

    return {"improved_markdown": improved, "changelog": changelog, "warnings": warnings}

# pequeña función utilitaria para normalizar Markdown
def text_clean_md(md: str) -> str:
    # Normalizaciones mínimas: trim y colapsar saltos excesivos
    if not md:
        return ""
    md = md.replace('\r\n', '\n').replace('\r', '\n')
    # quitar más de 2 saltos seguidos
    import re
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip()
