require('dotenv').config()
const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const app = express()
app.use(express.json())

// in prod use db or cache
let refreshTokens = []

// login
app.post('/login', async (req, res)=>{
  // authenticate user
    // auth tokens
    const access_token = generateAccessToken({name: req.body.name})
    const refresh_token = jwt.sign({name: req.body.name}, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refresh_token)
    res.json({accessToken: access_token, refreshToken: refresh_token})

})



app.post('/token', (req, res)=>{
  const refreshToken = req.body.token
  if(refreshToken == null) return res.sendStatus(401)
  if(!refreshTokens.includes(refreshToken))return res.sendStatus(403)

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
    if(err) return res.sendStatus(403)
    const access_token = generateAccessToken({name: user.name})
    res.json({accessToken: access_token})
  })
})



app.delete('/logout', (req, res)=>{
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})



function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15s'})
}

app.listen(3001)
