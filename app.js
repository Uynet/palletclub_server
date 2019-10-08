const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
const f = require('util').format;
const corser = require("corser");//CORSをなんとかするやつ

const DB = require("./src/database"); 
const database  = new DB(); 
const config = require("./config.js"); 

let accountData;
//const po = require("./src/auth.js");
//onst TwitterAuth = new po();

const TwitterStrategy = require('passport-twitter'); 
const passport = require('passport');
const session = require('express-session');


 
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(corser.create());
// セッションの設定
app.use(session({
  secret: 'secret-key',
  resave: true,
  saveUninitialized: true
}));
 
app.use(passport.initialize());
app.use(passport.session());
// 認証の設定
passport.use(new TwitterStrategy({
  consumerKey: config.consumerKey,
  consumerSecret: config.consumerSecret,
  callbackURL: config.callbackURL
},

  // 認証後のアクション
(accessToken, refreshToken, profile, callback) => {
    process.nextTick(() => {
        accountData = profile._json;
        console.log(accountData);
        return callback(null, profile);
    });
}));
// セッションへの保存と読み出し
passport.serializeUser((user, callback) => { callback(null, user); });
passport.deserializeUser((obj, callback) => { callback(null, obj); });


/* DB関連 */ 
app.get("/",(req,res)=>{ res.send("hello this is serverside."); })
app.get("/api/countPosts",(req,res)=>{ database.CountPosts(res); })
app.post("/api/removeAll ",(req,res)=>{ database.removeAll(); })
app.post("/api/deletePost",(req,res)=>{ 
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  database.deletePost(res,data);
})
app.get("/api/getPosts",(req,res)=>{
  database.find(res);
  //database.removeAll(); 
})
app.post('/api/newPost', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  database.insertData(data); 
})

//AUTH
/*
app.get('/auth/twitter', (req,res)=>{ TwitterAuth.auth(res); }) 
app.get('/auth/twitter/callback', (req,res)=>{ TwitterAuth.callback(res) });
*/


// 指定したpathで認証
app.get('/auth/twitter', passport.authenticate('twitter'));
// callback後の設定
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login' }), (req, res) => {
  // res.redirect('/');
  res.redirect('http://127.0.0.1:3000/');
});

app.listen(3001);


