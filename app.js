var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var basicConfig = require('./routes/basic-config');
// var history = require('./routes/history');
var database = require('./tools/db');
var history = require('./routes/historyView');
var deviceInfo = require('./routes/deviceConfig');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use("/lib",express.static(path.join(__dirname, 'node_modules')));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/basicConfig', basicConfig);
app.use('/history', history);

app.use('/device', deviceInfo);

var perfObj = {
    type: '',
    lower: '',
    isPrimary1: '',
    upper: '',
    isPrimary2: '',
    delta: '',
    isPrimary3: ''
};
app.post('/newConfig', function (req, res) {
    var bodyObj = req.body;
    var paramArr = [];
    var valueArr = [];
    for(var key in perfObj){
        if(bodyObj[key]){
            paramArr.push(key);
            valueArr.push(bodyObj[key] == 'on' ? ("'" + "Y" + "'") : "'" + bodyObj[key] + "'");
        }
    }
    var QUERY_SQL = "select count(1) count from basicconfig where type=" + valueArr[0];
    console.log("查询语句:", QUERY_SQL);
    database.query(QUERY_SQL, function (err, results, fields) {
        if(err){
            return;
        }
        console.log("查询结果:", JSON.stringify(results[0]));
        var counts = results[0]['count'];
        if(counts > 0){
            res.send("类型名称已存在");
            return;
        }
        var INSERT_SQL = "insert into basicconfig (" + paramArr.join(",") + ") " + " values (" + valueArr.join(",") + ")";
        console.log("sql:", INSERT_SQL);
        database.query(INSERT_SQL, function (err, results, fields) {
            if(err){
                res.send('error');
                return;
            }
            // console.log('----------INSERT-------------');
            console.log('UPDATE affectedRows', results.affectedRows);
            // console.log('******************************');
            res.send('success');
        });
    });
});
app.post('/saveConfig', function (req, res) {
    var values = req.body["values[]"];
    var params = req.body["params[]"];
    var id = req.body.id;
    // console.log("=====" + JSON.stringify(req.body));
    console.log("values:" + values + " isArray:" + (values instanceof Array));
    var str = "";
    var isArr = values instanceof Array;
    if(isArr){
        for(var k=0;k<params.length;k++){
            if(k == 0) {
                str += params[k] + "='" + values[k] + "'";
            }else{
                str += " , " + params[k] + "='" + values[k] + "'";
            }
        }
    }else{
        str += params + "='" + values + "'";
    }
    var UPDATE_SQL = "update basicconfig set " + str + " where id=" + id;
    console.log("sql:", UPDATE_SQL);
    database.query(UPDATE_SQL, function (err, results, fields) {
        if(err){
            res.send('error');
            return;
        }
        // console.log('----------UPDATE-------------');
        // console.log('UPDATE affectedRows', results.affectedRows);
        // console.log('******************************');
        res.send('success');
    });
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;