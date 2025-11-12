# Backend – NoteQuestAI

The backend of **NoteQuestAI** is built with **Django 5** and **Django REST Framework (DRF)**.  
It powers the server-side logic for an intelligent note-taking system that integrates OpenAI-based features to:

- Extract text and structured content from uploaded files (`pdf`, `docx`, `xlsx`, `pptx`, `png`, `jpg`, `jpeg`, `txt`, `md`).
- Convert that content into **clean, readable Markdown** using OpenAI models.
- Generate automatic **summaries**, **quizzes**, and **improved versions** of user notes through AI.

---

## Project Structure

```
backend/
├── ai_tools/ # AI integration modules (OpenAI)
│ ├── summarizer.py # Generates concise summaries
│ ├── quiz_generator.py # Builds quiz questions
│ └── note_improver.py # Enhances and fact-checks notes
│
├── files/ # File management and processing
│ ├── models.py
│ ├── tasks.py # Handles file indexing & async processing
│ ├── views.py # Upload and management endpoints
│ └── processing_helpers.py# Text extraction (OpenAI-first + fallbacks)
│
├── notes/ # Notes API and AI-powered actions
│ ├── models.py
│ ├── views.py # Endpoints for summary, quiz, and improve
│ └── urls.py
│
├── notebooks/ # User notebooks and organization
│ ├── models.py
│ ├── views.py
│ └── urls.py
│
├── friendships/ # Social layer: sharing and friendships
│ ├── models.py
│ └── views.py
│
├── settings.py # Django configuration
├── urls.py # Main API routing
└── wsgi.py / asgi.py # Server entry points
```

---

## Core Responsibilities

1. **REST API**  
   Provides authenticated endpoints (JWT / Token) for users, notebooks, notes, and files.

2. **File Processing Pipeline**  
   Each uploaded file is processed asynchronously (via Celery or thread fallback) to extract text and convert it into Markdown using OpenAI.

3. **AI Modules**  
   - `summarizer.py` → generates automatic note summaries.  
   - `quiz_generator.py` → creates quizzes based on note content.  
   - `note_improver.py` → enhances, expands, and fact-checks notes.

4. **OpenAI Integration**  
   Uses the following models:  
   - `gpt-4o-mini` → optimized for text processing.  
   - `gpt-4o` → multimodal (handles images and scanned PDFs).  

   Configuration is managed through environment variables defined in the `.env` file.

---

