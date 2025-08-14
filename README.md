# NoteQuest

A minimal Django web application where users can register, sign in, and manage private notes. This codebase is intended as the foundation for a future AI-assisted, gamified study platform.

## Overview

NoteQuest provides a clean starting point with:

- Custom user model (full name, username, email, password).
- User registration, login, and logout.
- User-scoped notes: each user sees only their own notes.
- Simple templates ready to be extended.

**Audience:** Students and developers who want a solid Django base to iterate on quickly.

**Current status (MVP):** Authentication and private notes.

**Future direction:** OCR ingestion, AI summarization and quiz generation, gamification (points, levels, achievements), flashcards, Pomodoro, and interactive mind maps.

## Requirements

- Python 3.9 or higher
- pip (Python package manager)
- Git
- Virtual environment tool (recommended: venv)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/crafters-com/note-quest-ai
   cd notequest
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
- Web app: http://localhost:8000
- Admin panel: http://localhost:8000/admin
