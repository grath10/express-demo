$(function () {
    $("#dateTimeRange span").html(moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm') + '~' + moment().format('YYYY-MM-DD HH:mm'));
    $("#dateTimeRange").daterangepicker({
        maxDate : moment(), //最大时间
        dateLimit : {
            days : 30
        }, //起止时间的最大间隔
        showDropdowns : true,
        showWeekNumbers : false, //是否显示第几周
        timePicker : true, //是否显示小时和分钟
        timePickerIncrement : 60, //时间的增量，单位为分钟
        timePicker12Hour : false, //是否使用12小时制来显示时间
        ranges : {
            '最近1小时': [moment().subtract(1, 'hours'), moment()],
            '今日': [moment().startOf('day'), moment()],
            '昨日': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            '最近7日': [moment().subtract(6, 'days'), moment()],
            '最近30日': [moment().subtract(29, 'days'), moment()]
        },
        opens : 'right', //日期选择框的弹出位置
        buttonClasses : ['btn btn-default'],
        applyClass : 'btn-small btn-primary blue',
        cancelClass : 'btn-small',
        locale : {
            applyLabel : '确定',
            cancelLabel : '取消',
            fromLabel : '起始时间',
            toLabel : '结束时间',
            customRangeLabel : '自定义',
            daysOfWeek : [ '日', '一', '二', '三', '四', '五', '六' ],
            monthNames : [ '一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月' ],
            firstDay : 1
        }
    }, function(start, end, label) {
        // 格式化日期显示框
        $("#dateTimeRange span").html(start.subtract(1, 'hours').format('YYYY-MM-DD HH:mm') + '~' + end.format('YYYY-MM-DD HH:mm'));
    });
    loadHistory();
});

function loadHistory() {
    var time = $("#searchDateRange").html();
    var timeArr = time.split("~");
    $.ajax({
        url: '/history',
        data: {
            // type: $("#type").val(),
            type: '电流',
            startTime: timeArr[0],
            endTime: timeArr[1]
        },
        type: 'get',
        success: function (response) {
            var tbody = $("tbody");
            var lines = response.length;
            var str = "";
            for(var j=0;j<lines;j++) {
                str += "<tr>";
                for (var k = 0; k < response[j].length; k++) {
                    str += "<td class=\"text-center\">" + response[j][k] + "</td>";
                }
                str += "</tr>";
            }
            tbody.html(str);
        },
        error: function () {
        }
    });
}