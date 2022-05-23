const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;
const dotenv = require("dotenv");

// Use Middle ware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://manufacture-user:tHkfX7sfgZslO5nn@cluster0.whmvw.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const partsCollection = client
      .db("electronics-manufacturer")
      .collection("parts");
    const orderCollection = client
      .db("electronics-manufacturer")
      .collection("orders");

    // get all parts
    app.get("/parts", async (req, res) => {
      const query = {};
      const getParts = await partsCollection.find(query).toArray();
      res.send(getParts);
    });

    // get part by id
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const getPartById = await partsCollection.findOne(query);
      res.send(getPartById);
    });

    /* ---------------------------------------------------
                      order part 
    -----------------------------------------------------*/
    // create an order
    app.post("/orders", async (req, res) => {
      const body = req.body;

      const createOrder = await orderCollection.insertOne(body);
      res.status(201).json(createOrder);
    });

    // get order by email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const getOrder = await orderCollection.find(query).toArray();
      res.send(getOrder);
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
