# dotenv-out

![npm](https://img.shields.io/npm/v/dotenv-out)

This CLI is a wrapper for [dotenv](https://github.com/motdotla/dotenv) and will
output a resultant file with the compiled environment in a particular language
format.

**NOTE**: The behavior of this mimics the same cascading and multi-file options of
[dotenv-cli](https://github.com/entropitor/dotenv-cli), **with the exception**
that the `-c <arg>` flag _DOES NOT_ process `*.local` files.

Current output format support:

- Dotenv: `-f dotenv` ([see template](./templates/.env.ejs))
- Shell: `-f shell` ([see template](./templates/env.sh.ejs))
- Typescript: `-f typescript` ([see template](./templates/env.ts.ejs))

PRs are welcome for additional templates!

## Running

```shell
# For all commands and examples
npx dotenv-out --help

```

```shell
# Generate ./src/env.ts using .env
npx dotenv-out -f typescript -o src
```

See [usage](#usage) for more examples.

### Within a project

```shell
yarn add --dev dotenv-out
```

In `package.json`:

```json
  "scripts": {
    "dotenv": "dotenv-out -f typescript -o src"
  },
```

## Usage

```
Usage: dotenv-out [options]

Options:
      --help     Show help  [boolean]
      --version  Show version number  [boolean]
  -f             Output format  [required] [choices: "dotenv", "shell", "typescript"]
  -d             Dryrun + Debug (No output file will be written)  [boolean] [default: false]
  -e             Path to .env file(s), in order of precedence  [array] [required] [default: ".env"]
  -o             Output directory for generated Typescript file  [required] [default: "."]
  -c             Cascading env variables from files:
                         .env.<arg> (If not provided an <arg>, defaults to `local`)
                         .env


Examples:
  dotenv-out -f typescript -d                                    Dryrun+debug output using:
                                                                       .env

  dotenv-out -f typescript                                       Generate ./env.ts using:
                                                                       .env

  dotenv-out -f typescript -e .env                               Generate ./env.ts using:
                                                                       .env

  dotenv-out -f dotenv -e .env -o src                            Generate ./src/.env using:
                                                                       .env

  dotenv-out -f typescript -e .env -c                            Generate ./env.ts using:
                                                                       .env.local
                                                                       .env

  dotenv-out -f typescript -e .env -c live                       Generate ./env.ts using:
                                                                       .env.live
                                                                       .env

  dotenv-out -f typescript -e .env -e .other/.env                Generate ./env.ts using:
                                                                       .env
                                                                       .other/.env

  dotenv-out -f typescript -e .env -e .other/.env -c             Generate ./env.ts using:
                                                                       .env.local
                                                                       .env
                                                                       .other/.env.local
                                                                       .other/.env

  dotenv-out -f typescript -e .env -e .other/.env -c live        Generate ./env.ts using:
                                                                       .env.live
                                                                       .env
                                                                       .other/.env.live
                                                                       .other/.env

  dotenv-out -f dotenv -e .env -e .other/.env -c live -o outdir  Generate ./outdir/.env using:
                                                                       .env.live
                                                                       .env
                                                                       .other/.env.live
                                                                       .other/.env
```

# License

[MIT](./LICENSE)
