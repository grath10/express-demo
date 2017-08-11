var express = require('express');
var router = express.Router();
var db = require('../tools/db');
var CONFIG_TABLE = 'basicconfig';

/* GET basic config items. */
router.get('/', function(req, res, next) {
    getDataFromDB(res);
});
module.exports = router;

function getDataFromDB(res){
    var sql = 'select id,type,lower,isPrimary1,upper,isPrimary2,delta,isPrimary3 from ' + CONFIG_TABLE;
    db.query(sql, function(err, rows, fields){
        if(err){
            console.log('[Query ERROR]-', err.message);
            return;
        }
        var dataArr = processResultset(rows, fields);
        // console.log('====', dataArr);
        res.render('basic-config', { title: '基础配置', perfs: dataArr });
    });
}

function processResultset(rows, fields){
    var dataArr = [];
    for(var i = 0;i < rows.length; i++){
        var obj = rows[i];
        var rowArr = [];
        for(var j = 0; j < fields.length; j++){
            rowArr.push(obj[fields[j]['name']]);
        }
        dataArr.push(rowArr);
    }
    return dataArr;
}