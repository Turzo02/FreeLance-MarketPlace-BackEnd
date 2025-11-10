const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World! Server is running!");
});

const uri = `mongodb+srv://${process.env.FM_USER}:${process.env.FM_PASS}@smartproduct.gqn7fwo.mongodb.net/?appName=SmartProducT`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const jobsCollection = client.db("FreeLanceMarketPlace").collection("Jobs");
    const usersCollection = client
      .db("FreeLanceMarketPlace")
      .collection("Users");

    //Jobs Apis

    //all jobs api
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });
    
    // single job api
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;

      //jahmela korar laglo 😓
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    //jobs by email api🌟🌟
    app.get("/jobs/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });

    //delete a posted job by user api
    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    //update a posted job by user api
    app.patch("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;
      const query = ObjectId.isValid(id)
        ? { _id: new ObjectId(id) }
        : { _id: id };
      const result = await jobsCollection.updateOne(query, {
        $set: updatedJob,
      });
      res.send(result);
    })



    // lastest jobs api
    app.get("/latest_jobs", async (req, res) => {
      const result = await jobsCollection
        .find()
        .sort({ postedAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    //add job api
    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      newJob.postedAt = new Date().toISOString();
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    //accepted job by user api
    app.patch("/jobs/:id", async (req, res) => {
      const jobId = req.params.id;
      const { acceptedUserMail } = req.body;

      const query = ObjectId.isValid(jobId)
        ? { _id: new ObjectId(jobId) }
        : { _id: jobId };
      const result = await jobsCollection.updateOne(query, {
        $addToSet: { acceptedUserMail: acceptedUserMail },
      });
    });

    // jobs that are accepted by a specific user api
    app.get("/myacceptedtasks/:email", async (req, res) => {
      const userEmail = req.params.email;
      const result = await jobsCollection
        .find({ acceptedUserMail: userEmail })
        .toArray();

      res.send(result);
    });
    //remove accepted user email from useraccepted api
    app.patch("/jobs/:id/cancel", async (req, res) => {
      const jobId = req.params.id;
      const { userEmail } = req.body; 
      const query = ObjectId.isValid(jobId)
        ? { _id: new ObjectId(jobId) }
        : { _id: jobId };

      const result = await jobsCollection.updateOne(query, {
        $pull: { acceptedUserMail: userEmail },
      });
    });


    //User Apis
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
