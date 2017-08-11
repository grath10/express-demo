var express = require('express');
var router = express.Router();
var db = require('../tools/db');
var DATA_TABLE = 'perfstore';
var CONFIG_TABLE = 'basicconfig';
var nameTypeObj = {
  '电流': 'current',
  '温度': 'temperature',
  '电压': 'voltage'
};

/* GET perf items. */
router.get('/', function (req, res, next) {
    var startTime = req.query.startTime;
    var endTime = req.query.endTime;
    var type = req.query.type;
    var queryParams = req.query;
    // console.log("起始时间:" + startTime + "， 截止时间：" + endTime + ", 类型：" + type);
    getDataFromDB(res, startTime, endTime, type, queryParams);
});
module.exports = router;

function getDataFromDB(res, startTime, endTime, type, queryParams) {
    var dataArr = [];
    var returnObj = {};
    var name = nameTypeObj[type];
    var orderIndex = queryParams['orderColumn'];
    var dir = queryParams['dir'];
    var orderColumn = "collecttime";
    if(orderIndex == 2){
        orderColumn = name;
    }
    if(startTime && endTime && type){
        var sql = "select collecttime,'" + type + "'," + name + " from " + DATA_TABLE + " where collecttime>='"
            + startTime + "' and collectTime<='" + endTime + "' order by " + orderColumn + " " + dir;
        var thresholdsql = "select lower,isPrimary1,upper,isPrimary2,delta,isPrimary3 from " + CONFIG_TABLE
            + " where type='" + type + "'";
        console.log("Threshold sql:", thresholdsql);
        db.query(thresholdsql, function (err, rows, fields) {
            if (err) {
                console.log('[Query ERROR]-', err.message);
                return;
            }
            // console.log("查询结果:", rows);
            var thresArr = processResult(rows, fields);
            // console.log("门限值:", thresArr);
            // console.log("sql", sql);
            db.query(sql, function (err, rows, fields) {
                if (err) {
                    console.log('[Query ERROR]-', err.message);
                    return;
                }
                dataArr = processResultset(rows, fields, thresArr);
                returnObj['data'] = dataArr;
                returnObj['draw'] = queryParams['draw'];
                returnObj['total'] = dataArr.length;
                console.log("返回结果：", JSON.stringify(returnObj));
                res.send(returnObj);
            });
        });
    }else{
        res.render('historyView', {title: '历史数据查看'});
    }
}

function processResult(rows, fields) {
    var obj = rows[0];
    var rowArr = [];
    var nums = fields.length;
    for (var j = 0; j < nums; j++) {
        if(j%2 == 0) {
            rowArr.push(obj[fields[j]['name']]);
        }
    }
    return rowArr;
}

function getDesc(val, thresArr) {
    var desc = "";
    if(Number(val) < Number(thresArr[0])){
        desc = "(低于下限)";
    }else if(Number(val) > Number(thresArr[1])){
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
            if(j != nums - 1){
                rowArr.push(val);
            }else{
                // console.log("value: " + val + ", 门限值:" + thresArr);
                var escapeStr = getDesc(val, thresArr);
                rowArr.push(escapeStr);
            }
        }
        dataArr.push(rowArr);
    }
    return dataArr;
}