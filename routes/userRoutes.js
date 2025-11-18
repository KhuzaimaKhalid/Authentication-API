const express = require('express')
const {register,login,changeUserPassword,loggedUser,sendPasswordResetEmail,resetUserPassword} = require('../controllers/userController')
const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.post('/send-reset-password-email', sendPasswordResetEmail)
router.post('/reset-password/:id/:token', resetUserPassword)

router.post('/changepassword', changeUserPassword)
router.get('/loggeduser', loggedUser)

module.exports = router