const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//MongoDb.................
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l9qr6yy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const bookingCollection = client.db("eleven").collection("bookings");

    // bookings get by email
    app.get("/bookings", async (req, res) => {
      console.log(req.query.email);
      const sort = req.query.sort;
      let query = {};
      const options = {
        // sort matched documents in descending order by rating
        sort: {
          price: sort === "asc" ? 1 : -1,
        },
      };
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection
        .find(query, options)
        .limit(20)
        .toArray();
      res.send(result);
    });

    //post
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    //update
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedtoy = req.body;

      const toy = {
        $set: {
          price: updatedtoy.price,
          quantity: updatedtoy.quantity,
          desc: updatedtoy.desc,
        },
      };

      const result = await bookingCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    //delete
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("eleven server is running");
});

app.listen(port, () => {
  console.log(`Eleven server is running on port ${port}`);
});
