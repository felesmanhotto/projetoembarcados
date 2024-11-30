import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Movements = () => {
    const [movements, setMovements] = useState([]); // Estado inicial como array vazio
    const [error, setError] = useState(null); // Estado para erros

    // Função para buscar os registros de movimentos
    const fetchMovements = async () => {
        try {
            const response = await axios.get('http://localhost:3000/movements');
            const data = Array.isArray(response.data) ? response.data : []; // Garante que seja um array
            setMovements(data); // Atualiza o estado com os registros
        } catch (error) {
            console.error('Erro ao buscar registros de movimentos:', error);
            setError('Erro ao carregar os registros.');
        }
    };

    // Buscar os registros ao carregar o componente
    useEffect(() => {
        fetchMovements();

        const interval = setInterval(() => {
            fetchMovements();
        }, 5000); // Atualiza a cada 5 minutos

        // Limpa o intervalo quando o componente é desmontado
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Registros do Alarme</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '50%' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Horário</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.length > 0 ? (
                        movements.map((movement) => (
                            <tr key={movement.id}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    {new Date(movement.timestamp).toLocaleString()}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2" style={{ textAlign: 'center', padding: '8px' }}>
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Movements;
