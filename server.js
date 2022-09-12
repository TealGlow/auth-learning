require('dotenv').config()
const express = require("express")
const bcrypt = require("bcrypt")
const axios = require("axios")
const jwt = require("jsonwebtoken")
const db = require('./db_tools')

const app = express()
app.use(express.json())


const posts = [
  {
    name: 'alyssa',
    title: "Post 1"
  },
  {
    username: 'Hi :)',
    title: "Post 2"
  }
]


// get all posts of a user
app.get('/posts', authenticateToken, (req, res)=>{
  res.json(posts.filter(posts=> posts.username === req.user.name))
})



// create a new user
app.post('/users', async (req, res)=>{
  // name, password
  try{
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    // put the user in to the db here
    const user = {
      name: req.body.name,
      password: hashedPassword
    }
    const result = await db.createNewUser(user)
    res.status(result).send()
  }catch{
    res.status(500).send()
  }
})



// login
app.post('/login', async (req, res)=>{
  // authenticate user
  // find if user exists
  //const user = users.find(user=> user.name === req.body.name)
  const user = await db.getUser(req.body)
  if(user == null){
    return res.status(400).send('Cannot find user')
  }

  try{
    if(await bcrypt.compare(req.body.password, user.password)){
      // user can log
      // we actually wanna post to the auth_server now
      const result = await axios.post(process.env.AUTH_SERVER_URL+"/login",{
        name: req.body.name,
        password: req.body.password,
        token: jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})
      })

      console.log("RESULT", result.data) // add tokens to cookies
      res.send("success") // now go to auth
    }else{
      // wrong password
      res.send("not allowed")
    }
  }catch{
    res.status(500).send()
  }
})



function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization']
  // if we have an authHeader, then return the token split on the space
  const token = authHeader && authHeader.split(' ')[1]

  if(token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
    if(err) return res.sendStatus(403) // forbidden

    req.user = users
    next()
  })
}


app.listen(3000)
