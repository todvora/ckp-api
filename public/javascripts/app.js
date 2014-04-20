var InsuranceItemModel = Backbone.Model.extend({
    end: null,
    start: null,
    value: null
});

var InsuranceCollectionModel = Backbone.Collection.extend({
    setRegistrationNumber: function (regno) {
        this.regno = regno;
        return this;
    },

    url: function () {
        var currentDate = new Date();
        var formatedDate = currentDate.getDate() + "." + (currentDate.getMonth() + 1) + "." + currentDate.getFullYear();
        return "/api?&regno=" + this.regno + "&date=" + formatedDate;
    }
});

_.extend(InsuranceCollectionModel, Backbone.Events);

function dateToString(date) {
    if(date != null) {
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }
    return "neuvedeno";
}

function checkNotInsured(items) {
    var intervals = "";
    _.each(items, function (item) {
        if(item.get("value") === null) {
            var from = new Date(item.get("start"));
            var till = new Date(item.get("end"));
            intervals = intervals + "<li>" + dateToString(from) + " - " + dateToString(till) + "</li>";
        }
    });
    $("#notinsured").show();
    $("#notInsuredDates").html(intervals);
}

function checkInsured(items) {
    var intervals = "";
    _.each(items, function (item) {
        var value = item.get("value");
        if(value != null) {
            intervals = intervals + "<li>" + value.period + " "+ value.company.name + "</li>";
        }
    });
    $("#insured").show();
    $("#insuredDates").html(intervals);
}

function renderItems(chart, items) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Pojištění' });
    dataTable.addColumn({ type: 'string', id: 'interval' });
    dataTable.addColumn({ type: 'date', id: 'Začátek' });
    dataTable.addColumn({ type: 'date', id: 'Konec' });

    var rows = [];
    _.each(items, function (item) {
        if (item.get("value") != null) {
            item = item.get("value");
            var startDate = new Date(item.date_from);
            var endDate = new Date();
            if (item.date_till != null) {
                endDate = new Date(item.date_till);
            }
            $("#type").html(item.manufacturer + " - " + item.spz + ", " + item.type);
            rows.push([item.company.name, item.period, startDate, endDate]);
        } else {
            var from = new Date(item.get("start"));
            var till = new Date(item.get("end"));
            rows.push(["NEPOJIŠTĚNO!",dateToString(from) + "-" + dateToString(till) , from,till]);
        }
    });

    dataTable.addRows(rows);
    chart.draw(dataTable);
}

CollectionView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var self = this;
        var container = document.getElementById('chart');
        var chart = new google.visualization.Timeline(container);
        renderItems(chart, this.models);
        checkNotInsured(this.models);
        checkInsured(this.models);
        return this;
    }
});

var collection = new InsuranceCollectionModel();
new CollectionView({model: collection});

$('#submit').click(function () {

    var button = $(this);
    button.button('loading');

    var regno = $("#regno").val();
    collection.setRegistrationNumber(regno);
    collection.fetch({
        success: function (model, response, options) {
            button.button('reset');
        },
        reset: true
    });
});