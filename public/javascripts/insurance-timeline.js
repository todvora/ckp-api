function InsuranceTimeline(el, models) {

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

    function shortText(text, length) {
        if(text.length > length) {
            return text.substring(0, 17) + "..."
        } else {
            return text;
        }
    }

    var dataTable = createDatatable();

    var rows = [];
    _.each(models, function (item) {
        var from = new Date(item.get("start"));
        var till = new Date(item.get("end"));
        if (item.get("value") != null) {
            var value = item.get("value");
            var groupLabel = "<span title='"+value.company.name+"'>"+shortText(value.company.name, 20)+"</span>";
            rows.push([from, till, buildLabel(item, value.period), "green", groupLabel]);
        } else {
            rows.push([from, till, buildLabel(item, dateToString(from) + " - " + dateToString(till)), "red", "Nepojištěno"]);
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

