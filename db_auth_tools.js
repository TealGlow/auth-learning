require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')

const db_url = process.env.USER_DB_URL
//const Client = new MongoClient(db_url);
mongoose.connect(db_url)
const schema = new mongoose.Schema({
    token: {type: String},
    createdAt: {type: Date, expires:'1m', index:true, default: Date.now},
})

const refresh_token = mongoose.model('refresh_token', schema, 'user_accounts')
//const myDb = mongoose.connection.model('refresh_token_cache', schema)
//const myDb = Client.db("user_accounts").collection("refresh_token_cache")

exports.addRefreshToken = async function(token){
  const result = new refresh_token({token:token})
  result.save((err, res)=>{
    if(err) console.log(err)
    console.log("done")
  })
  /*const result = await myDb.insertOne({
    token: token,
    createdAt: new Date(),
  })*/

  //await Client.close()
  return
}


exports.getRefreshToken = async function(token){
  //await Client.connect()
  const result = await myDb.findOne({token:token})

  //await Client.close()
  return result
}


exports.deleteRefreshToken = async function(token){
  await Client.connect()

  const result = await myDb.deleteMany({token:token})
  await Client.close()
  if(result.deletedCount>0) return 204
  return 404
}

exports.getRefreshTokens = async function(){
  await Client.connect()

  const result = await myDb.find().toArray()
  console.log(result)

  await Client.close()
  return result
}
