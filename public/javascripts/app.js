google.load("visualization", "1");

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

var InsuranceCompaniesCollectionModel = Backbone.Collection.extend({});

_.extend(InsuranceCollectionModel, Backbone.Events);

function dateToString(date) {
    if(date != null) {
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }
    return "neuvedeno";
}

function checkNotInsured(items) {
    var intervals = "";
    var orderedItems = items.slice().reverse();
    _.each(orderedItems, function (item) {
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
    var orderedItems = items.slice().reverse();
    _.each(orderedItems, function (item) {
        var value = item.get("value");
        if(value != null) {
            intervals = intervals + "<li>" + value.period.replace("neuvedeno", "dosud") + ": "+ value.company.name + "</li>";
        }
    });
    $("#insured").show();
    $("#insuredDates").html(intervals);
}

function getInsuranceCompanies(items) {
    var companies = [];
    _.each(items, function (item) {
        var value = item.get("value");
        if (value != null) {

            var contains = false;
            _.each(companies, function (added) {
                if (added.name == value.company.name) {
                    contains = true;
                }
            });
            if (!contains) {
                companies.push(value.company);
            }
        }
    });
    return companies;
}

function wrapLabelWithDataspan(item, label) {
    return "<div title='" + label + "' data-json='" + JSON.stringify(item.toJSON()) + "'>" + label + "</div>";
}

function renderItems(element, items) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'datetime', id: 'start' });
    dataTable.addColumn({ type: 'datetime', id: 'end' });
    dataTable.addColumn({ type: 'string', id: 'content' });
    dataTable.addColumn({ type: 'string', id: 'className' });
    dataTable.addColumn({ type: 'string', id: 'group' });

    var rows = [];
    _.each(items, function (item) {
        if (item.get("value") != null) {
            var value = item.get("value");
            var startDate = new Date(value.date_from);
            var endDate = new Date();
            if (value.date_till != null) {
                endDate = new Date(value.date_till);
            }
            $("#type").html(value.manufacturer + " - " + value.spz + ", " + value.type);
            rows.push([startDate, endDate, wrapLabelWithDataspan(item, value.period), "green", value.company.name.substring(0,20)]);
        } else {
            var from = new Date(item.get("start"));
            var till = new Date(item.get("end"));
            rows.push([from,till, wrapLabelWithDataspan(item, dateToString(from) + "-" + dateToString(till)), "red", "Nepojištěno"]);
        }
    });

    dataTable.addRows(rows);

    // specify options
    var options = {
        "editable": false,
        "stackEvents": false,
        "min": new Date(2009, 0, 1),                // lower limit of visible range
        "max": new Date(),
        "width":  "100%",
        "height": "auto",
        "zoomable": false,
        "groupsWidth": "200px",
        "style": "box" // optional
    };

    // Instantiate our timeline object.
    var timeline = new links.Timeline(element);

    function getSelectedRow() {
        var row = undefined;
        var sel = timeline.getSelection();
        if (sel.length) {
            if (sel[0].row != undefined) {
                row = sel[0].row;
            }
        }
        return row;
    }

    var onselect = function (event) {
        var row = getSelectedRow();
        if (row != undefined) {
            // Note: you can retrieve the contents of the selected row with
            var item = $(dataTable.getValue(row, 2));
            var data = JSON.parse(item.attr("data-json"));
            if(data.value != null) {
                $("#insurance_tip").remove();
                $( "body").append(_.template($("#modal_template").html(),{data:data}));
                $('#insurance_tip').modal({});
            } else {
                $("#insurance_tip_notinsured").remove();
                $( "body").append(_.template($("#modal_template_notinsured").html(),{data:data}));
                $('#insurance_tip_notinsured').modal({});
            }
        }
        return false;
    };

    google.visualization.events.addListener(timeline, 'select', onselect);

    // Draw our timeline with the created data and options
    timeline.draw(dataTable, options);
}


CompaniesView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var self = this;

        var result = "";
        var counter = 0;
        _.each(this.models, function (item) {
            counter++;
            if(typeof item.get("web") == "undefined") {
                item.set("web", "")
            }
            result = result + "<div class='col-md-4'>"
                + "<h4>" + item.get("name") + "</h4>"
                +"<span class='glyphicon glyphicon-phone-alt'></span>&nbsp;" + item.get("tel") + "<br>"
                +"<span class='glyphicon glyphicon-envelope'></span>&nbsp;" + "<a href='mailto:"+item.get("email")+"'>" + item.get("email") + "</a><br>"
                +"<span class='glyphicon glyphicon-home'></span>&nbsp;" + "<a href='"+item.get("web")+"'>" + item.get("web").replace("http://","") + "</a>"
            +"</div>"
            if(counter % 3 == 0) {
                result = result + "</div><div class='row'>";
            }
        });
        result = "<div class='row'>"+result+"</div>";
        $("#companies").html(result);
        $("#companies-contacts").show();
        return this;
    }
});

var companiesCollection = new InsuranceCompaniesCollectionModel();
new CompaniesView({model:companiesCollection});

CollectionView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var self = this;
        var container = document.getElementById('chart');
        renderItems(container, this.models);
        checkNotInsured(this.models);
        checkInsured(this.models);
        companiesCollection.reset(getInsuranceCompanies(this.models));
        return this;
    }
});

var collection = new InsuranceCollectionModel();
new CollectionView({model: collection});



$('#regno').keypress(function (e) {
    if (e.which == 13) {
        processForm();
        return false;
    }
});


$('#submit').click(function () {
    processForm();
});

function processForm() {
    var button = $("#submit");
    button.button('loading');

    var regno = $("#regno").val();
    collection.setRegistrationNumber(regno);
    collection.fetch({
        success: function (model, response, options) {
            button.button('reset');
        },
        reset: true
    });
}