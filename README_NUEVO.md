# NoteQuest-AI 📝🧠

Una aplicación web moderna para crear, gestionar y estudiar notas con inteligencia artificial.

## ✨ Características

- **Autenticación de usuarios**: Registro e inicio de sesión seguro
- **CRUD de notas**: Crear, leer, actualizar y eliminar notas
- **Diseño moderno**: Interfaz inspirada en aplicaciones de aprendizaje
- **Dashboard intuitivo**: Vista organizada de todas tus notas
- **Responsive**: Funciona en dispositivos móviles y de escritorio

## 🚀 Instalación y Configuración

### Prerrequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/crafters-com/note-quest-ai.git
   cd note-quest-ai
   ```

2. **Instalar dependencias**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar la base de datos**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Crear un superusuario (opcional)**

   ```bash
   python manage.py createsuperuser
   ```

5. **Iniciar el servidor de desarrollo**

   ```bash
   python manage.py runserver
   ```

6. **Abrir en el navegador**
   Ve a `http://127.0.0.1:8000/` para ver la aplicación

## 📱 Uso de la Aplicación

### Registro de Usuario

1. Ve a `/register/` o haz clic en "Regístrate aquí" desde la página de login
2. Completa el formulario con:
   - Nombre completo
   - Fecha de nacimiento (opcional)
   - Correo electrónico
   - Nombre de usuario
   - Contraseña y confirmación

### Inicio de Sesión

1. Ve a `/login/`
2. Ingresa tu nombre de usuario y contraseña
3. Serás redirigido al dashboard principal

### Gestión de Notas

#### Crear una nota

- Desde el dashboard, haz clic en "Crear Nota"
- Agrega un título y contenido
- Haz clic en "Guardar Nota"

#### Ver notas

- En el dashboard verás todas tus notas
- Haz clic en "Ver" para leer una nota completa

#### Editar notas

- Desde la vista de nota, haz clic en "Editar Nota"
- Modifica el contenido y guarda los cambios

#### Eliminar notas

- Desde la vista de nota, haz clic en "Eliminar Nota"
- Confirma la eliminación

## 🎨 Características del Diseño

- **Colores principales**:
  - Verde azulado: `#4a7c7e`
  - Amarillo dorado: `#f9da58`
  - Fondo suave: Gradiente azul claro
- **Tipografía**: Segoe UI para una apariencia moderna
- **Iconos**: Emojis para una interfaz amigable
- **Layout**: Sidebar + contenido principal para fácil navegación

## 🔧 Estructura del Proyecto

```
note-quest-ai/
├── manage.py
├── requirements.txt
├── README.md
├── core/                    # Aplicación principal
│   ├── models.py           # Modelos de datos
│   ├── views.py            # Vistas/controladores
│   ├── forms.py            # Formularios
│   ├── urls.py             # URLs de la app
│   ├── static/             # Archivos estáticos
│   │   ├── styles.css      # Estilos CSS
│   │   └── logo.svg        # Logo de la aplicación
│   └── templates/          # Plantillas HTML
│       ├── login.html
│       ├── register.html
│       ├── home.html
│       ├── create_note.html
│       ├── edit_note.html
│       ├── view_note.html
│       └── delete_note.html
└── notequest/              # Configuración del proyecto
    ├── settings.py
    ├── urls.py
    └── wsgi.py
```

## 🗃️ Modelos de Datos

### CustomUser

- `full_name`: Nombre completo del usuario
- `birth_date`: Fecha de nacimiento (opcional)
- `username`: Nombre de usuario único
- `email`: Correo electrónico

### Note

- `title`: Título de la nota
- `content`: Contenido de la nota
- `user`: Usuario propietario (ForeignKey)
- `created_at`: Fecha de creación

### QuizQuestions

- `note`: Nota asociada (ForeignKey)
- `question_text`: Texto de la pregunta
- `answer`: Respuesta correcta

## 🚀 Funcionalidades Futuras

- [ ] Generación automática de quizzes con IA
- [ ] Sistema de puntuación y ranking
- [ ] Categorización de notas por niveles (A1, A2, B1, etc.)
- [ ] Integración con APIs de IA para revisión de contenido
- [ ] Subida de archivos a las notas
- [ ] Búsqueda avanzada de notas
- [ ] Compartir notas entre usuarios

## 🛠️ Desarrollo

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Contribuidores

- Equipo de desarrollo EAFIT
- Proyecto Integrador I - Quinto Semestre

---

¡Disfruta usando NoteQuest-AI! 🎉
