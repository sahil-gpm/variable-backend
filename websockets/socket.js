const { default: axios } = require('axios')
const { Server } = require('socket.io')
const dotenv = require('dotenv')
dotenv.config()

const socketIoHandler = (server) => {

    const io = new Server(server, {
        cors: {
            origin:"https://variable.onrender.com",
            methods: ["POST", "GET"]
        }
    })

    io.on('connection', socket => {

        //storing required values
        let members = []
        let roomcode;

        socket.on("joining-room", async ({ roomCode, joiningMemberName }) => {

            //setting up some required values
            roomcode = roomCode
            socket.join(roomCode)
            //whenever the code page is rendered make the user join the room
            //then emit the joined event to notify everyone on the room 
            // get information regarding room members 

            // updating the members in frontend
            const response = await axios.post("http://localhost:3001/api/room/check-room-availaibility", { roomCode })
            if (response.data.existance) {
                members = response.data.roomDetails?.members;
                members.forEach(({ userSocketId }) => {
                    io.to(userSocketId).emit("joined-room", { members, joiningMemberName })
                });
            }
        })

        socket.on('disconnecting', () => {
            members.forEach((member) => {
                // if disconnected member record is present in database then emit disconnected event and remove user from data base also 
                if (member.userSocketId === socket.id) {
                    axios.post("http://localhost:3001/api/room/remove-user-from-room", { roomcode, userSocketId: member.userSocketId }).then((snapshot) => {
                        members = snapshot.data.roomDetails?.members
                        socket.in(roomcode).emit("disconnected", { leavingMemberName: member.memberName, members })
                        socket.leave(member.userSocketId)
                    }).catch((err) => {
                        console.log(err.message);
                    })
                }
            })
        });

        socket.on('send-msg', ({ sender, msg, roomCode }) => {
            axios.post("http://localhost:3001/api/room/save-room-chats", { roomCode, userChat: { sender, msg } }).then((response) => {
                if (response.data.chatadded) {
                    socket.in(roomCode).emit('received-msg', ({ sender, msg }))
                }
            }).catch((e) => {
                console.log(e.message);
            })
        })

        socket.on("change-mode", ({ newMode, roomCode }) => {
            socket.in(roomCode).emit("mode-changed", ({ newMode }))
        })

        socket.on('code-change', ({ writer, writtenCode, roomCode }) => {
            socket.in(roomCode).emit("writing-code", ({ writer, writtenCode }))
        })

        socket.on('remove-user-from-room', ({ memberEmail,roomCode,userSocketId }) => {
            console.log(memberEmail + roomCode + userSocketId);
            axios.post("http://localhost:3001/api/room/add-user-to-blacklist", {memberEmail,roomCode}).then((response) => {
                if (response.data.addedtoblacklist) {
                    io.to(userSocketId).emit('removed')
                }
            }).catch((e) => {
                console.log(e.message);
            })
        })

        socket.on("end-room", ({ roomCode }) => {
            socket.in(roomCode).emit("room-ended")
            io.socketsLeave(roomCode)
        })

    })
}

module.exports = socketIoHandler;