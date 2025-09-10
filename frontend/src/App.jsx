import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar/Sidebar.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="appContainer">
      <Sidebar />
      
      <main className="mainContent">
        {/* El contenido de tus páginas se renderizará aquí */}
        <h1>Contenido Principal de la Vista</h1>
        <p>
          Este es el espacio donde aparecerán todas tus diferentes páginas y
          componentes. El sidebar se mantendrá fijo a la izquierda.
        </p>
      </main>
    </div>
  )
}

export default App
