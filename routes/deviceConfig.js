var express = require('express');
var router = express.Router();
var db = require('../tools/db');
var DEVICE_TABLE = 'device';
var SENSOR_TABLE = 'sensor';

/* GET device related info. */
router.get('/', function (req, res, next) {
    getDataFromDB(res);
});
module.exports = router;

function getDataFromDB(res) {
    var sql = "select id,location, comment, status from " + DEVICE_TABLE;
    db.query(sql, function (err, rows, fields) {
        if (err) {
            console.log('[Query ERROR]-', err.message);
            return;
        }
        console.log("查询结果:", rows);
        processResult(res, rows, fields);
    });
}

// 错误的返回结果
/*
function processResult(res, rows, fields) {
    var cnt = rows.length;
    var arr = [];
    for (var i = 0; i < cnt; i++) {
        var rowArr = [];
        var obj = rows[i];
        var nums = fields.length;
        var field = "";
        for (var j = 0; j < nums; j++) {
            field = fields[j]['name'];
            rowArr.push(obj[field]);
        }
        var countsql = "select count(1) count from " + SENSOR_TABLE + " where parent=?";
        db.query(countsql, rowArr[0], function (err, rows, fields) {
            if (err) {
                console.log('[Query ERROR]-', err.message);
                return;
            }
            rowArr.push(rows[0]['count']);
            console.log("最新结果:", rowArr);
            arr.push(rowArr);
        });
    }
    console.log("返回结果：", arr);
    res.render('device', {'title': '设备配置', perfs: arr});
}
*/

function getDesc(val, thresArr) {
    var desc = "";
    if (Number(val) < Number(thresArr[0])) {
        desc = "(低于下限)";
    } else if (Number(val) > Number(thresArr[1])) {
        desc = "(高于上限)";
    }
    return val + desc;
}

function processResultset(rows, fields, thresArr) {
    var dataArr = [];
    for (var i = 0; i < rows.length; i++) {
        var obj = rows[i];
        var rowArr = [];
        var nums = fields.length;
        var val = "";
        for (var j = 0; j < nums; j++) {
            val = obj[fields[j]['name']];
            if (j != nums - 1) {
                rowArr.push(val);
            } else {
                // console.log("value: " + val + ", 门限值:" + thresArr);
                var escapeStr = getDesc(val, thresArr);
                rowArr.push(escapeStr);
            }
        }
        dataArr.push(rowArr);
    }
    return dataArr;
}

function processResult(res, rows, fields) {
    var cnt = rows.length;
    var arr = [];
    var nums = fields.length;
    rows.forEach(function (row) {
        var rowArr = [];
        var field = "";
        for (var j = 0; j < nums; j++) {
            field = fields[j]['name'];
            rowArr.push(row[field]);
        }
        var countsql = "select count(1) count from " + SENSOR_TABLE + " where parent=?";
        db.query(countsql, rowArr[0], function (err, rows, fields) {
            if (err) {
                console.log('[Query ERROR]-', err.message);
                return;
            }
            rowArr.push(rows[0]['count']);
            console.log("最新结果:", rowArr);
            arr.push(rowArr);
            if(arr.length == cnt){
                console.log("返回结果：", arr);
                res.render('device', {'title': '设备配置', perfs: arr});
            }
        });
    });
}