function InsuranceTimeline(el, models) {

    function parseCkpDate(dateStr) {
        // date format is "YYYY-M-D"
        var parts = dateStr.split("-");
        var date = new Date(parts[0], (parts[1] - 1), parts[2]);
        return  date;
    }

    function createDatatable() {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn({ type: 'datetime', id: 'start' });
        dataTable.addColumn({ type: 'datetime', id: 'end' });
        dataTable.addColumn({ type: 'string', id: 'content' });
        dataTable.addColumn({ type: 'string', id: 'className' });
        dataTable.addColumn({ type: 'string', id: 'group' });
        return dataTable;
    }

    function getTimelineOptions() {
        return {
            "editable": false,
            "stackEvents": false,
            "min": new Date(2009, 0, 1),
            "max": new Date(),
            "width": "100%",
            "height": "auto",
            "zoomable": false,
            "groupsWidth": "200px",
            "style": "box"
        };
    }

    function getTimelineSelectedItem() {
        var row = undefined;
        var sel = timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    }

//    function getOnclickEvent(event) {
//        var row = getTimelineSelectedItem();
//        if (row != undefined) {
//            var item = $(dataTable.getValue(row, 2));
//            clickCallback(item);
//        }
//        return false;
//    }

    function buildLabel(item, label) {
        return "<div class='insurance-label' data-json='" + JSON.stringify(item.toJSON()) + "'>" + label + "</div>";
    }

    var dataTable = createDatatable();

    var rows = [];
    _.each(models, function (item) {
        if (item.get("value") != null) {
            var value = item.get("value");
            var startDate = parseCkpDate(value.date_from);
            var endDate = new Date();
            if (value.date_till != null) {
                endDate = parseCkpDate(value.date_till);
            }
            var groupLabel = "<span title='"+value.company.name+"'>";
            if(value.company.name.length > 20) {
                groupLabel = groupLabel + value.company.name.substring(0, 17) + "..."
            } else {
                groupLabel = groupLabel + value.company.name;
            }
            groupLabel = groupLabel + "</span>";
            rows.push([startDate, endDate, buildLabel(item, value.period), "green", groupLabel]);
        } else {
            var from = new Date(item.get("start"));
            var till = new Date(item.get("end"));
            rows.push([from, till, buildLabel(item, dateToString(from) + "-" + dateToString(till)), "red", "Nepojištěno"]);
        }
    });

    dataTable.addRows(rows);

    // Instantiate our timeline object.
    var timeline = new links.Timeline(el);

//    google.visualization.events.addListener(timeline, 'select', getOnclickEvent);

    // Draw our timeline with the created data and options
    timeline.draw(dataTable,  getTimelineOptions());

    $(".insurance-label").parent().parent().hover(function (event) {
        var data = JSON.parse($(this).find(".insurance-label").attr("data-json"));
        var el = $("<div id='timeline-tooltip'>" + _.template($("#tooltip_timeline").html(),{'data':data}) + "</div>");
         $("body").append(el);
        var left = $(this).offset().left;
        var top = $(this).offset().top + $(this).height();
        var timelineRight = $(this).parent().offset().left + $(this).parent().width();
        if ((left + 300) > timelineRight) {
            left = left - (left + 300 - timelineRight) ;
        }
        $(el)
            .css("top", top)
            .css("left", left)
            .css("width", "300px");

    }, function () {
        $("#timeline-tooltip").remove();
    });

    return timeline;
}

