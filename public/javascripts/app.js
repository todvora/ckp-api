var insurance = Backbone.Model.extend({
    end: null,
    start: null,
    value: null
});

var insuranceCollection = Backbone.Collection.extend({
    model: insurance,
    url: function () {
        var currentDate = new Date();
        var formatedDate = currentDate.getDate() + "." + (currentDate.getMonth() + 1) + "." + currentDate.getFullYear();
        return "/api?&regno=" + this.regno + "&date=" + formatedDate;
    }
});
_.extend(insuranceCollection, Backbone.Events);

collection = new insuranceCollection();

CollectionView = Backbone.View.extend({

    el: $('#chart'),

    initialize: function () {
        console.log("init");
        this.model.on('reset', this.render);
    },

    render: function (event) {
        console.log(this);
        var self = this;

        var container = document.getElementById('chart');
        var chart = new google.visualization.Timeline(container);
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn({ type: 'string', id: 'Pojištění' });
        dataTable.addColumn({ type: 'date', id: 'Začátek' });
        dataTable.addColumn({ type: 'date', id: 'Konec' });

        var rows = [];

        _.each(this.models, function (item) {
            if (item.get("value") != null) {
                item = item.get("value");
                var startDate = new Date(item.date_from);
                var endDate = new Date();
                if (item.date_till != null) {
                    endDate = new Date(item.date_till);
                }

                $("#type").html(item.manufacturer + " - " + item.spz + ", " + item.type);

                var entry = [item.company.name, startDate, endDate];
                rows.push(entry);
            } else {
                var entry = ["NEPOJIŠTĚNO!", new Date(item.get("start")), new Date(item.get("end"))];
                rows.push(entry);
                $("#notinsured").show();
            }
        });

        dataTable.addRows(rows);

        chart.draw(dataTable);

        return this;
    }

});

new CollectionView({model: collection});

//wherever you need to do the ajax
$('#submit').click(function () {
    var button = $(this);
    button.button('loading');
    var regno = $("#regno").val();
    collection.regno = regno;
    collection.fetch({
        success: function (model, response, options) {
            button.button('reset');
        },
        reset: true
    });
});