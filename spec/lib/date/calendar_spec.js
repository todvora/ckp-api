var fs = require("fs");
var path = require("path");

var calendar = require("../../../lib/date/calendar");


describe(__filename, function () {

    it("should handle simple interval adding", function (done) {
        var cal = new calendar.Calendar(calendar.createDate(2013,1,1), calendar.createDate(2013,2,1));
        cal.addInterval(calendar.createDate(2013,1,10), calendar.createDate(2013,1,20), {name:"CSOB"});

        var intervals = cal.getAllIntervals();
        expect(intervals.length).toEqual(3);

        var voidOne = intervals[0];
        var insured = intervals[1];
        var voidTwo = intervals[2];

        expect(voidOne.start).toEqual(calendar.createDate(2013,1,1));
        expect(voidOne.end).toEqual(calendar.createDate(2013,1,9));
        expect(voidOne.value).toBeNull();

        expect(insured.start).toEqual(calendar.createDate(2013,1,10));
        expect(insured.end).toEqual(calendar.createDate(2013,1,20));
        expect(insured.value).toEqual({name:"CSOB"});

        expect(voidTwo.start).toEqual(calendar.createDate(2013,1,21));
        expect(voidTwo.end).toEqual(calendar.createDate(2013,2,1));
        expect(voidTwo.value).toBeNull();

        done();
    });


    it("should handle interval overlapping - before", function (done) {
        var cal = new calendar.Calendar(calendar.createDate(2013,1,1), calendar.createDate(2013,2,1));
        cal.addInterval(calendar.createDate(2012,12,10), calendar.createDate(2013,1,20), {name:"CSOB"});

        var intervals = cal.getAllIntervals();
        expect(intervals.length).toEqual(2);

        var insured = intervals[0];
        expect(insured.start).toEqual(calendar.createDate(2013,1,1));
        expect(insured.end).toEqual(calendar.createDate(2013,1,20));
        expect(insured.value).toEqual({name:"CSOB"});

        var voidOne = intervals[1];
        expect(voidOne.start).toEqual(calendar.createDate(2013,1,21));
        expect(voidOne.end).toEqual(calendar.createDate(2013,2,1));
        expect(voidOne.value).toBeNull();

        done();
    });


    it("should handle interval overlapping - after", function (done) {
        var cal = new calendar.Calendar(calendar.createDate(2013,1,1), calendar.createDate(2013,2,1));
        cal.addInterval(calendar.createDate(2013,1,10), calendar.createDate(2013,2,10), {name:"CSOB"});

        var intervals = cal.getAllIntervals();
        expect(intervals.length).toEqual(2);

        var insured = intervals[1];
        expect(insured.start).toEqual(calendar.createDate(2013,1,10));
        expect(insured.end).toEqual(calendar.createDate(2013,2,1));
        expect(insured.value).toEqual({name:"CSOB"});

        var voidOne = intervals[0];
        expect(voidOne.start).toEqual(calendar.createDate(2013,1,1));
        expect(voidOne.end).toEqual(calendar.createDate(2013,1,9));
        expect(voidOne.value).toBeNull();

        done();
    });

    it("should handle all covered interval", function (done) {
        var cal = new calendar.Calendar(calendar.createDate(2013,1,1), calendar.createDate(2013,2,1));
        cal.addInterval(calendar.createDate(2012,1,1), calendar.createDate(2014,1,1), {name:"CSOB"});

        var intervals = cal.getAllIntervals();
        expect(intervals.length).toEqual(1);

        var insured = intervals[0];
        expect(insured.start).toEqual(calendar.createDate(2013,1,1));
        expect(insured.end).toEqual(calendar.createDate(2013,2,1));
        expect(insured.value).toEqual({name:"CSOB"});

        done();
    });
});