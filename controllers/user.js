const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisify }=require('util');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

exports.login = async (req, res) => {
    try{
        const {email, password,} = req.body;
        if(!email ||  !password){
            return res.status(400).render('login',{msg: 'Please enter your email and password', msg_type: 'error'})
        }
        db.query('select * from users where email=?',[email], async(err,result)=>{
            console.log(result);
            if(result.length<=0){
                return res.status(401).render('login',{msg: 'Email not found', msg_type: 'error'})
            }else{
                if(!(await bcrypt.compare(password,result[0].PASS))){
                    return res.status(401).render('login',{msg: 'Invalid password', msg_type: 'error'});
                    
                }else{
                    const id=result[0].ID;
                    const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN,
                    });                    
                    console.log('The Token is '+token);
                    const cookieOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),  // JWT_COOKIE_EXPIRES should be a number (in days)
                        httpOnly: true,
                    };
                    res.cookie('rosh', token, cookieOptions);
                    res.status(200).redirect("/home");
                    
                }

            }
        })
    }catch(err)
    {
        console.log(error);
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.render('register', { msg: 'Passwords do not match', msg_type: 'error' });
        }

        db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).render("register", { msg: "An error occurred. Please try again later.", msg_type: "error" });
            }
            if (results.length > 0) {
                return res.render("register", { msg: "Email ID already taken", msg_type: "error" });
            }

            const hashedPassword = await bcrypt.hash(password, 8);

            db.query('INSERT INTO users SET ?', { name, email, pass: hashedPassword }, (err, results) => {
                if (err) {
                    console.error('Database insertion error:', err);
                    return res.status(500).render("register", { msg: "An error occurred. Please try again later.", msg_type: "error" });
                }
                return res.render("register", { msg: "User registration successful", msg_type: "good" });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).render("register", { msg: "An error occurred. Please try again later.", msg_type: "error" });
    }
};


exports.isLoggedIn = async (req,res,next) =>{
    // res.name='check login...';
    console.log(req.cookies);
    if(req.cookies.rosh){
        try{
          const decode = await promisify(jwt.verify)(
            req.cookies.rosh,
            process.env.JWT_SECRET
          );
          console.log(decode);
          db.query('select * from users where id =?',[decode.id],(err,result)=>{
            console.log(result);
            if(!result){
                return next();
            }
            req.user=result[0];
            return next();
          });

        }catch(err){
            console.log(err);
            return next();
        }

    }else{
        next()
    }
    
}