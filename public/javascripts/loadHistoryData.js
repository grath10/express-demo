$(function () {
    $("#dateTimeRange span").html(moment().subtract(1, 'hours').format('YYYY-MM-DD HH:mm') + '~' + moment().format('YYYY-MM-DD HH:mm'));
    $("#dateTimeRange").daterangepicker({
        maxDate: moment(), //最大时间
        dateLimit: {
            days: 30
        }, //起止时间的最大间隔
        showDropdowns: true,
        showWeekNumbers: false, //是否显示第几周
        timePicker: true, //是否显示小时和分钟
        timePickerIncrement: 60, //时间的增量，单位为分钟
        timePicker12Hour: false, //是否使用12小时制来显示时间
        ranges: {
            // '最近1小时': [moment().subtract(1, 'hours'), moment()],
            // '今日': [moment().startOf('day'), moment()],
            // '昨日': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
            // '最近7日': [moment().subtract(6, 'days'), moment()],
            // '最近30日': [moment().subtract(29, 'days'), moment()]
        },
        opens: 'right', //日期选择框的弹出位置
        buttonClasses: ['btn btn-default'],
        applyClass: 'btn-small btn-primary blue',
        cancelClass: 'btn-small',
        locale: {
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '起始时间',
            toLabel: '结束时间',
            customRangeLabel: '自定义',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                '七月', '八月', '九月', '十月', '十一月', '十二月'],
            firstDay: 1
        }
    }, function (start, end, label) {
        // 格式化日期显示框
        $("#dateTimeRange span").html(start.subtract(1, 'hours').format('YYYY-MM-DD HH:mm') + '~' + end.format('YYYY-MM-DD HH:mm'));
    });
    loadTable();
});

function loadHistory(data, callback, settings) {
    var time = $("#searchDateRange").html();
    var timeArr = time.split("~");
    var orderCfg = data['order'][0];
    $.ajax({
        url: '/history',
        data: {
            // type: $("#type").val(),
            type: '电流',
            startTime: timeArr[0],
            endTime: timeArr[1],
            draw: data['draw'],
            dir: orderCfg['dir'],
            orderColumn: orderCfg['column']
        },
        type: 'get',
        success: function (response) {
            var returnData = {};
            returnData.draw = response.draw;
            returnData.recordsTotal = response.total;
            returnData.recordsFiltered = response.total;
            returnData.data = response.data;
            callback(returnData);
        },
        error: function () {
            console.log('查询失败');
        }
    });
}

function loadTable() {
    var $table = $("#table-history");
    var table = $table.DataTable({
        "lengthChange": false,
        destroy: true,
        autoWidth: false,   //禁用自动调整列宽
        processing: false,  //隐藏加载提示,自行处理
        serverSide: true,   //启用服务器端分页
        "searching": false,
        ajax: function (data, callback, settings) {
            return loadHistory(data, callback, settings);
        },
        columns: [{
            "title": "采集时间"
        }, {
            "title": "性能量"
        }, {
            "title": "数值"
        }],
        columnDefs: [
            {"orderable": false, "targets": 1}
        ],
        language: {
            "sProcessing": "处理中...",
            "sLengthMenu": "每页 _MENU_ 项",
            "sZeroRecords": "没有匹配结果",
            "sInfo": "当前显示第 _START_ 至 _END_ 项，共 _TOTAL_ 项",
            "sInfoEmpty": "当前显示第 0 至 0 项，共 0 项",
            "sInfoFiltered": "(由 _MAX_ 项结果过滤)",
            "sInfoPostFix": "",
            "sSearch": "搜索:",
            "sUrl": "",
            "sEmptyTable": "表中数据为空",
            "sLoadingRecords": "载入中...",
            "sInfoThousands": ",",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "上页",
                "sNext": "下页",
                "sLast": "末页",
                "sJump": "跳转"
            },
            "oAria": {
                "sSortAscending": ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
        }
    });
    $('input', '#table-history_filter').on('keyup', function () {
        table.search(this.value).draw();
    });
}