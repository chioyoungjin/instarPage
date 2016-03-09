
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')   
  , fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');                    
var ejs = require('ejs');     
var gm = require('gm').subClass({imageMagick: true});    
var multipartMiddleware = multipart(); 
var client = mysql.createConnection({           
    user : 'root',            
    password: '1234',                                       
    database: 'imagelist'        
});          
                 
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(multipart({       
	uploadDir: __dirname + '/images'
}));    
app.use(express.logger('dev'));
app.use(express.bodyParser());                
app.use(express.limit('10mb'));   
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images'))); 

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}             

//app.get('/', routes.index);
//app.get('/users', user.list);

app.get('/', function(req, res) {      
	
	fs.readFile('memberForm.html', 'utf8', function(error, data) {
		res.writeHead(200, {'Contnent-Type': 'text/html'});
		res.end(data);
	});         
}); 
  
app.get('/viewPage', function(req, res) {      
	
	fs.readFile('viewPage.html', 'utf8', function(error, data) {
		res.writeHead(200, {'Contnent-Type': 'text/html'});
		res.end(data);
	});   
}); 

app.post('/upload',multipartMiddleware, function(req, res) {
	  var body = req.body;  
	  var imageFile = req.files.img;
	  var image = imageFile.originalFilename;                 
	  var name =   imageFile.name;
	  var path  = imageFile.path;            
	  var type = imageFile.type; 
	  var size = imageFile.size; 
	  size = 1024*1000*100;    
	  var outputPath="";     
    if(imageFile) {                                                          
    
       if(type.indexOf('image') != -1){        
    	             
    	   var currentDate = Date.now();    
    	   outputPath = './images/' + currentDate + '_' +  name;  
    	   fs.rename(path, outputPath, function (error) {     
    		          
    		   outputPath = './' + currentDate + '_' + name;// db에 저장하고 실제로  화면에서 보여주기 위해 필요한 주소           
     		   client.query('insert into imageView (imgOriginalName, imgNewName, imgSize, imgType) values (?, ?, ?, ?)', [name, outputPath, size, type], function () {
                  res.redirect('/viewPage');                                  
    	   });      
     		                                         
   		});                             
                                     	     	                                                                       
       } else {                                                             
     	                         
                                          
    	   fs.unlink(path, function(error) {                 
    		  res.send(404);      
    		  
    	   });                                       
       }                           
                                                                                                    
   } else {                                                                                                                               
                                                                             
       res.redirect(404);
   }         
});

app.get('/list', function(req, res) {                                              
     
	var num = "";
	num = Number(10);
	
	client.query('select imgNewName from imageView limit ' + num , function(error, data) {
		console.log(data);        
		res.send(data);                             
		                
	});                
             
});   

app.get('/imageAddList',function(req, res){
	var num = "";
	var newNum = '';            
	num = Number(10);        
	newNum += Number(10);        
	client.query('select imgNewName from imageView limit ' + num + ', ' + newNum, function(error, data) {
		console.log(data);        
		res.send(data);                             
		                
	});  
	num += newNum;   
});                      
        
                    
var server = http.createServer(app).listen(app.get('port'), '0.0.0.0', function(){
  console.log('Express server listening on port ' + app.get('port'));
});
        