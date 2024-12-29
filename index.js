const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routers/authRouter');
const pendaftarRouter = require('./routers/pendaftarRouter')
const adminRoutes = require('./routers/adminRouter')
const path = require('path');


const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cookieParser());

app.use('/pendaftar', pendaftarRouter)
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/test', (req, res) => {
    res.send('request masuk')
})

app.listen(port, ()=>{
    console.log(`server listening on port ${port}`)
})