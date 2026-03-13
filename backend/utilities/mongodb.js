import mongoose from "mongoose";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
export async function connectMongoDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(process.env.MONGO_SECRET, clientOptions);
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(error) {
    console.log("mongo error")
    console.log(error)
  }
}
