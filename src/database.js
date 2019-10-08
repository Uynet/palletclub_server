const MongoClient = require("mongodb").MongoClient;

const DBNAME = "test";
const COLNAME = "posts";
const url = 'mongodb://user:pass@localhost:27017/test';

module.exports = class{
  constructor(){
  }
  find(response){
    MongoClient.connect(url ,(error, client) => {
      if (error) return console.dir(err); 
      const db = client.db(DBNAME);

      db.collection(COLNAME, (err, collection)=> {
        collection.find().toArray((err, docs) => {
          response.send(docs);
          console.log(docs);
        });
      })
      client.close();
    });
  }
  CountPosts(response){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      const db = client.db("test");
      db.collection("posts", (err, collection)=> {
        collection.find().count((err,count) => { 
          if(err)throw err;
          response.send(""+count);
        });
      })
    });
  }
  deletePost(response,data){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db("test");
      db.collection("posts").remove({ID:data.ID+""});
      response.send("removed:"+data.ID)
      client.close();
    });
  }
  removeAll(){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      console.log("消えます");
      if (err) throw err;
      const db = client.db("test");
      db.collection("posts").remove({});
      client.close();
    });
  }
  insertData(data){
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
} 
