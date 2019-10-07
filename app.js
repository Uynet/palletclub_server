const bodyParser = require('body-parser') // body-parser
const express = require("express");
const app = express();
const f = require('util').format;

const DBNAME = "test";
const COLNAME ="post"; 

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
app.get("/api/countPosts",(req,res)=>{
  CountPosts(res); 
})
app.post('/api/newPost', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  const data = req.body;
  insertPost(data);
})
  function CountPosts(response){
    console.log("COUNT")
    MongoClient.connect(url, {useNewUrlParser: true}, function(error, client) {
      if(error)throw error;
      const db = client.db(DBNAME);
      db.collection(COLNAME
        , (error2, collection)=> {
          if(error2)throw error2;
          collection.find().count((error3,count) => { 
            if(error3)throw error3;
            response.send(""+count);
          });
      })
    });
  }
  function removeAll(){
    return;
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      console.log("消えます");
      if (err) throw err;
      const db = client.db(DBNAME);
      db.collection(COLNAME).remove({});
      client.close();
    });
  }

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
