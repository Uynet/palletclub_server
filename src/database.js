const MongoClient = require("mongodb").MongoClient;

const DATABASE = "palletclub";
const USERNAME = "admin";
const PASS = "pass";
const url = 'mongodb://'+USERNAME+':'+PASS+'@localhost:27017/'+DATABASE;

const testdata = [
  {
    name:"アセロラ",
    colors:"#952060,#e02070,#e0c090,#60b0b0"
  },
  {
    name:"あたたかみ",
    colors:"#c03020,#f0c0ba,#50b0c0,#303050"
  },
  {
    name:"夏色",
    colors:"#30b0d0,#faf0da,#f0c0a0,#e05070"
  },
  {
    name:"さむさむ",
    colors:"#403060,#f0c060,#50c0c0,#3080cf"
  },
  {
    name:"VIVIT",
    colors:"#f01070,#90c060,#3030a0,#f0a040"
  },
  {
    name:"風鈴",
    colors:"#45BDE2,#583F8E,#F64973,#F8DC79"
  },
  {
    name:"こんにちわ",
    colors:"#200050,#f3b000,#30a0c0,#ef1f6a"
  },
  {
    name:"ゆいちゃんカラー",
    colors:"#f0c070,#fa103d,#fa80c0,#8040fa"
  },
  {
    name:"夕焼け",
    colors:"#ed9050,#307080,#302070,#ff304a"
  },
  {
    name:"ふわふわ",
    colors:"#f0e0a0,#f0a0b0,#fafafa,#e0b090"
  },
  {
    name:"テンキーの5",
    colors:"#cdc9f0,#a0d090,#608ae0,#406ac0"
  },
]

module.exports = class{
  constructor(){
  }
  find(collection,query,callback){
    this.insertTestDate()
    MongoClient.connect(url ,(error, client) => {
      if (error) return console.dir(error); 
      const db = client.db(DATABASE);

      db.collection(collection, (err, collection)=> {
        collection.find(query).toArray((err, docs) => {
          callback(docs);
        });
      })

      client.close();
    });
  }
  CountPosts(collection,query,callback){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      const db = client.db(DATABASE
      );
      db.collection(collection , (err, collection)=> {
        collection.find(query).count((err,count) => { 
          if(err)throw err;
          callback(""+count);
        });
      })
    });
  }
  deletePost(collection,data,callback){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE
      );
      db.collection(collection).remove({ID:data.ID+""});
      callback("removed:"+data.ID)
      client.close();
    });
  }
  removeAll(collection){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      console.log("DELETE ALL");
      if (err) throw err;
      const db = client.db(DATABASE);
      db.collection(collection).remove({});
      client.close();
    });
  }
  update(collection,query,data,callback){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE);

      db.collection(collection).updateOne(query ,{$set: data  } , function(err, res) {
        if (err) throw err; 
        callback(data)
      });
      client.close();
    });
  }
  insert(collection,data,callback){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE);

      db.collection(collection).insertOne(data , function(err, res) {
        if (err) throw err; 
        callback(data)
      });
      client.close();
    });
  }
  count(collection,response){
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      const db = client.db(DATABASE);
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

    const callback = (d)=>{
      i++;
      if(i<l){
        const data = testdata[i];
        data.userID="uynet";
          data.date="2019/10/10/23:59";
        data.ID = i
        this.insert("posts",data,callback)
      }
      else{
      console.log("テストデータ挿入完了;")
       }
      console.log("testdata Inserted;",d)
    }
    // this.removeAll("posts"); 
    //
    /*
    testdata[0].ID = i;
    testdata[0].userID="uynet";
    testdata[0].date="2019/10/10/23:59";
    this.insert("posts",testdata[0],callback)
    */
  }
} 
