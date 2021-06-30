# dotenv-out

![npm](https://img.shields.io/npm/v/dotenv-out)

This CLI is a wrapper for [dotenv](https://github.com/motdotla/dotenv) and will
output a resultant file with the compiled environment in a particular language
format.

The behavior of this mimics the same cascading and multi-file options of
[dotenv-cli](https://github.com/entropitor/dotenv-cli).

Current output format support:

- Dotenv `-f dotenv`
- Shell `-f shell`
- Typescript `-f typescript`

PRs are welcome for additional templates!

## Running

```
npx dotenv-out --help
```

### Within a project

```
yarn add --dev dotenv-out
```

In `package.json`:

```
  "scripts": {
    "dotenv": "dotenv-out -f typescript -o src"
  },
```

## Usage

```
Usage: dotenv-out [options]

Options:
      --help             Show help  [boolean]
      --version          Show version number  [boolean]
  -f                     Output format  [required] [choices: "dotenv", "shell", "typescript"]
  -d                     Dryrun + Debug (No output file will be written)  [boolean] [default: false]
  -e                     Path to .env file(s)  [array] [required] [default: ".env"]
  -o                     Output directory for generated Typescript file  [required] [default: "."]
      --c <environment>  Cascading env variables from files:
                                 .env.<environment>.local
                                 .env.<environment>
                                 .env.local
                                 .env

  -c                     Cascading env variables from files:
                                 .env.local
                                 .env


Examples:
  dotenv-out -f typescript -d                                            Dryrun+debug output using:
                                                                               .env

  dotenv-out -f typescript -e .env                                       Generate ./env.ts using:
                                                                               .env

  dotenv-out -f typescript -e .env                                       Generate ./env.ts using:
                                                                               .env

  dotenv-out -f dotenv -e .env -o src                                    Generate ./src/.env using:
                                                                               .env

  dotenv-out -f typescript -e .env -c                                    Generate ./env.ts using:
                                                                               .env.local
                                                                               .env

  dotenv-out -f typescript -e .env -c nonlive                            Generate ./env.ts using:
                                                                               .env.nonlive.local
                                                                               .env.nonlive
                                                                               .env.local
                                                                               .env

  dotenv-out -f typescript -e .scaffoldly/.env -e .env                   Generate ./env.ts using:
                                                                               .scaffoldly/.env
                                                                               .env

  dotenv-out -f typescript -e .scaffoldly/.env -e .env -c                Generate ./env.ts using:
                                                                               .scaffoldly/.env.local
                                                                               .scaffoldly/.env
                                                                               .env.local
                                                                               .env

  dotenv-out -f typescript -e .scaffoldly/.env -e .env -c nonlive        Generate ./env.ts using:
                                                                               .scaffoldly/.env.nonlive.local
                                                                               .scaffoldly/.env.nonlive
                                                                               .scaffoldly/.env.local
                                                                               .scaffoldly/.env
                                                                               .env.nonlive.local
                                                                               .env.nonlive
                                                                               .env.local
                                                                               .env

  dotenv-out -f dotenv -e .scaffoldly/.env -e .env -c nonlive -o outdir  Generate ./outdir/.env using:
                                                                               .scaffoldly/.env.nonlive.local
                                                                               .scaffoldly/.env.nonlive
                                                                               .scaffoldly/.env.local
                                                                               .scaffoldly/.env
                                                                               .env.nonlive.local
                                                                               .env.nonlive
                                                                               .env.local
                                                                               .env
```
