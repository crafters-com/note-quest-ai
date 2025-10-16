import random

def generate_quiz(text: str, num_questions: int = 5):
    """
    Genera un quiz sencillo de máximo 5 preguntas:
    - 3 abiertas
    - 2 selección múltiple
    """
    if not text or len(text.strip()) < 50:
        return [{"type": "info", "question": "No hay suficiente contenido para generar un quiz."}]

    sentences = [s.strip() for s in text.split('.') if len(s.split()) > 6]
    random.shuffle(sentences)
    quiz = []

    for i, s in enumerate(sentences[:num_questions]):
        if i % 2 == 0:
            quiz.append({
                "type": "open",
                "question": f"Explica brevemente el siguiente concepto: “{s[:90]}...”",
                "answer": s
            })
        else:
            distractors = random.sample(sentences, k=min(3, len(sentences)))
            options = [s] + distractors
            random.shuffle(options)
            quiz.append({
                "type": "multiple_choice",
                "question": f"¿Cuál de las siguientes afirmaciones se relaciona con: “{s[:60]}...”?",
                "options": options,
                "correct": s
            })
    return quiz
