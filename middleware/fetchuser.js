const jwt = require('jsonwebtoken')

const fetchuser = (req,res,next) => {
    const token = req.header("authtoken")
    if(!token){
        return res.status(400).json({error:"Invalid authentication token"})
    }
    //try to get user data if the token is legitimate
    try{
        const data = jwt.verify(token,process.env.SECRETKEY)
        // console.log(data)
        req.userId = data.payload
        next()
    }catch(e){
        res.status(401).json({error:e.message})
    }
}
module.exports = fetchuser