
var params = {};
var calGenerate = function (opt, param) {
    if (opt.setGoogleUser) param.googleuser = "jq.gcalendar@gmail.com";
    return $("#calendar").gCalendar(param);
};

module("initialize");
test("generates jquery method", function () {
    strictEqual(typeof($.fn.gCalendar), "function", "$.fn.gCalendar() exists.");
    strictEqual(typeof($("#calendar").gCalendar), "function", "$(dom).gCalendar() exists.");
});

test("init without parameters", function () {
    throws(function () { calGenerate(); }, "Error to initialization with no parameters.");
});

test("init with googleuser parameter.", function () {
    var d = calGenerate({setGoogleUser: true}, params);
    strictEqual(typeof($("div.jCalMo")), "object", "jCal generated.");
    propEqual(d, $.Deferred().promise(), "returned jQuery.Deferred.promise object.");
})

test("init with required param and addingClasses parameter.", function () {
    stop();
    params.addingClasses = [{title: "holiday", class: "regular-holiday"}];
    calGenerate({setGoogleUser: true}, params)
        .then(function () {
            start();
            strictEqual(typeof($("div.jCalMo")), "object", "jCal generated.");
            ok($("div.regular-holiday").length, "Class that specified has been added.");
        });
});
