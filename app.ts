const bodyParser = require("body-parser"); // body-parser
const express = require("express");
const app = express();
const f = require("util").format;
const corser = require("corser"); //CORSをなんとかするやつ

import Database from "./src/database"; 
const database = new Database();
const config = require("./config.js"); 

const TwitterStrategy = require("passport-twitter");
const passport = require("passport");
const session = require("express-session"); 

const colpost = "posts";

const NOP = () => {};
const selectAll = {};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(corser.create());
app.use(
  session({
    secret: "secret-key",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 認証の設定
passport.use(
  new TwitterStrategy(
    {
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

        const accountData = {
          id: id, //これはtwitterのIDではない
          name: name, //ユーザー名
          screen_name: screen_name, //twitterID
          accessToken: accessToken,
          description,
          url,
          profile_image_url: profile_image_url.replace("_normal", "") //こうしないと解像度が低くてボケる
        };

        const f = cnt => {
          if (cnt === "0") {
            console.log("new user created:", screen_name);
            database.insert("users", accountData, NOP);
          } else {
            console.log("account is aleady exist:", screen_name);
            const query = { screen_name: screen_name };
            database.update("users", query, accountData, NOP);

            //いいねした投稿の一覧はアップデートしなくてよい
          }
          return callback(null, accountData);
        };
        database.CountPosts("users", { screen_name: screen_name }, f);
      });
    }
  )
);
// セッションへの保存と読み出し
passport.serializeUser((user, callback) => {
  callback(null, user);
});
passport.deserializeUser((obj, callback) => {
  callback(null, obj);
});

function like(userData, post, callback) {}

/* DB関連 */
app.get("/", (req, res) => {
  res.send("hello this is serverside.");
});

//全投稿数をカウントする
//新しい投稿のIDを決めるのに使う
app.get("/api/countPosts", (req, res) => {
  database.CountPosts(colpost, selectAll, c => res.send(c));
});

//あるuserがlikeしたPosts一覧を取得
app.post("/api/getLikedPosts", (req, res) => {
  const screen_name = req.body.screen_name;

  database.find(
    "userLikedList",
    { screen_name: screen_name },
    likedPostInfos => {
      const query = likedPostInfos.map(info => {
        return { ID: parseInt(info.postID) };
      });
      const conds = (query.length > 0 ) ? { $or: query } : {}
      database.find(colpost, conds , likedPosts => {
        res.send(likedPosts);
      });
    }
  );
});

/// いいねボタンを押した時にいいねをtoggleする
app.post("/api/onLike", (req, res) => {
  const data = req.body;
  // ユーザーIDといいねした投稿のIDを紐づける
  // 重複しないように注意
  console.log("likeduser:", data.screen_name);
  console.log("post:", data.postID);

  database.CountPosts(
    "userLikedList",
    { screen_name: data.screen_name, postID: data.postID },
    cnt => f(cnt)
  );

  // いいねのtoggle
  const f = cnt => {
    const isLiked = cnt == 1;
    if (!isLiked) {
      console.log("ONLIKE:", cnt);
      database.insert(
        "userLikedList",
        {
          screen_name: data.screen_name,
          postID: data.postID,
          date: new Date()
        },
        c => res.send(c)
      );
    } else {
      console.log("UNLIKE");
      database.remove("userLikedList", { postID: data.postID }, c =>
        res.send(c)
      );
    }
  };
});

//指定したqueryの投稿を削除
app.post("/api/deletePost", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const data = req.body;
  database.deletePost(colpost, data, c => res.send(c));
});

//あるpostのいいね数を取得
//ついでに「ユーザーがこの投稿をいいねしているか」も取得(よくない)
app.post("/api/getLikeCount", (req, res) => {
  const postID = req.body.postID;
  const screen_name = req.body.screen_name;

  database.CountPosts("userLikedList", { postID: postID }, cnt => {
    database.CountPosts(
      "userLikedList",
      { screen_name: screen_name, postID: postID },
      c => res.send({ cnt: cnt, isLiked: c == 1 })
    );
  });
});

//全ての投稿をget
app.get("/api/getPosts", (req, res) => {
  database.find(colpost, selectAll, c => res.send(c));
});
app.post("/api/newPost", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  const data = req.body;
  const callback = d => {
    console.log("posted:", d);
    res.send(d);
  };
  database.insert(colpost, data, callback);
});

// 特定のscreen_nameを持つuserdataを返す
// 要素が1または0の配列になるのでよしなに
app.post("/api/getUserData", (req, res) => {
  database.find("users", { screen_name: req.body.screen_name }, c =>
    res.send(c)
  );
});

//アクセストークンに対応するuserを返す
app.post("/api/checkAccessToken", (req, res) => {
  console.log(req.body.accessToken);
  database.find("users", { accessToken: req.body.accessToken }, c =>
    res.send(c)
  );
});

// 指定したpathで認証
app.get("/auth/twitter", passport.authenticate("twitter"));

// callback後の設定
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/login" }),
  (req, res) => {
    const { screen_name, accessToken } = req.user;
    res.redirect(
      config.clientURL + "login/" + screen_name + "?accessToken=" + accessToken
    );
  }
);

app.listen(3001);
