#! /usr/bin/env node

var log = require('loglevel');
var program = require('commander');
var github = require('octonode');

var pad = function (obj) {
    return ' '.repeat(obj.toString().length);
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

var getLabelNames = function (issue) {
    if (issue.labels.length > 0) {
        var names = '';
        issue.labels.forEach(function (label) {
            names += "'" + label.name + "', ";
        });
        return names.slice(0, names.length - 2);
    }
}

var printIssues = function (issues) {
    issues.forEach(function (issue) {
        var issueHeader = issue.number + ': ';
        var padLog = function (msg) {
            log.info(pad(issueHeader) + msg);
        };



        log.info(issueHeader + issue.title);
        if (issue.assignee) 
            padLog('Assigned to ' + issue.assignee.login);
        if (issue.labels.length > 0)
            padLog('Labelled ' + getLabelNames(issue));
        if (issue.milestone) 
            padLog('Part of ' + issue.milestone.title + ' milestone');
        padLog('Issue ' + issue.state);
        log.info('');
    });
};

var printIssuesPage = function (pageNumber, perPage) {
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
        log.debug('Issues received:');
        log.debug(issuesPage);

        printIssues(issuesPage);

        if (issuesPage.length == perPage) {
            printIssuesPage(pageNumber + 1);
        }
    });
};

printIssuesPage();
