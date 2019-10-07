const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
const f = require('util').format;
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const corser = require("corser");//CORSをなんとかするやつ

const MongoClient = require("mongodb").MongoClient;
const authMechanism = 'DEFAULT';

const url = 'mongodb://user:pass@localhost:27017/test';

function findDB(response){
    MongoClient.connect(url ,(error, client) => {
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
  insertPost(data);
})
//postをDatabaseにinsert
function insertPost(data){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) throw err;
    const db = client.db("test");

    db.collection("posts").insertOne(data , function(err, res) {
      if (err) throw err;
      console.log("post",data)
    });
    client.close();
  });
}

app.listen(3001);
