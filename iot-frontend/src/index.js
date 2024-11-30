import React from 'react';
import ReactDOM from 'react-dom/client'; // Atualizado para React 18+
import App from './App';

// Cria a raiz do React para renderizar o componente principal
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
