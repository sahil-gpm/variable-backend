const express = require('express')
const router = express.Router();
const Room = require('../models/Room')

//create a new room 
router.post('/create-new-room', async (req, res) => {
    try {

        await Room.create({
            roomcode: req.body.roomCode,
            hostemail: req.body.hostEmail,
            hostname: req.body.hostName,
            hostsocketId: req.body.hostSocketId,
            members: [{
                userSocketId: req.body.hostSocketId,
                roomCode: req.body.roomCode,
                memberName: req.body.hostName,
                memberEmail: req.body.hostEmail,
                isHost: true
            }]
        }).then(() => {
            return res.json({ success: true, message: "room creation succeeded" })
        })
    } catch (e) {
        return res.json({ success: false, message: e.message })
    }
})

// get added in the room
router.post('/join-room', async (req, res) => {
    try {
        await Room.findOneAndUpdate({ roomcode: req.body.roomCode },
            {
                $push: {
                    members: {
                        userSocketId: req.body.userSocketId,
                        roomCode: req.body.roomCode,
                        memberName: req.body.memberName,
                        memberEmail: req.body.memberEmail
                    }
                }
            })
            .then(() => { return res.json({ success: true, message: "joined the room" }) }).catch(() => {
                return res.json({ success: false, message: "failed to join the room" })
            })
    } catch (e) {
        return res.json({ success: false, message: "room joining failed" })
    }
})

//check for room availability
router.post('/check-room-availaibility', async (req, res) => {
    const roomCode = req.body.roomCode
    await Room.findOne({
        roomcode: roomCode
    }, {
        hostname: 1,
        members: 1,
        hostemail: 1,
        roomchats: 1,
        blacklist: 1,
        _id: 0
    }).then((snapshot) => {
        res.status(200).json({ existance: snapshot === null ? false : true, roomDetails: snapshot })
    }).catch((err) => {
        res.status(404).json({ success: false })
    })
})

router.post('/remove-user-from-room', async (req, res) => {
    const roomCode = req.body.roomcode
    const userSocketId = req.body.userSocketId

    await Room.findOneAndUpdate({
        roomcode: roomCode,
    }, {
        $pull: {
            members: {
                userSocketId: userSocketId
            }
        }
    }, { new: true }).then((snapshot) => {
        res.status(200).json({ removeduser: true, roomDetails: snapshot })
    }).catch((err) => {
        res.status(400).json({ removeduser: false, message: err.message })
    })

})

router.post('/save-room-chats', async (req, res) => {
    const roomCode = req.body.roomCode
    const userChat = req.body.userChat

    await Room.findOneAndUpdate({
        roomcode: roomCode,
    }, {
        $push: {
            roomchats: {
                sender: userChat.sender,
                msg: userChat.msg
            }
        }
    }).then(() => {
        res.status(200).json({ chatadded: true })
    }).catch((err) => {
        res.status(400).json({ chatadded: false, message: err.message })
    })
})


router.post('/add-user-to-blacklist', async (req, res) => {

    const roomCode = req.body.roomCode
    const memberEmail = req.body.memberEmail
    console.log(req.body);

    await Room.findOneAndUpdate({ roomcode: roomCode }, {
        $push: {
            blacklist: memberEmail
        }
    }, { new: true }).then(() => {
        res.status(200).json({ addedtoblacklist: true })
    }).catch((err) => {
        res.status(400).json({ roomdelet: false, message: err.message })
    })
})

router.post('/delete-room-on-host-left', async (req, res) => {
    const roomCode = req.body.roomCode.roomCode
    await Room.deleteOne({ roomcode: roomCode }).then(() => {
        res.status(200).json({ roomdelete: true, message: "room deleted" })
    }).catch((err) => {
        res.status(400).json({ roomdelet: false, message: err.message })
    })

})


module.exports = router