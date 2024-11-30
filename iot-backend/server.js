const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Habilita o CORS para todas as rotas
app.use(cors());
app.use(express.json());

const { db, addMovement, getAllMovements, addTemperature } = require('./db');

//http://192.168.48.148:3000/

let lastTemperature = null;
let lastTemperatureTime = null; 
let lastMotion = null;
let alarmActivated = false;
let lastNotificationTime = null;


// ligar/desligar o alarme (curl -X POST http://192.168.48.148:3000/alarm/toggle)
app.post('/alarm/toggle', (req, res) => {
    alarmActivated = !alarmActivated;
    res.send(alarmActivated ? 'ativado' : 'desativado');
    console.log(`Alarme ${alarmActivated ? 'ativado' : 'desativado'}`);     
});


app.get('/alarm', (req, res) => {
    res.send(alarmActivated ? 'ativado' : 'desativado');
});


// exibir os dados de temperatura no navegador
app.get('/temperature/last', (req, res) => {
    if (lastTemperature !== null) {
        res.json({ temperature: lastTemperature });
    } else {
        res.status(404).send('Nenhuma temperatura registrada ainda.');
    }
});


app.get('/temperature/average', (req, res) => {
    db.get(
        `SELECT AVG(temperature) AS average FROM temperature WHERE timestamp >= datetime('now', '-1 hour')`,
        (err, row) => {
            if (err) {
                console.error('Erro ao calcular a média da última hora:', err.message);
                return res.status(500).send('Erro ao calcular a média da última hora.');
            }
            res.json({ average: row.average });
        }
    );
});


// receber dados de temperatura
app.post('/sensor/temperature', (req, res) => {
    const temperature = req.body.temperature;
    console.log(`Temperatura recebida: ${lastTemperature}°C`);

    lastTemperature = temperature

    const currentTime = new Date().getTime();
    if (!lastTemperatureTime || (currentTime - lastTemperatureTime) >= 1000) {
        lastTemperatureTime = currentTime;

        addTemperature(temperature, (err) => {
            if (err) {
                return res.status(500).send('Erro ao salvar temperatura no banco de dados.');
            }
            res.send('Temperatura registrada com sucesso.');
        });
    } else {
        console.log('Temperatura recebida, mas dentro do intervalo de 5 minutos.'); 
        res.send('Temperatura recebida, mas não registrada (intervalo de 5 minutos não alcançado).');
    }
});


// exibir os dados de movimento no navegador
app.get('/sensor/motion', (req, res) => {
    if (lastMotion !== null) {
        res.send(`Último estado do sensor de movimento: ${lastMotion}`);
    } else {
        res.send('Nenhum movimento detectado ainda');
    }
});


// receber dados do sensor de movimento (curl -X POST http://localhost:3000/sensor/motion -H "Content-Type: application/json" -d "{\"motion\": \"Movimento\"}")
app.post('/sensor/motion', (req, res) => {
    lastMotion = req.body.motion;
    console.log(`Estado do sensor de movimento: ${lastMotion}`);
    
    if (alarmActivated && lastMotion === 'Movimento Detectado') {
        // verifica se 10 minutos se passaram desde o último registro antes de prosseguir
        const currentTime = new Date().getTime();
        if (!lastNotificationTime || (currentTime - lastNotificationTime) > 10 * 60 * 1000) {
            lastNotificationTime = currentTime;
            addMovement();
            
            // retorna para evitar chamadas adicionais de res.send()
            return res.send('Movimento detectado e registrado.');
        } else {
            console.log('Movimento detectado, mas dentro do intervalo de 10 minutos');
        }
    }
    
    res.send('Estado do sensor de movimento recebido com sucesso');
});



// imprimir todos os registros do bd no console
app.get('/movements', (req, res) => {
    getAllMovements((err, rows) => {
        if (err) {
            res.status(500).send('Erro ao obter movimentos');
        } else {
            res.send(rows);
        }
    });
});

// teste para o navegador
app.get('/', (req, res) => {
    res.send('Servidor rodando corretamente. Acesse /sensor/temperature ou /sensor/motion para ver os dados.');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});