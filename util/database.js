// USELESS SINCE MONGOOSE

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async () => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://john:John1706!%40%23$@cluster0.qgh6xdp.mongodb.net/shop?retryWrites=true&w=majority"
    );
    _db = client.db();
    // return client;
  } catch (err) {
    console.log(err);
  }
};

const getDb = () => {
  if (_db) return _db;
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
