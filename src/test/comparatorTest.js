/**
 * Created by kdbanman on 06/04/16.
 */

var comparators = require('../comparators');
var should = require('should');

/**
 * RECENT CLOSURES TOWARD BOTTOM
 * RECENT CREATED OPEN TOWARD BOTTOM
 * CLOSED ABOVE OPEN
 * 
 *
 * 5 closed at 55000
 * 4 closed at 45000 and at 85000
 * 1 closed at 100000
 * 2 open
 * 3 open, but closed at 50000 and at 500000 (implies reopened)
 * 6 open
 * 
 * @type {*[]}
 */
var testIssues = [
    {
        number: 1,
        state: 'closed',
        events: [
            {
                event: 'closed',
                created_at: new Date(100000).toISOString()
            }
        ]
    },
    {
        number: 2,
        state: 'open'
    },
    {
        number: 3,
        state: 'open',
        events: [
            {
                event: 'closed',
                created_at: new Date(50000).toISOString()
            },
            {
                event: 'closed',
                created_at: new Date(500000).toISOString()
            }
        ]
    },
    {
        number: 4,
        state: 'closed',
        events: [
            {
                event: 'closed',
                created_at: new Date(45000).toISOString()
            },
            {
                event: 'closed',
                created_at: new Date(85000).toISOString()
            }
        ]
    },
    {
        number: 5,
        state: 'closed',
        events: [
            {
                event: 'closed',
                created_at: new Date(55000).toISOString()
            }
        ]
    },
    {
        number: 6,
        state: 'open'
    }
];

/*
 * 5 closed at 55000
 * 4 closed at 45000 and at 85000
 * 1 closed at 100000
 * 2 open
 * 3 open, but closed at 50000 and at 500000 (implies reopened)
 * 6 open
 */

testIssues.sort(comparators.closeDate);

testIssues[0].number.should.equal(5);
testIssues[1].number.should.equal(4);
testIssues[2].number.should.equal(1);
testIssues[3].number.should.equal(2);
testIssues[4].number.should.equal(3);
testIssues[5].number.should.equal(6);