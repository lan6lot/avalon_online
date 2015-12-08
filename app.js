var express = require('express');
var path = require('path');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/room', function(req, res){
	res.render('room');
});

app.listen(3000);