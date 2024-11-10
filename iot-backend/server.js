const express = require('express');
const app = express();
const port = 3000;

const { addMovement, getAllMovements } = require('./db');


//http://192.168.48.148:3000/

let lastTemperature = null;
let lastMotion = null;
let alarmActivated = false;
let lastNotificationTime = null;

// Middleware para ler JSON
app.use(express.json());


// ligar/desligar o alarme (curl -X POST http://192.168.48.148:3000/alarm/toggle)
app.post('/alarm/toggle', (req, res) => {
    alarmActivated = !alarmActivated;
    res.send(`Alarme ${alarmActivated ? 'ativado' : 'desativado'}`);
    console.log(`Alarme ${alarmActivated ? 'ativado' : 'desativado'}`);     
});


app.get('/alarm', (req, res) => {
    res.send(`O alarme está ${alarmActivated ? 'ativado' : 'desativado'}`);
});


// exibir os dados de temperatura no navegador
app.get('/sensor/temperature', (req, res) => {
    if (lastTemperature !== null) {
        res.send(`Última temperatura recebida: ${lastTemperature}°C`);
    } else {
        res.send('Nenhuma temperatura recebida ainda');
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

// receber dados de temperatura
app.post('/sensor/temperature', (req, res) => {
    lastTemperature = req.body.temperature;
    console.log(`Temperatura recebida: ${lastTemperature}°C`);
    res.send('Temperatura recebida com sucesso');
});


// receber dados do sensor de movimento (curl -X POST http://localhost:3000/sensor/motion -H "Content-Type: application/json" -d "{\"motion\": \"Movimento\"}")
app.post('/sensor/motion', (req, res) => {
    lastMotion = req.body.motion;
    console.log(`Estado do sensor de movimento: ${lastMotion}`);
    
    if (alarmActivated && lastMotion === 'Movimento') {
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
            console.log('Registros:', rows);
            res.send('Movimentos impressos no console');
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