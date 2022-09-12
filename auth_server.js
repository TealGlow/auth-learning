require('dotenv').config()
const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const adb = require('./db_auth_tools')

const app = express()
app.use(express.json())

// in prod use db or cache
let refreshTokens = []

// login
app.post('/login', async (req, res)=>{
  // authenticate user
    const access_token = generateAccessToken({name: req.body.name})
    const refresh_token = jwt.sign({name: req.body.name}, process.env.REFRESH_TOKEN_SECRET)
    await adb.addRefreshToken(refresh_token)
    res.json({accessToken: access_token, refreshToken: refresh_token})
})



app.post('/token', async (req, res)=>{
  const refreshToken = req.body.token
  if(refreshToken == null) return res.sendStatus(401)

  // if refresh token doesnt exist in the db, forbidden
  if(!await adb.getRefreshToken(refreshToken)) return res.sendStatus(403)

  // verify refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
    if(err) return res.sendStatus(403)
    // get a new access token
    const access_token = generateAccessToken({name: user.name})
    res.json({accessToken: access_token})
  })
})



app.delete('/logout', async (req, res)=>{
  // delete the one token
  const result = await adb.deleteRefreshToken(req.body.token)
  res.sendStatus(result)
})



function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'})
}

app.listen(3001)
