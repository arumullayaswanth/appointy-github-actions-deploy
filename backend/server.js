import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import app from './app.js'

const port = process.env.PORT || 4000

connectDB()
connectCloudinary()

app.listen(port, () => console.log(`Server started on PORT:${port}`))
