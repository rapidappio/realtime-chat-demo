const WebSocket = require('websocket').server;
const http = require('http');
const cors = require('cors');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgresql://u_306a01ba_4e58_4ac6_8fb0_24662c60d7ea:Gu6BtNy3Ja9dfVA4hiK2h450P5NI962u2On68m71wVgqZo2eIh47@pg.rapidapp.io:5432/db_306a01ba_4e58_4ac6_8fb0_24662c60d7ea?ssl=true&sslmode=no-verify&application_name=rapidapp_nodejs')

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