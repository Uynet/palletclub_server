const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
const f = require('util').format;
const passport = require('passport');
const corser = require("corser");//CORSをなんとかするやつ
const TwitterStrategy = require('passport-twitter'); 
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const MongoClient = require("mongodb").MongoClient;
const authMechanism = 'DEFAULT';
const DB = require("./src/database"); 
const database  = new DB(); 

const url = 'mongodb://user:pass@localhost:27017/test';


app.use(corser.create());

app.get("/",(req,res)=>{
  res.send("hello this is serverside.");
})
app.get("/api/countPosts",(req,res)=>{
  database.CountPosts(res); 
})
app.get("/api/getPosts",(req,res)=>{
  database.find(res);
  //database.removeAll(); 
})
app.post("/api/removeAll ",(req,res)=>{
  database.removeAll(); 
})
app.post('/api/newPost', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  database.insertData(data); 
})

app.listen(3001);
