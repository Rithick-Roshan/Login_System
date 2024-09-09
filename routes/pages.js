const express=require('express')
const router=express.Router();
const userController=require('../controllers/user');
router.get(['/','/login'], (req, res) => {
    // res.send("<h1>hello rithick</h1>");
    res.render('login');
});
router.get('/register', (req, res) => {
    // res.send("<h1>hello rithick</h1>");
    res.render('register');
});

router.get('/profile',userController.isLoggedIn,(req,res)=>{
    if(req.user){
        res.render('profile',{user:req.user})
   }else{
       res.redirect('/login');
   }
})

router.get('/home',userController.isLoggedIn,(req,res)=>{
    // console.log(res.name);
    if(req.user){
         res.render('home',{user:req.user})
    }else{
        res.redirect('/login');
    }
})

router.get('*', (req, res) => {
    res.send("<h1>404 error</h1>")
});


module.exports=router;