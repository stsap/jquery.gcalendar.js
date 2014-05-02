;(function ($) {
    $.fn.gCalendar = function (options) {
        if (typeof(moment) === "undefined")
            throw new Error("jquery.gcalendar.js depends on moment.js. please include moment.js in your html head.");
        if (typeof($.jCal) === "undefined")
            throw new Error("jquery.gcalendar.js depends on jCal.js. please include jquery.jcal.js in your html head.");
        var dFetch;
        var gcalEvents;
        var defaults = {
            googlebase: "http://www.google.com/calendar/feeds/",
            googleparam: {
                orderby: "starttime",
                sortorder: "ascend",
                "max-results": 365,
                alt: "json-in-script",
            },
            disableMonthControl: false,
            disableDaySelection: false,
            // diff months from [jcalopts.day]
            monthControlLimit: {
                min: 3,
                max: 3
            },
            calendarType: "/public/full",
            addingClasses: [
                {"title": "holiday", "class": "holiday"},
                {"title": "work", "class": "job"}
            ],
            swapYearMonthPosition: true,
            addYearUnit: true,
            yearUnit: "年",
            jcalopts: {
            }
        };
        var settings = $.extend(defaults, options);
        if (!settings.googleuser)
            throw new Error("googleuser parameter is required.");

        var mMin =
            (settings.gScheduleStartDate) ? moment(settings.gScheduleStartDate):
            (settings.jcalopts !== undefined && settings.jcalopts.day) ? moment(settings.jcalopts.day): moment(new Date());
        var mMax =
            (settings.gScheduleEndDate) ? moment(settings.gScheduleEndDate):
            (settings.jcalopts !== undefined && settings.jcalopts.showMonths && settings.jcalopts.showMonths !== 1) ?
                mMin.clone().add("months", settings.jcalopts.showMonths): mMin.clone();
        settings.googleparam["start-min"] = [mMin.format("YYYY"), mMin.format("MM"), "01"].join("-");
        settings.googleparam["start-max"] = [mMax.format("YYYY"), mMax.format("MM"), "31"].join("-");

        var fetchGCal = function () {
            var d = $.Deferred();
            $.getJSON(settings.googlebase + settings.googleuser + settings.calendarType + "?callback=?", settings.googleparam)
                .then(
                    function (data) {
                        var _rehashEvents = function (rEvent, title) {
                            var events = {};
                            $.each(rEvent, function (i, ev) { events[ev.startTime] = title; });
                            return events;
                        };
                        $.each(data.feed.entry, function (i, entry) {
                            gcalEvents = $.extend(gcalEvents, _rehashEvents(entry.gd$when, entry.title.$t));
                        });
                        d.resolve();
                    },
                    function () { d.reject(); }
                );
            return d.promise();
        };
        settings.jcalopts.drawBack = function () {
            if (!gcalEvents) dFetch = fetchGCal();
            dFetch.then(
                function () {
                    $.each(gcalEvents, function (key, val) {
                        if (settings.addingClasses.length === 0) return false;
                        var spl = key.split("-");
                        var calendarId = (settings.jcalopts.showMonths) ? settings.jcalopts.showMonths: 1;
                        var formatted = "#c" + calendarId + "d_" + Number(spl[1]) + "_" + Number(spl[2]) + "_" + spl[0];
                        var target = $.grep(settings.addingClasses, function (obj) {
                            return gcalEvents[key] === obj.title;
                        })[0];
                        if (target) $(formatted).addClass(target["class"]);
                    })
                },
                function () { alert("Google Calendar API connection failed."); }
            );
            if (settings.disableDaySelection) $("div.day").css("cursor", "auto").unbind();
            if (settings.disableMonthControl) {
                $("div.jCal").find(".left,.right").hide();
                $("div.jCal").find(".monthName,.monthYear").css("cursor", "auto");
            } else {
                $("div.jCal").find(".left,.right").show();
                var initialDate = (settings.jcalopts && settings.jcalopts.day) ? moment(settings.jcalopts.day): moment(new Date());
                var now;
                var yearText = $("div.jCal > div.month:eq(0)").find("span.monthYear").text();
                if (settings.jcalopts.ml) {
                    var nowM;
                    $.each(settings.jcalopts.ml, function (i, record) {
                        if (record === $("div.jCal > div.month:eq(0)").find("span.monthName").text()) nowM = i + 1;
                    });
                    now = moment(yearText + "/" + nowM, "YYYY/MM");
                } else {
                    var nowM = $("div.day:eq(0)").prop("id").split("_")[1];
                    now = moment(yearText + "/" + nowM, "YYYY/MM");
                }
                if (settings.monthControlLimit) {
                    var maxLimit = initialDate.clone().add("months", settings.monthControlLimit.max),
                        minLimit = initialDate.clone().subtract("months", settings.monthControlLimit.min);
                    if (now.isAfter(maxLimit)) $("div.jCal").find(".right").hide();
                    if (now.isBefore(minLimit)) $("div.jCal").find(".left").hide();
                }
            }
            if (settings.swapYearMonthPosition) {
                var $headArea = $("div.jCal:eq(0)"),
                    $titleArea = $headArea.children("div.month"),
                    $monthArea = $titleArea.children("span.monthName"),
                    $yearArea = $titleArea.children("span.monthYear");
                var parentWidth = $headArea.width();
                if (settings.addYearUnit && settings.yearUnit)
                    $yearArea.text($yearArea.text() + settings.yearUnit);
                $titleArea.width(parentWidth);
                $yearArea.css({
                    "float": "left",
                    "text-align": "right",
                    "padding": 0,
                    "width": parentWidth / 2
                });
                $monthArea.css({
                    "float": "right",
                    "text-align": "left",
                    "padding": 0,
                    "width": parentWidth / 2
                });
            }
        }

        $(this).jCal(settings.jcalopts);
        return dFetch;
    };
})(jQuery);
