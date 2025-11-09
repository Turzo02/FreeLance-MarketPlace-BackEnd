const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World! Server is running!')
})


//FreeLanceMarketPlace
//lDEfPkqLCKUvJSDO

const uri = "mongodb+srv://FreeLanceMarketPlace:lDEfPkqLCKUvJSDO@smartproduct.gqn7fwo.mongodb.net/?appName=SmartProducT";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const jobsCollection = client.db('FreeLanceMarketPlace').collection('Jobs');
   

    app.get('/jobs', async(req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    })





    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  
  finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
