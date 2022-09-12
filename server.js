require('dotenv').config()
const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

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

const users = [

]

// get all posts of a user
app.get('/posts', authenticateToken, (req, res)=>{
  res.json(posts.filter(posts=> posts.username === req.user.name))
})

// get all users for testing
app.get('/users', (req, res)=>{
  res.json(users)
})

// create a new user
app.post('/users', async (req, res)=>{
  // name, password
  try{
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    console.log(salt)
    console.log(hashedPassword)

    // put the user in to the db here
    const user = {
      name: req.body.name,
      password: hashedPassword
    }
    users.push(user)
    res.status(201).send()
  }catch{
    console.log("Catch")
    res.status(500).send()
  }
})


// login
app.post('/login', async (req, res)=>{
  // authenticate user
  // find if user exists
  const user = users.find(user=> user.name === req.body.name)
  if(user == null){
    return res.status(400).send('Cannot find user')
  }

  try{
    if(await bcrypt.compare(req.body.password, user.password)){
      // user can log
      // we actually wanna post to the auth_server now
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
