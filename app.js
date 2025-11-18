const express = require('express')
require('dotenv').config()
const cors = require('cors')
const connectDB = require('./config/connectdb')
const userRoutes = require('./routes/userRoutes')



const app = express()

const port = process.env.PORT 
const DATABASE_URL = process.env.DATABASE_URL

app.use(cors())

connectDB(DATABASE_URL)

app.use(express.json())


app.use("/api/user", userRoutes)

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
  })