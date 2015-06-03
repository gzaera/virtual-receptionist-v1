var express = require('express')
    , path =      require('path');
//var router = express.Router();
/*

router.get('/', function(req, res, next) {

	res.sendFile(path.resolve(__dirname+'/../client/views/index.html'));
});

//module.exports = router;
*/
module.exports = function(app){

app.get('/', function(req, res){
	/* GET home page. */
  res.sendFile(path.resolve(__dirname+'/../client/views/index.html'));
});

}