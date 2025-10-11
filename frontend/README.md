# NoteQuest-AI 🧠📝

> Una aplicación web para la toma de apuntes inteligentes, potenciada por IA para organizar y conectar tu conocimiento.



---

## ✨ Características Principales

* **Autenticación de Usuarios:** Sistema completo de registro e inicio de sesión con tokens.
* **Gestión de Notebooks:** Crea, visualiza, actualiza y elimina "notebooks" o carpetas temáticas.
* **Editor de Notas Avanzado:** Un editor tipo Notion/Obsidian para crear y modificar apuntes.
* **Búsqueda y Filtro:** Funcionalidades para buscar y filtrar notebooks por materia o nombre.
* **Diseño Moderno y Responsivo:** Interfaz limpia construida con Tailwind CSS y Radix UI.
* **Modo Claro y Oscuro:** Tema personalizable para la comodidad del usuario.

---

## 🚀 Tecnologías Utilizadas

Este proyecto está construido con un stack moderno y eficiente, enfocado en la experiencia de desarrollo y el rendimiento.

* **Framework:** [React](https://react.dev/) 19 con [Vite](https://vitejs.dev/)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes Headless:** [Radix UI](https://www.radix-ui.com/) (para Diálogos, Dropdowns, etc.)
* **Routing:** [React Router DOM](https://reactrouter.com/)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Editor de Texto:** [TipTap](https://tiptap.dev/)
* **Iconos:** [Lucide React](https://lucide.dev/)

---

## 🛠️ Cómo Empezar

Sigue estos pasos para levantar el proyecto en tu entorno de desarrollo local.

### **Prerrequisitos**

* [Node.js](https://nodejs.org/) (versión 18 o superior)
* `npm` o un gestor de paquetes equivalente

### **Instalación**

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/note-quest-frontend.git](https://github.com/tu-usuario/note-quest-frontend.git)
    cd note-quest-frontend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade la URL de tu API de backend.
    ```env
    VITE_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
    ```
    > **Importante:** Este proyecto requiere que el [repositorio del backend](link-a-tu-repo-del-backend) esté corriendo simultáneamente.

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Ahora deberías poder ver la aplicación en `http://localhost:5173`.

---

## 📂 Estructura del Proyecto

La estructura del proyecto está diseñada para ser escalable y fácil de mantener.

## 📜 Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo.
* `npm run build`: Compila la aplicación para producción.
* `npm run lint`: Ejecuta el linter para revisar la calidad del código.
* `npm run preview`: Sirve la build de producción localmente.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.