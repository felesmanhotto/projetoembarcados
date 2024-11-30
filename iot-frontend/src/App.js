import React from 'react';
import Alarm from './components/Alarm';
import Movements from './components/Movements';
import Temperature from './components/Temperature';

const App = () => {
    return (
        <div>
            <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Controle Sala de Servidor</h1>
            <Alarm />
            <Temperature />
            <Movements />
        </div>
    );
};

export default App;
