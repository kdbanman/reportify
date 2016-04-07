#! /usr/bin/env node

var log = require('loglevel');
var program = require('commander');
var github = require('octonode');
var Q = require('q');

var pad = function (obj) {
    return ' '.repeat(obj.toString().length);
};

// Courtesy Steve Hansell of http://stackoverflow.com/a/3291856
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

program
    .version('1.0.0')
    .option('-r, --repo [repo url]', '(REQUIRED) GitHub repo URL.')
    .option('-t, --token [token]', 'GitHub auth token.')
    .option('-d, --debug', 'Enable debug output.');

program.on('--help', function () {
    console.log('Examples:');
    console.log('');
    console.log('');
    console.log('No token, public repos only:');
    console.log('   $ reportify ' +
        '-r kdbanman/reportify ');
    console.log('');
    console.log('');
    console.log('Your token with access to your private repos:');
    console.log('   $ reportify ' +
        '-r polyball/polyball ' +
        '-t 112c41694a8404f929464b2511ac2c90763cdf3d');
    console.log('');

});

program.parse(process.argv);

if (!program.repo) {
    console.warn('Incorrect usage.');
    program.outputHelp();
    process.exit(1);
}

if (program.debug) {
    log.setLevel('debug');
} else {
    log.setLevel('info');
}

log.info(
    'Grabbing data from ' + 
    program.repo + 
    ' with token ' + 
    program.token + '...');
log.info('');

var client;
if (!program.token) {
    client = github.client();
} else {
    client = github.client(program.token);
}
log.debug('Client created:');
log.debug(client);
log.debug('');

var repo = client.repo(program.repo);
log.debug('Repo accessed:');
log.debug(repo);
log.debug('');

var issuesPromises = [];
var issuesEventsPromises = [];
var receivedIssues = [];

var extractLabelNames = function (issue) {
    if (issue.labels.length > 0) {
        var names = '';
        issue.labels.forEach(function (label) {
            names += "'" + label.name + "', ";
        });
        return names.slice(0, names.length - 2);
    }
};


var printEvents = function (events, issueHeader) {
    log.debug('Printing ' + events.length + ' events.');
    events.forEach(function (event) {
        var padLog = function (msg) {
            log.info(pad('    ') + msg);
        };

        // Pad and capitalize event verb
        var eventString = event.event.capitalize();
        eventString = pad(issueHeader + '  ') + eventString;

        // Append verb object
        if (event.label) {
            eventString += ' ' + event.label.name;
        } else if (event.assignee) {
            eventString += ' to ' + event.assignee.login;
        } else if (event.event === 'closed') {
            if (event.commit_id) {
                eventString += ' with commit ' + event.commit_id.slice(0, 6);
            }
            eventString += ' on ' + event.created_at;
        }

        // Append verb subject
        if (event.actor) {
            eventString +=
                ' by ' +
                event.actor.type +
                ' ' +
                event.actor.login;
        }

        // Log event verb phrase
        padLog(eventString);
    });
};

var printIssues = function (issues) {
    log.debug('Printing ' + issues.length + ' issues.');
    issues.forEach(function (issue) {
        var issueHeader = issue.number + ': ';
        var padLog = function (msg) {
            log.info(pad(issueHeader) + msg);
        };

        log.info(issueHeader + '\'' + issue.title + '\'');
        if (issue.assignee) 
            padLog('Assigned to ' + issue.assignee.login);
        if (issue.labels.length > 0)
            padLog('Labelled ' + extractLabelNames(issue));
        if (issue.milestone) 
            padLog('Part of \'' + issue.milestone.title + '\' milestone');
        padLog('Issue is ' + issue.state);
        if (issue.events && issue.events.length > 0) {
            padLog('Events:');
            printEvents(issue.events, issueHeader);
        }
        log.info('');
    });
};

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

var closeDateComparator = function (issueA, issueB) {
    if (!issueA.state === 'open' && !issueB.state === 'open') {
        return issueA.number -  issueB.number;
    }
    var closeDateA = getLastCloseDate(issueA);
    var closeDateB = getLastCloseDate(issueB);

    if (!closeDateA && closeDateB) {
        return -1;
    }
    if (closeDateA && !closeDateB) {
        return 1;
    }
    if (!closeDateA && !closeDateB) {
        throw 'Neither issue closed date found, should not hit this in comparator function.';
    }

    return closeDateA.toUpperCase().localeCompare(closeDateB.toUpperCase());
};

var getIssueEvents = function (issue) {
    log.debug('Creating promise for issue ' + issue.number + ' events');
    return Q.Promise(function (resolve, reject) {
        log.debug('Getting events for issue ' + issue.number);

        client.get(issue.events_url, function (err, status, eventsPage) {
            log.debug('Response received for issue ' + issue.number + ' events');
            if (err) {
                log.debug(err);
                reject(err);
            }
            if (status !== 200) {
                log.debug(err);
                reject('Issue Events error bad status ' + status);
            }
            issue.events = eventsPage;
            resolve(issue);
        });
    });
};

var buildEventsPromises = function () {
    log.debug('Augmenting ' + receivedIssues.length + ' issues with events.');

    issuesEventsPromises = receivedIssues.map(getIssueEvents);
};

var buildIssuesPromises = function (max) {
    return Q.promise(function (resolve, reject) {

        repo.issues({
            state: 'all',
            per_page: 1
        }, function (err, issuesPage) {
            if (err) {
                reject(err);
            }
            if (issuesPage.length === 0) {
                throw 'No issues present';
            }
            var issueCount = Math.max(issuesPage[0].number, max);
            var pageCount = issueCount / 25 + 1;
            while (issuesPromises.length < pageCount) {
                issuesPromises.push(Q.Promise(function (resolve, reject) {
                    repo.issues({
                        state: 'all',
                        page: issuesPromises.length + 1,
                        per_page: 25
                    }, function (err, issuesPage) {
                        if (err) {
                            reject(err);
                        }
                        log.debug('Issues received: (' + issuesPage.length + ')');

                        receivedIssues = receivedIssues.concat(issuesPage);
                        resolve();
                    });
                }));
            }
            resolve();
        });
    });
};

buildIssuesPromises(30).then(function () {
    Q.allSettled(issuesPromises).then(
        function () {
            buildEventsPromises();

            Q.allSettled(issuesEventsPromises).then(
                function () {
                    log.debug('Sorting issues by closure date.');
                    receivedIssues.sort(closeDateComparator);

                    log.debug('Printing issues.');
                    printIssues(receivedIssues);
                }, function (err) {
                    log.error(err);
                }, function (something) {
                    log.info(something);
                });
        }
    );
});