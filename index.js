
const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000


app.use(express.json())
app.use(cors())





const uri = `mongodb+srv://${process.env.FACEBOOKUSER}:${process.env.PASS}@cluster0.ysrfscy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("facebook").collection("users");


    // add all user to the mongodb
    app.post('/users', async(req, res) => {
    const body = req.body;
    const result = await usersCollection.insertOne(body);
    res.send(result);
    })

    // get all users from the mongodb
    app.get('/users', async(req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello facebook!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})