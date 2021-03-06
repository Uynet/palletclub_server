import { MongoClient } from "mongodb";
import { OperationCanceledException, isReturnStatement } from "typescript";

const DATABASE = "palletclub";
const USERNAME = "admin";
const PASS = "pass";
const url =
  "mongodb://" + USERNAME + ":" + PASS + "@localhost:27017/" + DATABASE;

interface Post {
  name: string;
  colors: string;
  date?: Date;
  description?: string;
  ID?: Number;
  userID?: string;
}

const testdata: Post[] = [
  {
    name: "アセロラ",
    colors: "#952060,#e02070,#e0c090,#60b0b0"
  },
  {
    name: "あたたかみ",
    colors: "#c03020,#f0c0ba,#50b0c0,#303050"
  },
  {
    name: "夏色",
    colors: "#30b0d0,#faf0da,#f0c0a0,#e05070"
  },
  {
    name: "さむさむ",
    colors: "#403060,#f0c060,#50c0c0,#3080cf"
  },
  {
    name: "VIVIT",
    colors: "#f01070,#90c060,#3030a0,#f0a040"
  },
  {
    name: "風鈴",
    colors: "#45BDE2,#583F8E,#F64973,#F8DC79"
  },
  {
    name: "こんにちわ",
    colors: "#200050,#f3b000,#30a0c0,#ef1f6a"
  },
  {
    name: "ゆいちゃんカラー",
    colors: "#f0c070,#fa103d,#fa80c0,#8040fa"
  },
  {
    name: "夕焼け",
    colors: "#ed9050,#307080,#302070,#ff304a"
  },
  {
    name: "ふわふわ",
    colors: "#f0e0a0,#f0a0b0,#fafafa,#e0b090"
  },
  {
    name: "テンキーの5",
    colors: "#cdc9f0,#a0d090,#608ae0,#406ac0"
  }
];

export default class Database {
  constructor() {}
  find(collection, query, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
      if (error) return console.dir(error);
      const db = client.db(DATABASE);

      db.collection(collection, (err, collection) => {
        if (err) throw err;
        collection.find(query).toArray((err, docs) => {
          if (err) throw err;
          callback(docs);
        });
      });

      client.close();
    });
  }
  CountPosts(collection, query, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      const db = client.db(DATABASE);
      db.collection(collection, (err, collection) => {
        collection.find(query).count((err, count) => {
          if (err) throw err;
          callback("" + count);
        });
      });
      client.close();
    });
  }
  remove(collection, query, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE);
      db.collection(collection).remove(query);
      callback("removed:");
      client.close();
    });
  }
  removeAll(collection, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      console.log("DELETE ALL");
      if (err) throw err;
      const db = client.db(DATABASE);
      db.collection(collection).remove({});
      callback();
      client.close();
    });
  }
  update(collection, query, data, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE);

      db.collection(collection).updateOne(query, { $set: data }, function(
        err,
        res
      ) {
        if (err) throw err;
        callback(data);
      });
      client.close();
    });
  }
  insert(collection, data, callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      if (err) throw err;
      const db = client.db(DATABASE);

      db.collection(collection).insertOne(data, function(err, res) {
        if (err) throw err;
        callback(data);
      });
      client.close();
    });
  }

  insertTestData() {
    let i = 0;
    const l = testdata.length;

    // const iterator = testdata.values;

    const self = this;
    function callback(d) {
      if (i < l) {
        const data = testdata[i];
        console.log(data);
        data.date = new Date();
        data.description =
          "色の説明です。このように、色の説明では色の説明を書くことができ、また読む人は色の説明を視覚することによって読むことができます。";
        data.ID = i++;
        data.userID = "uynet";
        self.insert("posts", data, callback);
        console.log("testdata Inserted;", data);
      } else {
        console.log("テストデータ挿入完了;");
        return;
      }
    }
    this.removeAll("posts", callback);
  }

  findAsync(collection, query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if (error) return console.dir(error);
        const db = client.db(DATABASE);
        db.collection(collection, (err, collection) => {
          if (err) reject(err);
          collection.find(query).toArray((err, docs) => {
            if (err) reject(err);
            resolve(docs);
          });
        });
        client.close();
      });
    });
  }
  removeAsync(collection, query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, function(
        err,
        client
      ) {
        if (err) reject(err);
        const db = client.db(DATABASE);
        db.collection(collection).remove(query);
        resolve();
        client.close();
      });
    });
  }
  removeAllAsync(collection) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, function(
        err,
        client
      ) {
        console.log("DELETE ALL");
        if (err) reject(err);
        const db = client.db(DATABASE);
        db.collection(collection).remove({});
        resolve();
        client.close();
      });
    });
  }
  updateAsync(collection, query, data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, function(
        err,
        client
      ) {
        if (err) throw err;
        const db = client.db(DATABASE);

        db.collection(collection).updateOne(query, { $set: data }, function(
          err,
          res
        ) {
          if (err) reject(err);
          resolve(data);
        });
        client.close();
      });
    });
  }

  insertAsync(collection, data) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, function(
        err,
        client
      ) {
        if (err) throw err;
        const db = client.db(DATABASE);

        db.collection(collection).insertOne(data, function(err, res) {
          if (err) reject(err);
          resolve(data);
        });
        client.close();
      });
    });
  }

  countPostsAsync(collection, query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true }, function(
        err,
        client
      ) {
        if (err) reject(err);
        const db = client.db(DATABASE);
        db.collection(collection, (err, collection) => {
          if (err) reject(err);
          collection.find(query).count((err, count) => {
            if (err) reject(err);
            resolve(count);
          });
        });
        client.close();
      });
    });
  }

  deletePost(...args) {
    throw new Error("not implemented");
  }
}
