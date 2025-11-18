const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    let token
    const {authorization} = req.headers
    if(authorization && authorization.startsWith('Bearer')){
        try {
            token = authorization.split(' ')[1]
            const {userID} = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await userModel.findById(userID).select('-password')
        } catch (error) {
            console.log(error)
      res.status(401).send({ "status": "failed", "message": "Unauthorized User" })
        }
    }
    if(!token){
        res.status(401).send({ "status": "failed", "message": "Unauthorized User, No token" })
    }
}

module.exports = authMiddleware;