google.load("visualization", "1");

// -- utils

function parseCkpDate(dateStr) {
    // date format is "YYYY-M-D"
    var parts = dateStr.split("-");
    var date = new Date(parts[0], (parts[1] - 1), parts[2]);
    return  date;
}

function wrapLabelWithData(item, label) {
    return "<span>" + label + "</span>";
}

function hasAnyData(collection) {
    return _.some(collection, function(elem){ return elem.get("value") != null });
}

// -- models and views
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

var InsuredListView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        if(!hasAnyData(this.models)) {
            return this;
        }

        var intervals = "";
        var orderedItems = this.models.slice().reverse();
        var result = [];
        _.each(orderedItems, function (item) {
            var value = item.get("value");
            if(value != null) {
                result.push(wrapLabelWithData(item, value.period.replace("neuvedeno", "dosud") + ": "+ value.company.name));
            }
        });

        $("#content").append(_.template($("#panel_template_insured").html(),{'intervals':result}));
    }
});

function dateToString(date) {
    if(date != null) {
        return date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear();
    }
    return "neuvedeno";
}

var NotInsuredListView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        if(!hasAnyData(this.models)) {
            return this;
        }
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

var CompaniesView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        if(!hasAnyData(this.models)) {
            return this;
        }
        var values = getInsuranceCompanies(this.models);
        $("#content").append(_.template($("#panel_template_companies").html(),{'companies':values, 'regno':this.regno}));
        return this;
    }
});

var NoDataView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        var hasAnyData = _.some(this.models, function(elem){ return elem.get("value") != null });
        if(!hasAnyData) {
            $("#content").append(_.template($("#panel_nodata").html(),{'regno':this.regno}));
        }
        return this;
    }
});

var CarInfoView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        if(!hasAnyData(this.models)) {
            return this;
        }
        var value = _.find(this.models, function(elem){ return elem.get("value") != null });
        value = value.get("value");
        $("#content").append(_.template($("#panel_typeinfo").html(),{'vehicle':value}));
        return this;
    }
});

var TimelineView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },
    render: function (event) {
        if(!hasAnyData(this.models)) {
            return this;
        }
        $("#content").append(_.template($("#panel_timeline").html(),{}));
        var container = document.getElementById('chart');
        new InsuranceTimeline(container, this.models);
        return this;
    }
});

var ContractAnniversaryView = Backbone.View.extend({
    initialize: function () {
        this.model.on('reset', this.render);
    },

    render: function(event) {
        if(!hasAnyData(this.models)) {
            return this;
        }
        var last = this.models[this.models.length - 1];
        var data = last.get("value");
        if(data != null) {
            var contractFrom = parseCkpDate(data.date_from);
            var anniversary = new Date(new Date().getFullYear(),contractFrom.getMonth(), contractFrom.getDate() - 7*6);
            if(anniversary.getTime() <= new Date().getTime()) {
                anniversary.setFullYear(new Date().getFullYear() + 1);
            }
            var twoMonthsFromStart = new Date(contractFrom.getTime());
            twoMonthsFromStart.setMonth(contractFrom.getMonth() + 2);
            $("#content").append(_.template($("#panel_anniversary").html(),{'contractFrom':contractFrom, 'anniversary': anniversary, 'twoMonthsFromStart' : twoMonthsFromStart}));
        }

        return this;

    }
});

var collection = new InsuranceCollectionModel();

new NoDataView({model:collection});
new CarInfoView({model:collection});
new TimelineView({model: collection});
new InsuredListView({model:collection});
new NotInsuredListView({model:collection});
new ContractAnniversaryView({model:collection});
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

function showLoader() {
    var button = $("#submit");
    button.button('loading');
    $("#content").html("<div id='loader'><i class='fa fa-spinner fa-spin'></i> Načítám informace, chvilku prosím vyčkejte.</div>");
}

function hideLoader() {
    var button = $("#submit");
    button.button('reset');
    $("#loader").remove();
}

function processForm() {
    var inputField = $("#regno");
    var regno = inputField.val();
    regno = regno.toUpperCase().trim();
    inputField.val(regno);
    $(location).attr('hash', regno);

    collection.setRegistrationNumber(regno);
    showLoader();
    collection.fetch({
        success: function (model, response, options) {
            hideLoader();
        },
        error: function(collection, response, options) {
            hideLoader();
            console.log(response);
        },
        reset: true
    });
}

function checkHashAndFireAction() {
    var hash = $(location).attr('hash');
    if(typeof hash != "undefined" && hash.length > 1) {
        hash = encodeURIComponent(hash.substr(1));
        $("#regno").val(hash);
        processForm();
    }
}

$( document ).ready(function() {
    checkHashAndFireAction();
});