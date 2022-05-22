const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;
const dotenv = require("dotenv");

// Use Middle ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://manufacture-user:tHkfX7sfgZslO5nn@cluster0.whmvw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// client.connect((err) => {
//   const collection = client.db("electronics-manufacturer").collection("parts");
// perform actions on the collection object
// client.close();

// console.log("server");

// app.get("/parts", async (req, res) => {
//   const query = {};
//   const getParts = await collection.find(query).toArray();
//   res.send(getParts);
// });
// });

async function run() {
  try {
    await client.connect();
    const collection = client
      .db("electronics-manufacturer")
      .collection("parts");

    app.get("/parts", async (req, res) => {
      const query = {};
      const getParts = await collection.find(query).toArray();
      res.send(getParts);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("backed server connected");
});

app.listen(port, () => {
  console.log("Backend server is running!");
});
