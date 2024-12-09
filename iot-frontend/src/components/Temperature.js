import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TemperatureStats.css';

const Temperature = () => {
    const [lastTemperature, setLastTemperature] = useState(null);
    const [averageTemperature, setAverageTemperature] = useState(null);
    const [error, setError] = useState(null);

    // Função para buscar a última temperatura registrada
    const fetchLastTemperature = async () => {
        try {
            const response = await axios.get('http://localhost:3000/temperature/last');
            setLastTemperature(response.data);
        } catch (error) {
            console.error('Erro ao buscar a última temperatura:', error);
            setError('Última temperatura nao encontrada');
        }
    };

    // Função para buscar a média da última hora
    const fetchAverageTemperature = async () => {
        try {
            const response = await axios.get('http://localhost:3000/temperature/average');
            setAverageTemperature(response.data.average);
        } catch (error) {
            console.error('Erro ao buscar a média da última hora:', error);
            setError('Erro ao carregar a média da última hora.');
        }
    };

    // Buscar os dados ao carregar o componente
    useEffect(() => {
        fetchLastTemperature();
        fetchAverageTemperature();

        const interval = setInterval(() => {
            fetchLastTemperature();
            fetchAverageTemperature();
        }, 5000); // Atualiza a cada 5 segundos

        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="temperature-container">
            <h2 className="temperature-title">Estatísticas de Temperatura</h2>
            {error && <p className="temperature-error">{error}</p>}
            <p className="temperature-data">
                <strong>Última Temperatura:</strong>{' '}
                {lastTemperature ? `${lastTemperature}°C` : 'Carregando...'}
            </p>
            <p className="temperature-data">
                <strong>Média da Última Hora:</strong>{' '}
                {averageTemperature !== null
                    ? `${averageTemperature.toFixed(2)}°C`
                    : 'Sem dados suficientes'}
            </p>
        </div>
    );
};

export default Temperature;
