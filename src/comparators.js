/**
 * Created by kdbanman on 06/04/16.
 */



var getLastCloseDate = function (issue) {
    if (!issue.events) {
        return;
    }
    var date = undefined;
    issue.events.forEach(function (event) {
        if (event.event === 'closed') {
            date = event.created_at;
        }
    });
    return date;
};

exports.closeDate = function (issueA, issueB) {
    // both issues are open means more recent issues come last
    if (issueA.state === 'open' && issueB.state === 'open') {
        return issueA.number -  issueB.number;
    }

    // open issues come after closed issues
    if (issueA.state === 'open' && issueB.state === 'closed') {
        return 1;
    }
    if (issueA.state === 'closed' && issueB.state === 'open') {
        return -1;
    }
    var closeDateA = getLastCloseDate(issueA);
    var closeDateB = getLastCloseDate(issueB);
    if (!closeDateA && !closeDateB) {
        throw 'Neither issue closed date found, should not hit this in comparator function.';
    }

    // issues closed more recently come last
    return closeDateA.toUpperCase().localeCompare(closeDateB.toUpperCase());
};