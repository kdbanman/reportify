#! /usr/bin/env node

var log = require('loglevel');
var program = require('commander');
var github = require('octonode');

var pad = function (obj) {
    return ' '.repeat(obj.toString().length);
};

// Courtesy Steve Hansell of http://stackoverflow.com/a/3291856
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

program
    .version('1.0.0')
    .option('-d, --debug', 'Enable debug output.')
    .option('-t, --token [token]', '(REQUIRED) GitHub auth token.')
    .option('-r, --repo [repo url]', '(REQUIRED) GitHub repo URL.');

program.on('--help', function () {
    console.log('Examples:');
    console.log('');
    console.log('   $ reportify ' + 
    '-r polyball/polyball ' + 
    '-t 112c41694a8404f929464b2511ac2c90763cdf3d');
    console.log('');
});

program.parse(process.argv);

if (!program.repo || !program.token) {
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

var client = github.client(program.token);
log.debug('Client created:');
log.debug(client);
log.debug('');

var repo = client.repo(program.repo);
log.debug('Repo accessed:');
log.debug(repo);
log.debug('');

var receivedIssues = [];


var getLabelNames = function (issue) {
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
            log.info(pad(issueHeader + '    ') + msg);
        };

        // Pad and capitalize event verb
        var eventString = event.event.capitalize();
        eventString = pad(issueHeader + '  ') + eventString;

        // Append verb object
        if (event.label) {
            eventString += ' ' + event.label.name;
        } else if (event.assignee) {
            eventString += ' to ' + event.assignee.login;
        } else if (event.event === 'closed' && event.commit_id) {
            eventString += ' with commit ' + event.commit_id.slice(0, 6);
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
            padLog('Labelled ' + getLabelNames(issue));
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

var getEvents = function (issues) {
    log.debug('Augmenting ' + issues.length + ' issues with events.');
    issues.forEach(function (issue) {
        log.debug('Augmenting issue ' + issue.number);
        client.get(issue.events_url, function (err, status, eventsPage) {
            if (err) {
                log.error(err);
                return;
            }
            if (status !== 200) {
                log.error(new Error('Issue Events error'));
                return;
            }
            issue.events = eventsPage;

            printIssues([issue]);
        });
    });
};

var getIssuesPage = function (pageNumber, perPage) {
    if (pageNumber == null || pageNumber < 1)
        pageNumber = 1;
    if (perPage == null || perPage < 1 || perPage > 25)
        perPage = 25;

    repo.issues({
        state: 'all',
        page: pageNumber,
        per_page: perPage
    }, function (err, issuesPage) {
        if (err) {
            log.error(err);
            return;
        }
        log.debug('Issues received: (' + issuesPage.length + ')');
        //log.debug(issuesPage);

        receivedIssues = receivedIssues.concat(issuesPage);

        if (issuesPage.length == perPage) {
            getIssuesPage(pageNumber + 1);
        } else {
            getEvents(receivedIssues);
        }
    });
};

getIssuesPage();
