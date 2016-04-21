# reportify

GitHub reportification.  As seen on [npm](https://www.npmjs.com/package/reportify).

More precisely, reportify is a command line tool that uses [GitHub API tokens](https://github.com/blog/1509-personal-api-tokens) to generate a report describing the detailed issue history of a repository.

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
