const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'data.db');

// conexão com o banco de dados SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`
CREATE TABLE IF NOT EXISTS temperature (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// inserir um registro de movimento
function addMovement() {
    db.run(`INSERT INTO movements DEFAULT VALUES`, (err) => {
        if (err) {
            console.error('Erro ao adicionar movimento:', err.message);
        } else {
            console.log('Movimento registrado com sucesso');
        }
    });
}

// função para obter registros
function getAllMovements(callback) {
    db.all(`SELECT * FROM movements`, (err, rows) => {
        if (err) {
            console.error('Erro ao obter movimentos:', err.message);
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

function addTemperature(temperature, callback) {
    const query = `INSERT INTO temperature (temperature) VALUES (?)`;
    db.run(query, [temperature], function (err) {
        if (err) {
            console.error('Erro ao salvar temperatura:', err.message);
            if (callback) callback(err);
        } else {
            console.log('Temperatura registrada no banco de dados.');
            if (callback) callback(null);
        }
    });
}

module.exports = {
    db,
    addMovement,
    getAllMovements,
    addTemperature
};
