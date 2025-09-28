import React from 'react';
import styles from './Home.module.css';

function Home() {
  return (
    <div className={styles.homeContainer}>
      <h1>Esta es la Página de Home</h1>
      <p>El contenido específico de esta página aparecerá aquí.</p>
    </div>
  );
}

export default Home;