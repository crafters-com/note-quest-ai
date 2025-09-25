import React from 'react';
import styles from './Header.module.css';

// Suponiendo que tienes iconos para esto en tu carpeta de assets
// import StatsIcon from '../../assets/icons/stats.svg?react';
// import UserIcon from '../../assets/icons/user.svg?react';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.pageTitle}>
        {/* El título puede cambiar en el futuro, pero por ahora es estático */}
        <h3>Nueva pestaña</h3>
      </div>
      <div className={styles.userControls}>
        {/* <StatsIcon /> */}
        {/* <UserIcon /> */}
        <p>Iconos</p> {/* Marcador de posición */}
      </div>
    </header>
  );
}

export default Header;