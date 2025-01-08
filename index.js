const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.FACEBOOKUSER}:${process.env.PASS}@cluster0.ysrfscy.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const usersCollection = client.db("facebook").collection("users");
    const postsCollection = client.db("facebook").collection("posts");

    // add all user to the mongodb
    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    // get all users from the mongodb
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // upload on facebook data
    app.post("/posts", async (req, res) => {
      const body = req.body;
      const result = await postsCollection.insertOne(body);
      res.send(result);
    });

    // get uploaded on facebook data
    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });

    // get all myposts base on email
    app.get(`/myposts`, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await postsCollection
        .find(query)
        .sort({ uploadedtime: 1 })
        .toArray();
      res.send(result);
    });

    // --------------modified on facebook todays --------------

    // Get a specific post based on email and postId
    app.get("/myposts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await postsCollection.findOne(query);
        if (result) {
          res.status(200).send(result);
        } else {
          res.status(404).send({ message: "Post not found" });
        }
      } catch (error) {
        res.status(500).send({ message: "Server error", error });
      }
    });

    // Delete post by postId
    app.delete("/myposts/:postId", async (req, res) => {
      const { postId } = req.params;

      try {
        // Find and delete the post
        const result = await postsCollection.deleteOne(postId);

        if (!result) {
          return res.status(404).json({ message: "Post not found" });
        }

        res
          .status(200)
          .json({ message: `Post with ID ${postId} deleted successfully` });
      } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // delete post base on email
    app.delete("/myposts/single", async (req, res) => {
      const email = req.query.email;
      const postId = req.query.postId;

      if (!email || !postId) {
        return res
          .status(400)
          .send({ message: "Email and Post ID are required." });
      }

      console.log(`Deleting post with postId: ${postId} for user: ${email}`);

      try {
        // Ensure postId is converted to ObjectId if it's a Mongo ObjectId
        const query = { email: email, postId: postId }; // Assuming postId is a string here, adjust if needed

        const result = await postsCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.send({ message: "Post deleted successfully." });
        } else {
          res
            .status(404)
            .send({ message: "Post not found or unauthorized access." });
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        res
          .status(500)
          .send({ message: "An error occurred while deleting the post." });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello facebook!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
