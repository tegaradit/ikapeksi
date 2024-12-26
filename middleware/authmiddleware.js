const pool = require('../config/db')
const jwt = require('jsonwebtoken')


exports.authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: 'Token not provided' })
        }else{
            next()
        }
    }catch(err){
        return res.status(401).json({ message: 'Invalid token' })
    }
}
