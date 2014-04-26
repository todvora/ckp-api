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

_.extend(InsuranceCollectionModel, Backbone.Events);

function dateToString(date) {
    if(date != null) {
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }
    return "neuvedeno";
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

function renderInsurancePopup(item) {
    var data = JSON.parse(item.attr("data-json"));
    if (data.value != null) {
        $("#insurance_tip").remove();
        $("body").append(_.template($("#modal_template").html(), {data: data}));
        $('#insurance_tip').modal({});
    } else {
        $("#insurance_tip_notinsured").remove();
        $("body").append(_.template($("#modal_template_notinsured").html(), {data: data}));
        $('#insurance_tip_notinsured').modal({});
    }
}

NotInsuredListView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var intervals = "";
        var orderedItems = this.models.slice().reverse();
        var result = [];
        _.each(orderedItems, function (item) {
            var value = item.get("value");
            if(value != null) {
                result.push(wrapLabelWithDataspan(item, value.period.replace("neuvedeno", "dosud") + ": "+ value.company.name));
            }
        });

        $("#content").append(_.template($("#panel_template_insured").html(),{'intervals':result}));
        $("#insured ul li div").click(function(event) {
            event.preventDefault();
            renderInsurancePopup($(this));
            return false;
        });
    }
});

InsuredListView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var orderedItems = this.models.slice().reverse();
        var result = [];
        _.each(orderedItems, function (item) {
            if(item.get("value") === null) {
                var from = new Date(item.get("start"));
                var till = new Date(item.get("end"));
                result.push(dateToString(from) + " - " + dateToString(till));
            }
        });
        $("#content").append(_.template($("#panel_template_notinsured").html(),{'intervals':result}));
    }
});

CompaniesView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var values = getInsuranceCompanies(this.models);
        $("#content").append(_.template($("#panel_template_companies").html(),{'companies':values, 'regno':this.registratio}));
        return this;
    }
});

CarInfoView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var value = _.find(this.models, function(elem){ return elem.get("value") != null });
        value = value.get("value");
        $("#content").append(_.template($("#panel_typeinfo").html(),{'vehicle':value}));
        return this;
    }
});

TimelineView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var self = this;
        $("#content").append(_.template($("#panel_timeline").html(),{}));
        var container = document.getElementById('chart');
        new InsuranceTimeline(container, this.models, renderInsurancePopup);
        return this;
    }
});

var collection = new InsuranceCollectionModel();

new CarInfoView({model:collection});
new TimelineView({model: collection});
new InsuredListView({model:collection});
new NotInsuredListView({model:collection});
new CompaniesView({model:collection});

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
    var inputField = $("#regno");
    var regno = inputField.val();
    regno = regno.toUpperCase().trim();
    inputField.val(regno);

    var button = $("#submit");
    button.button('loading');

    $("#content").html("");

    collection.setRegistrationNumber(regno);
    collection.fetch({
        success: function (model, response, options) {
            button.button('reset');
        },
        reset: true
    });
}