function showEditPanel(store){
    var str;
    var arr = $(store).attr("data-store").split(",");
    str = "<div id='perf' hidden>" + arr[0] + "</div><table class='table-border'> \
                <thead><td class='text-center'>类型名称</td><td class='text-center'>" + arr[1]
        + "</td><td class='text-center'>报警依据</td> \
                </thead><tbody><tr> \
                    <td class='text-center'>下限</td><td class='text-center'>" + createInput('lower', arr[2])
        + "</td><td class='text-center'>" + createRadioBx('isPrimary1', arr[3]) + "</td></tr> \
                    <tr><td class='text-center'>上限</td><td class='text-center'>" + createInput('upper', arr[4])
        + "</td><td class='text-center'>" + createRadioBx('isPrimary2', arr[5]) + "</td></tr> \
                    <tr><td class='text-center'>报警幅度</td><td class='text-center'>" + createInput('delta', arr[6])
        + "</td><td class='text-center'>" + createRadioBx('isPrimary3', arr[7]) + "</td> \
                </tr></tbody></table>";
    $("#perfDiv").html(str);
    $("#editPanel").modal('show');
}

function createRadioBx(name, value){
    var str = '';
    if(value == 'Y'){
        str = "<input type='checkbox' name='" + name + "' data-default='true' checked />";
    }else{
        str = "<input type='checkbox' name='" + name + "' data-default='false'/>";
    }
    return str;
}

function createInput(name, value) {
    return "<input name='" + name + "' value=" + value + " data-default=" + value + " />";
}

// 确定修改条目及数值
function saveChanges() {
    var isValid = checkValid(false);
    if(!isValid){
        return;
    }
    var $obj = $("tr", "#perfDiv table>tbody");
    var valueArr = [];
    var perfArr = [];
    for(var i=0;i<$obj.length;i++){
        var line = $($obj[i]).children();
        var $perf = $("input", line[1]);
        var value = $perf.val();
        var oldVal = $perf.data("default");
        var perfName = $perf.attr("name");
        if(value != oldVal){
            valueArr.push(value);
            perfArr.push(perfName);
        }
        var $signPerf = $("input", line[2]);
        var isSign = $signPerf.prop('checked') + "";
        var oldsign = $signPerf.attr("data-default");
        var signName = $signPerf.attr("name");
        if(isSign != oldsign){
            var str = 'N';
            if(isSign == 'true'){
                str = 'Y';
            }
            valueArr.push(str);
            perfArr.push(signName);
        }
    }
    $("#editPanel").modal('hide');
    $.ajax({
        url: '/saveConfig',
        data: {
            id: $("#perf").html(),
            values: valueArr,
            params: perfArr
        },
        type: 'post',
        success: function () {
            alert('保存成功');
            reloadTable();
        },
        error: function () {
            alert('保存失败');
        }
    });
}

function reloadTable() {
    $.ajax({
        url: '/basicConfig',
        data: null,
        type: 'get',
        success: function (data) {
            $("body").empty().html(data);
        },
        error: function () {
        }
    });
}

function commitChanges(){
    var isValid  = checkValid(true);
    if(isValid){
        createNewItems();
    }
}

function checkValid(isNew) {
    if(isNew){
        var type = document.getElementsByName("type")[0].value;
        if(isEmptyValue(type)){
            alert("类型名称不能为空");
            return false;
        }
    }
    var lower = document.getElementsByName("lower")[0].value;
    if(isEmptyValue(lower)){
        alert("下限不能为空");
        return false;
    }
    var upper = document.getElementsByName("upper")[0].value;
    if(isEmptyValue(upper)){
        alert("上限不能为空");
        return false;
    }
    if(Number(lower) >= Number(upper)){
        alert("下限应小于上限");
        return false;
    }
    var delta = document.getElementsByName("delta")[0].value;
    if(isEmptyValue(delta)){
        alert("报警幅度不能为空");
        return false;
    }
    return true;
}

function isEmptyValue(value) {
    if(value == "" || value.trim() == ""){
        return true;
    }else{
        return false;
    }
}

function createNewItems() {
    var $obj = $("tr", "#perfNewDiv table");
    var jsonObj = {};
    for(var i=0;i<$obj.length;i++){
        var line = $($obj[i]).children();
        var $perf = $("input", line[1]);
        var perfName = $perf.attr("name");
        jsonObj[perfName] = $perf.val();
        if(i!= 0) {
            var $signPerf = $("input", line[2]);
            var isSign = $signPerf.prop('checked') + "";
            var signName = $signPerf.attr("name");
            var str;
            if (isSign == 'true') {
                str = 'Y';
                jsonObj[signName] = str;
            }
        }
    }
    $("#newPanel").modal('hide');
    $.ajax({
        url: '/newConfig',
        data: jsonObj,
        type: 'post',
        success: function () {
            alert('保存成功');
            reloadTable();
        },
        error: function () {
            alert('保存失败');
        }
    });
}


