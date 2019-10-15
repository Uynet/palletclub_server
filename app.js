const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
const f = require('util').format;
const corser = require("corser");//CORSをなんとかするやつ

const DB = require("./src/database"); 
const database  = new DB(); 
const config = require("./config.js"); 

let accountData;

const TwitterStrategy = require('passport-twitter'); 
const passport = require('passport');
const session = require('express-session');

const colpost = "posts";

 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(corser.create());
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
      const {
        id,
        name,
        screen_name,
        profile_image_url,
        description,
        url
      } = profile._json;
      console.log(profile_image_url.replace("_normal",""))//こうしないと解像度が低くてボケる

      const accountData = {
        id:id,//これはtwitterのIDではない
        name:name,//ユーザー名
        screen_name:screen_name, //twitterID
        accessToken:accessToken, 
        description,
        url,
        profile_image_url:profile_image_url.replace("_normal","")//こうしないと解像度が低くてボケる
      }

      const f = (cnt)=>{
        // console.log("cnt:",cnt)
        if(cnt==="0"){
          console.log("new user created:",screen_name);
          database.insertOne("users", accountData,()=>{});
        }
        else {
          console.log("account is aleady exist:",screen_name);
          const query = {screen_name:screen_name}
          database.update("users", query , {accountData:accountData} ,()=>{});
        }
        return callback(null, accountData);
      }
      database.CountPosts("users",{screen_name:screen_name},f);
    });
  }));
// セッションへの保存と読み出し
passport.serializeUser((user, callback) => { callback(null, user); });
passport.deserializeUser((obj, callback) => { callback(null, obj); });


/* DB関連 */ 
app.get("/",(req,res)=>{ res.send("hello this is serverside."); })
app.get("/api/countPosts",(req,res)=>{ database.CountPosts(colpost,{},c=>res.send(c)); })
app.post("/api/deletePost",(req,res)=>{ 
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  database.deletePost(colpost,data,c=>res.send(c));
})
app.get("/api/getPosts",(req,res)=>{
  database.find(colpost,{},c=>res.send(c));
  //database.removeAll(); 
})
app.post('/api/newPost', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  const callback = (d)=>{
    console.log("posted:",d)
    res.send(d)
  }
  database.insert(colpost,data,callback); 
})
app.post("/api/getUserData",(req,res)=>{
  // 特定のscreen_nameを持つuserdataを返す
  // 要素が1または0の配列になるのでよしなに
  database.find("users",{screen_name:req.body.screen_name},c=>res.send(c));
})
//アクセストークンに対応するuserを返す
app.post("/api/checkAccessToken",(req,res)=>{
  console.log(req.body.accessToken)
  database.find("users",{accessToken:req.body.accessToken},c=>res.send(c));
})

// 指定したpathで認証
app.get('/auth/twitter', 
  passport.authenticate('twitter'),
);

// callback後の設定
app.get('/auth/twitter/callback', passport.authenticate('twitter', {failureRedirect: '/login' }), (req, res) => {
  const {
    screen_name,
    accessToken
  } = req.user
  const cliantURL ="http://127.0.0.1:3000/" 
  res.redirect(cliantURL+"login/"+screen_name+"?accessToken="+accessToken);
});

app.listen(3001);


