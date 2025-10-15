from transformers import pipeline

# Modelo liviano y eficiente (ideal para demo en local)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text: str) -> str:
    """Genera un resumen corto del contenido de una nota."""
    if not text or len(text.strip()) < 30:
        return "No hay suficiente contenido para generar un resumen."
    
    try:
        result = summarizer(text, max_length=200, min_length=60, do_sample=False)
        return result[0]["summary_text"].strip()
    except Exception as e:
        return f"Error generando resumen: {str(e)}"
