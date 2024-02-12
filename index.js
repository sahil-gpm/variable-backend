const express = require('express');
const http = require('http')
const cors = require('cors')
const connectToMongo = require('./db/dbConnect')
const socketIoHandler = require('./websockets/socket');
//express and socket io instance
const app = express();
const server = http.createServer(app);

//middlewares
app.use(express.json())
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ parameterLimit: 1000000000000000, limit: '500mb', extended: true }));
app.use(cors({
    origin:"https://variable.onrender.com",
}
))

//connecting to mongo db and socket io server
connectToMongo()
socketIoHandler(server)

//adding the routes for authentication
app.use("/api/auth", require("./routes/auth"))
app.use("/api/room", require("./routes/room"))

app.get('/', (req, res) => {
    res.send("hello")
});

server.listen(3001, () => {
    console.log("Server running on port 3001");
})
