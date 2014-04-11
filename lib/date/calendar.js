exports.Calendar = function (dateFrom, dateTill) {

    var self = this;

    self.dateFrom = dateFrom;
    self.dateTill = dateTill;

    var _internal = [];

    var curr = new Date(dateFrom.getTime());
    while (curr.getTime() <= dateTill.getTime()) {
        _internal.push(null);
        curr.setDate(curr.getDate() + 1);
    }

    self.addInterval = function (from, till, value) {

        if(from.getTime() < self.dateFrom.getTime()) {
            from = self.dateFrom;
        }

        if(till.getTime() > self.dateTill.getTime()) {
            till = self.dateTill;
        }

        var curr = new Date(from.getTime());
        while (curr.getTime() <= till.getTime()) {
            _internal[self.dateToIndex(curr)] = value;
            curr.setDate(curr.getDate() + 1);
        }
    };

    self.getAllIntervals = function() {
        var intervals = [];
        var currentValue = _internal[0];
        var startDate = self.indexToDate(0);
        for(var i=1;i<_internal.length;i++) {
            var item = _internal[i];
            if(item != currentValue) {
                intervals.push({
                   start:startDate,
                   end:self.indexToDate(i-1),
                   value:currentValue
                });
                currentValue = item;
                startDate=self.indexToDate(i);
            }

        }
        intervals.push({
            start:startDate,
            end:self.indexToDate(_internal.length - 1),
            value:currentValue
        });
        return intervals;
    };


    self.indexToDate = function (index) {
        var date = new Date(self.dateFrom);
        date.setDate(self.dateFrom.getDate() + index);
        return date;
    };
    self.dateToIndex = function (date) {
        if (date.getTime() > self.dateTill.getTime()) {
            return null;
        }
        if (date.getTime() < self.dateFrom.getTime()) {
            return null;
        }
        return (date.getTime() - self.dateFrom.getTime()) / 86400000;
    };

    self.length = function() {
        return _internal.length;
    };

    self.internal = function() {
        return _internal;
    }
};

exports.createDate = function(year, month, day) {
    return new Date(year, month - 1, day);
};
