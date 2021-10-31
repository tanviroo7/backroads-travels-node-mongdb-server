const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c3yth.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected");

    const database = client.db("backroads");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    // GET API (All collection of services)
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // POST API Add Orders (Place Order)
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const Result = await orderCollection.insertOne(order);
      res.json(Result);
    });

    // GET API (my orders)
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: `${email}` };
      const result = await orderCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    });

    // DELETE API
    app.delete("/deleteOrder/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      console.log("deleting user with id ", result);

      res.json(result);
    });

    // Manage all the orders get API

    app.get("/manageAllOrders", async (req, res) => {
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();

      res.send(result);
    });

    // Manage All orders => Order delete API

    app.delete("/deleteOrder/:serviceId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.serviceId),
      };

      const result = await orderCollection.deleteOne(query);

      res.json(result);
    });

    // Manage All Orders => Order Status pending to approved put API (Update)

    app.put("/updateStatus/:statusId", async (req, res) => {
      const query = {
        _id: ObjectId(req.params.statusId),
      };
      const filter = query;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `Approved`,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    //  POST API (Add A Service)
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      console.log("got new service", req.body);
      console.log("Added service", result);
      res.json(result);
    });

    // GET API (single service information)
    app.get("/services/:serviceId", async (req, res) => {
      const id = req.params.serviceId;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      console.log(id);
      res.json(service);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
