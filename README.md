# reportify

GitHub reportification.  As seen on [npm](https://www.npmjs.com/package/reportify).

More precisely, reportify is a command line tool that uses [GitHub API tokens](https://github.com/blog/1509-personal-api-tokens) to generate a report describing the detailed issue history of a repository.

Each issue will be detailed by what is available.  This is a small issue

```
1: 'concatenate issues into global list rather than print as received'
   Issue is closed
   Events:
         Apr 6th, 2016, 1:49 PM: Closed by User kdbanman
```

and this is an issue from a much more process-oriented project

```
234: 'add traceability comments for requirements 3.2.2'
     Assigned to j-rewerts
     Labelled '7 April'
     Issue is closed
     Events:
           Apr 3rd, 2016, 7:00 PM: Assigned to j-rewerts by User j-rewerts
           Apr 3rd, 2016, 7:00 PM: Labeled 7 April by User kdbanman
           Apr 3rd, 2016, 7:59 PM: Renamed by User ryant26
           Apr 4th, 2016, 1:15 PM: Labeled in progress by User j-rewerts
           Apr 4th, 2016, 1:21 PM: Unlabeled in progress by User j-rewerts
           Apr 4th, 2016, 1:21 PM: Labeled ready by User j-rewerts
           Apr 4th, 2016, 10:30 PM: Unlabeled ready by User j-rewerts
           Apr 4th, 2016, 10:30 PM: Labeled in progress by User j-rewerts
           Apr 4th, 2016, 11:58 PM: Closed with commit f0a8ff by User j-rewerts
               f0a8ff:  'Added traceable requirements for Section 3.2.2 Client. Closes #234.'
           Apr 4th, 2016, 11:58 PM: Unlabeled in progress by User j-rewerts

```

Enjoy and maybe [donate!](https://www.patreon.com/user?u=3200065)

### install

```bash
npm install -g reportify
```

### run

reportify the repo `https://github.com/kdbanman/reportify` with auth token `112c41694a8404f929464b2511ac2c90763cdf3d` (not a real token)

```bash
$ reportify -r kdbanman/reportify -t 112c41694a8404f929464b2511ac2c90763cdf3d
```

## get help

```bash
$ reportify -h
```
