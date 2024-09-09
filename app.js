const express = require('express');
const mysql = require('mysql2');
const dotenv= require('dotenv');
const path=require('path');
const hbs=require('hbs');
const cookieParser=require('cookie-parser');

const app = express();

dotenv.config({
    path:'./.env'
})

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log("Database connection successful");
    }
});
 

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));


const location=path.join(__dirname,'./public');
app.use(express.static(location));
app.set('view engine','hbs');

const partialsPath=path.join(__dirname,'./views/partails');
hbs.registerPartials(partialsPath);

app.use('/',require('./routes/pages'))
app.use('/auth',require('./routes/auth'))


app.listen(5000, () => {
    console.log("server started at port 5000");
});
