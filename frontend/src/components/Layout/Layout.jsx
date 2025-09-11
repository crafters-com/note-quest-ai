import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header'; // <-- 1. Importa el Header
import styles from './Layout.module.css';

function Layout() {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        
        {/* Esta es el área que tendrá scroll y mostrará el contenido de la página */}
        <main className={styles.pageContent}>
          <Outlet /> {/* <-- 3. El contenido de la página (Outlet) va dentro */}
        </main>
      </div>
    </div>
  );
}

export default Layout;