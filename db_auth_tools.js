require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')

const db_url = process.env.USER_DB_URL
mongoose.connect(db_url)

var db = mongoose.connection

db.on('error', console.error.bind(console, "connection error:"))

const RefreshSchema = new mongoose.Schema({
    token: {type: String},
    createdAt: {type: Date, expires:'720m', index: true, default: Date.now},
})

var refresh_token = mongoose.model('RefreshToken', RefreshSchema, 'refresh_token_cache')



exports.addRefreshToken = async function(token){
  const result = new refresh_token({token:token})
  result.save((err, res)=>{
    if(err) console.log(err)
    console.log("Refresh token added!")
  })
  return
}



exports.getRefreshToken = async function(token){
  return await refresh_token.findOne({token:token})
}



exports.deleteRefreshToken = async function(token){
  const result = await refresh_token.deleteMany({token:token})
  if(result.deletedCount>0) return 204
  return 404
}



exports.getRefreshTokens = async function(){
  const result = await refresh_token.find().toArray()
  return result
}
