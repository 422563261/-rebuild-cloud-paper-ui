var express = require('express')
var app = express()

app.use(express.static('./dist'))

app.listen(4001,function(){
  console.log('server is running at localhost:4001')
})