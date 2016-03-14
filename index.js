var program = require('commander');

program
    .version('1.0.0')
    .option('-t, --token [token]', 'GitHub auth token.')
    .option('-r, --repo [repo url]', 'GitHub repo URL.');

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

console.log(
    'Grabbing data from ' + 
    program.repo + 
    ' with token ' + 
    program.token + '...');
