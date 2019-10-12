const MongoClient = require("mongodb").MongoClient;

const DBNAME = "palletclub";
const USERNAME = "admin";
const PASS = "pass";
const url = 'mongodb://'+USERNAME+':'+PASS+'@localhost:27017/'+DBNAME;

const testdata = [
  {
    name:"アセロラ",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#952060,#e02070,#e0c090,#60b0b0"
  },
  {
    name:"あたたかみ",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#c03020,#f0c0ba,#50b0c0,#303050"
  },
  {
    name:"夏色",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#30b0d0,#faf0da,#f0c0a0,#e05070"
  },
  {
    name:"さむさむ",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#403060,#f0c060,#50c0c0,#3080cf"
  },
  {
    name:"VIVIT",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#f01070,#90c060,#3030a0,#f0a040"
  },
  {
    name:"風鈴",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#45BDE2,#583F8E,#F64973,#F8DC79"
  },
  {
    name:"こんにちわ",
    userID:"uynet",
    date:"2019/10/10/23:59",
    colors:"#200050,#f3b000,#30a0c0,#ef1f6a"
  },
]

module.exports = class{
  constructor(){
  }
  find(collection,callback,query){
    this.insertTestDate()
    MongoClient.connect(url ,(error, client) => {
      if (error) return console.dir(error); 
      const db = client.db(DBNAME);

      db.collection(collection, (err, collection)=> {
        collection.find(query).toArray((err, docs) => {
          callback(docs);
        });
      })

      client.close();
    });
  }
  CountPosts(collection,callback,query){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      const db = client.db(DBNAME
      );
      db.collection(collection , (err, collection)=> {
        collection.find(query).count((err,count) => { 
          if(err)throw err;
          callback(""+count);
        });
      })
    });
  }
  deletePost(collection,callback,data){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db(DBNAME
      );
      db.collection(collection).remove({ID:data.ID+""});
      callback("removed:"+data.ID)
      client.close();
    });
  }
  removeAll(collection){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      console.log("消えます");
      if (err) throw err;
      const db = client.db(DBNAME);
      db.collection(collection).remove({});
      client.close();
    });
  }
  insertData(collection,data){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db(DBNAME);

      db.collection(collection).insertOne(data , function(err, res) {
        if (err) throw err;
        // console.log("post",data)
      });
      client.close();
    });
  }

  count(collection,response){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      const db = client.db(DBNAME);
      db.collection(collection, (err, collection)=> {
        collection.find().count((err,cnt) => { 
          if(err)throw err;
          return cnt;
        });
      })
    });
  }

  insertTestDate(){
    let i = 0;
    const l = testdata.length;
    testdata.forEach(data=>{
      data.ID = i
      //this.insertData("posts",data)
      i++;
    })
    //this.removeAll(); 
  }
} 
