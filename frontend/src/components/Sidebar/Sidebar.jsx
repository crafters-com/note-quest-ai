import React from 'react';
import styles from './Sidebar.module.css';

// Importaciones de imágenes (sin cambios)
import logoImage from '../../assets/icons/logo.svg';
import arrowIcon from '../../assets/icons/arrow.svg';
import searchIcon from '../../assets/icons/search.svg';
import trophyIcon from '../../assets/icons/trophy.svg';
import quizIcon from '../../assets/icons/quiz.svg';
import addNotesIcon from '../../assets/icons/add-notes.svg';
import addFolderIcon from '../../assets/icons/add-folder.svg';

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* El contenido principal se agrupa aquí */}
      <div className={styles.mainContent}>
        <header className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <img src={logoImage} className={styles.logo} alt="Logo de la aplicación" />
            <img src={arrowIcon} alt="Desplegar menú" />
          </div>
          <button className={styles.iconButton} aria-label="Buscar">
            <img src={searchIcon} style={{width:16,}} alt="Icono de búsqueda" />
          </button>
        </header>

        <div className={styles.sidebarBody}>
          <nav className={styles.quickActions}>
            <button className={styles.iconButton} aria-label="Ver logros">
              <img src={trophyIcon} alt="Icono de trofeo" />
            </button>
            <button className={styles.iconButton} aria-label="Iniciar un quiz">
              <img src={quizIcon} alt="Icono de quiz" />
            </button>
            <button className={styles.iconButton} aria-label="Añadir nota">
              <img src={addNotesIcon} alt="Icono de añadir nota" />
            </button>
            <button className={styles.iconButton} aria-label="Añadir carpeta">
              <img src={addFolderIcon} alt="Icono de añadir carpeta" />
            </button>
          </nav>

          <div className={styles.explorer}>
            {/* Aquí irá el explorador de archivos y carpetas */}
          </div>
        </div>
      </div>

      <footer className={styles.sidebarFooter}>
        <div className={styles.subjectSelector}>
          <img src={arrowIcon} style={{ transform: 'rotate(180deg)' }} alt="Desplegar materias" />
          <h4>
            Seleccionar materia
          </h4>
        </div>
        <button className={styles.iconButton} aria-label="Añadir carpeta">
          <img src={addFolderIcon} alt="Icono de añadir carpeta" />
        </button>
      </footer>
    </aside>
  );
}

export default Sidebar;