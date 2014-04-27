function InsuranceTimeline(el, models, clickCallback) {

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

    function getOnclickEvent(event) {
        var row = getTimelineSelectedItem();
        if (row != undefined) {
            var item = $(dataTable.getValue(row, 2));
            clickCallback(item);
        }
        return false;
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

            rows.push([startDate, endDate, wrapLabelWithData(item, value.period), "green", value.company.name.substring(0, 20)]);
        } else {
            var from = new Date(item.get("start"));
            var till = new Date(item.get("end"));
            rows.push([from, till, wrapLabelWithData(item, dateToString(from) + "-" + dateToString(till)), "red", "Nepojištěno"]);
        }
    });

    dataTable.addRows(rows);

    // Instantiate our timeline object.
    var timeline = new links.Timeline(el);

    google.visualization.events.addListener(timeline, 'select', getOnclickEvent);

    // Draw our timeline with the created data and options
    timeline.draw(dataTable,  getTimelineOptions());
    return timeline;
}