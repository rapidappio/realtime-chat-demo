const WebSocket = require('websocket').server;
const http = require('http');
const cors = require('cors');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

const Message = sequelize.define('Message', {
    username: Sequelize.DataTypes.STRING,
    text: Sequelize.DataTypes.STRING,
    timestamp: Sequelize.DataTypes.DATE
});

sequelize.authenticate().then(() =>{
    console.log("Connection has been established successfully.")
    Message.sync();
    createServer();
}).catch((err) => {
    console.error("Unable to connect to the database:", err)
})

function createServer() {

    const httpServer = http.Server((req, res) => {
        cors()(req, res, () => {
            if (req.url === '/messages') {
                fetchMessages().then((messages) => {
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    })
                    res.end(JSON.stringify(messages))
                })
            }
        })
    })

    const webSocketServer = new WebSocket({
        httpServer: httpServer
    })

    webSocketServer.on('request', (req) => {
        const connection = req.accept(null, req.origin);

        connection.on('message', (message) => {
            let msg = JSON.parse(message.utf8Data)
            Message.create({
                username: msg.username,
                text: msg.text,
                timestamp: msg.timestamp

            })
            webSocketServer.broadcast(JSON.stringify(message))
        })

        connection.on('close', () => {
            // defer conn
        })
    })

    httpServer.listen(3005, () => console.log('Listening on port 3005'));
}

function fetchMessages() {
    return Message.findAll();
}