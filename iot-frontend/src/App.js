import React from 'react';
import Alarm from './components/Alarm';
import MovementLogs from './components/Movements';
import TemperatureStats from './components/Temperature';
import './components/styles/App.css';

const App = () => {
    return (
        <div className="container">
            <h1>Controle Sala de Servidor</h1>
            <Alarm />
            <TemperatureStats />
            <MovementLogs />
        </div>
    );
};

export default App;
