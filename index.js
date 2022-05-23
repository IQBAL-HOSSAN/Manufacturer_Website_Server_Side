const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Use Middle ware
app.use(cors());
app.use(express.json());

// create jwt token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "process.env.TOKEN_SECRET_KEY", function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const userCollection = client
      .db("electronics-manufacturer")
      .collection("users");

    // jwt sign

    /* --------------------------------------
                    users api's
      -------------------------------------- */

    // update user or create
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };

      const updateUser = await userCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign({ email: email }, "process.env.TOKEN_SECRET_KEY");

      res.send({ updateUser, token });
    });

    // get all users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

    // make admin
    app.put("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const query = { email: email };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const makeAdmin = await userCollection.updateOne(query, updateDoc);
        res.send(makeAdmin);
      } else res.status(403).send({ message: "forbidden" });
    });

    // get admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";

      res.send({ admin: isAdmin });
    });
    /* ----------------------------------------
                  parts api's
    --------------------------------------------- */

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
                      order api's  
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

    // get order byt id
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const getOrder = await orderCollection.findOne(query);
      res.send(getOrder);
    });

    // delete the order by id
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await orderCollection.deleteOne(query);
      res.send(deleteOrder);
    });

    /* ---------------------------------------------------
                  Payment api's 
    ---------------------------------------------------- */

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const price = order.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({ clientSecret: paymentIntent.client_secret });
    });

    /* ---------------------------------------------------
                  Admin api's 
    ---------------------------------------------------- */
    // make admin
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
