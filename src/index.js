const express = require("express")
const path =  require("path")
const http = require("http")
const socketio = require('socket.io')
const Filter = require('bad-words')
const { genarateMessage,genarateLocationMessage } = require('./utils/message')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log("New websocket connection")

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id,...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', genarateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', genarateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendmessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback("Profanity is not allowed!")
        }

        io.to(user.room).emit('message', genarateMessage(user.username,msg))
        callback()
    })

    socket.on('sendlocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', genarateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', genarateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log(`server is up on ${port}`)
})