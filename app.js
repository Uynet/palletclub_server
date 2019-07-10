const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const corser = require("corser");//CORSをなんとかするやつ
const mysql = require("mysql");


var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/test"; 

function findDB(response){
    MongoClient.connect(url, (error, client) => {
      if (error) {
        return console.dir(err);
      }
      const db = client.db('test');
      db.collection("posts", (err, collection)=> {
        collection.find().toArray((err, docs) => {
          response.send(docs);
        });
      })
      client.close(); 
    }); 
}

app.use(corser.create());

app.get("/",(req,res)=>{
  res.send("hello this is serverside.");
})
app.get("/api/getPosts",(req,res)=>{
  findDB(res); 
})
app.post('/api/newPost', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  const countQuery = 'select count(*) from posts';
  const selectAllQuery = 'select * from posts;' 
  const insertQuery = 'insert into posts(id,title,content) values(?,?,?);' ;
  insertPost(data);
})
//postをDatabaseにinsert
function insertPost(data){
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    const db = client.db("test");

    db.collection("posts").insertOne(data , function(err, res) {
      if (err) throw err;
    });
      client.close();
  });
}

app.listen(3001);
