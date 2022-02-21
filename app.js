const express = require("express");
const path = require("path");
const hbs = require("hbs");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
var cookieParser = require("cookie-parser");
require("./db/conn");



const Register = require("./models/register");
const Medicine = require("./models/medlist");
const Sale = require("./models/sale");
const { setDefaultResultOrder } = require("dns");
const static_path = path.join(__dirname,"./public");
const template_path = path.join(__dirname,"./views");
const partials_path = path.join(__dirname,"./partials");

const doten = require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cookieParser());
app.use(session({
    key: "user_sid",
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:600000
    }
}))

app.use((req,res,next)=>{

    if(req.session.user_sid && !req.session.user){
        res.clearCookie("user_sid");
    }
    next();
});

var sessionChecker = (req,res,next)=>{
    if(req.session.user && req.cookies.user_sid){
        res.redirect("/dashboard");
    }
    else{
        next();
    }
}


app.use(express.static(static_path));
app.set("view engine","hbs");
app.set('views',template_path);
hbs.registerPartials(partials_path);



app.get("/",sessionChecker, (req,res)=> {
    res.render("index");
})

app.get("/signup",sessionChecker,(req,res) => {
    res.render("signup");
})


app.post("/signup", async (req,res) => {
    
    try{

        const ssname = req.body.name;
        const semail = req.body.email;
        const spassword = req.body.password;

        const registershop = new Register({
            sname : ssname,
            email : semail,
            password: spassword
        })

        const registered = await registershop.save();
        res.status(201).render("signup",{stat:{success:true}});

    }catch(error){
        res.status(400).send(error);
    }
})
app.get("/login",sessionChecker,(req,res) =>{
    res.render("login");
})

app.post("/login", async (req,res) =>{
    
    try{

        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email: email});
        
        if(useremail.password === password){
            req.session.isauth = true;
            req.session.user = useremail;
            console.log(req.session.user);
            res.redirect("dashboard");
        }
        else{
            res.render("login", {flag:true});
            //res.send("Password does not match!!");
        }

    }catch(error){
        res.status(400).send(error);
    }
})

app.get("/dashboard", async (req,res)=> {
    if(req.session.user && req.cookies.user_sid){
        const email = req.session.user.email;
        console.log(req.session.user.email);

        let date_time = new Date();
        let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();

        const lst = await Medicine.find({$and: [{email:email},{expdate:{$eq:cmp_date}}]});
        //console.log(cmp_date);
        const today_sale = await Sale.find({$and: [{email: email},{date:cmp_date}]});

        let val = 0;
        for(let i=0;i<today_sale.length;i++){
            val+= today_sale[i].amount;
        }
        res.render("dashboard",{email: req.session.user.email,expcount:lst.length,medlst:lst,total: val,transaction: today_sale.length});
    }
    else{
        res.redirect("/");
    }
})

app.get("/logout",(req,res)=>{
    if(req.session.user && req.cookies.user_sid){
        res.clearCookie("user_sid");
        res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
})


app.get("/medlist", async (req,res)=>{
    if(req.session.isauth){

        const email = req.session.user.email;

        const data = await Medicine.find({email:{$eq: email}});
        //console.log(data);
        res.render("medlist",{data: data});
    }
    else{
        res.redirect("/");
    }
})

app.post("/addmed", async(req,res)=>{

    try{

        const email = req.session.user.email;
        const pname = req.body.pname;
        const ptype = req.body.ptype;
        const price = req.body.price;
        const quantity = req.body.quantity;
        const expdate = req.body.date;
        
        if(email!= null){
            
            const medicine = new Medicine({
                email : email,
                pname: pname,
                ptype : ptype,
                price : price,
                quantity : quantity,
                expdate: expdate
            }) 
            console.log(medicine);
            const added = await medicine.save();
            res.redirect("/medlist");
        }
    }
    catch(error){
        res.status(400).send(error);
    }
});


app.post("/delmed", async(req,res) =>{

    if(req.session.user){
            
        const id = req.body.id;

        const deletedmed = await Medicine.deleteOne({_id:id});
        res.redirect("medlist");
    }
    else{
        res.redirect("/");
    }
})

app.get("/sales", async (req,res) =>{

    if(req.session.user){
        const email = req.session.user.email;
        
        let date_time = new Date();
        let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();

        const mysale = await Sale.find({email: email});
        res.render("sales",{data: mysale});
    }
    else{
        res.redirect("/");
    }
})
app.post("/sold", async (req,res)=> {

    if(req.session.user){
        const email = req.session.user.email;
        const pname = req.body.pname;
        const quantity = req.body.quantity;
        const getdetails = await Medicine.findOne({$and: [{email:email},{pname:pname}]});
        const qty = parseInt(quantity);
        if(getdetails!=null && parseInt(getdetails.quantity)>=qty){
            var amt = parseInt(getdetails.price);
            amt*= qty;
            let date_time = new Date();
            let cmp_date = date_time.getFullYear()+'-'+'0'+ (date_time.getMonth()+1)+'-'+date_time.getDate();
            let newqty = parseInt(getdetails.quantity)-qty;
            const mysale = new Sale({

                email:email,
                pname : pname,
                quantity : quantity,
                amount: amt,
                date: cmp_date
            });
            const stat = await mysale.save();

            const newstat = await Medicine.updateOne({$and: [{email: email},{pname:pname}]},{"quantity":newqty.toString()});
            
        }
        res.redirect("/sales");
    }
    else{
        res.redirect("/");
    }

})

app.get('/inventory', async (req,res) => {

    if(req.session.user){
        const email = req.session.user.email;

        const inv_lst = await Medicine.find({email:email});

        res.render("inventory",{data: inv_lst});
    }
    else{
        res.redirect('/');
    }
})
app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})