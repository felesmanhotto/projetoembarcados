import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/Alarm.css';

const Alarm = () => {
    const [alarmState, setAlarmState] = useState(false); // Estado do alarme (ligado/desligado)

    // Função para buscar o estado atual do alarme
    const fetchAlarmState = async () => {
        try {
            const response = await axios.get('http://localhost:3000/alarm');
            console.log('Resposta do backend:', response.data);
            setAlarmState(response.data === 'ativado');
        } catch (error) {
            console.error('Erro ao buscar o estado do alarme:', error);
        }
    };

    // Função para alternar o estado do alarme
    const toggleAlarm = async () => {
        try {
            const response = await axios.post('http://localhost:3000/alarm/toggle');
            setAlarmState(response.data === 'ativado');
        } catch (error) {
            console.error('Erro ao alternar o alarme:', error);
        }
    };

    // Buscar o estado inicial do alarme ao carregar o componente
    useEffect(() => {
        fetchAlarmState();
    }, []);

    return (
        <div className="alarm-container">
            <h2 className="alarm-status">
                Estado do Alarme: {alarmState ? 'Ligado' : 'Desligado'}
            </h2>
            <button
                onClick={toggleAlarm}
                className={`alarm-button ${alarmState ? 'ligado' : ''}`}
            >
                {alarmState ? 'Desligar Alarme' : 'Ligar Alarme'}
            </button>
        </div>
    );
};

export default Alarm;
