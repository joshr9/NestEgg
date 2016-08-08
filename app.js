var express = require('express')
var dotenv = require('dotenv').config()
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var token = process.env.FB_TOKEN

app.set('port', (process.env.PORT || 5000))

//process app
app.use(bodyParser.urlencoded({extended:false}))

//process app JSON
app.use(bodyParser.json())

app.get('/', function(req, res){
  res.send("Hello world, I am NestEgg")
})

app.get('/webhook/', function(req, res){
  if(req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
    res.send(req.query['hub.challenge'])
  }
  res.send("Error, wrong token")
})

app.post('/webhook/', function(req, res){
  var messaging_events = req.body.entry[0].messaging
  for(var i = 0; i < messaging_events.length; i++) {
     var event = req.body.entry[0].messaging[i]
     var sender = event.sender.id
     if (event.message && event.message.text) {
       var text = event.message.text
       sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
     }
  }
  res.sendStatus(200)
})

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'));
})
