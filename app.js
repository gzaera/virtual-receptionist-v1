var express =           require('express')
    , http =            require('http')
    , path =            require('path')
    , morgan =          require('morgan')
    , bodyParser =      require('body-parser')
    , methodOverride =  require('method-override');

var app = module.exports = express();

app.set('views', __dirname + '/client/views');
//app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'client')));

/*
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'client', 'views','index.html'));
});

*/


//require('./server/index.js')(app);

require('./server/routes.js')(app);

//module.exports = app;
/*
app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
*/

