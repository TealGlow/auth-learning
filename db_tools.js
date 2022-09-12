require('dotenv').config()
const { MongoClient } = require('mongodb')

const db_url = process.env.USER_DB_URL
const Client = new MongoClient(db_url);
const myDb = Client.db("user_accounts").collection("users")



exports.createNewUser = async function(user){
  // check if username already exists, if so dont let them enter
  await Client.connect()
  const userCheck = await myDb.findOne({name:user.name})
  if(userCheck) return 409

  const result = await myDb.insertOne(user)

  await Client.close()
  if(result.insertedCount) return 500
  return 200
}



exports.getUser = async function(user){
  await Client.connect()

  const result = await myDb.findOne({name:user.name})

  await Client.close()
  if(result) return result
  return null
}
