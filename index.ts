#!/usr/bin/env node
import fs from 'fs';
import yargs from 'yargs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';
import ejs from 'ejs';
import { parse } from 'yaml';

type ServerlessYaml = {
  provider?: {
    environment?: { [key: string]: any };
  };
};

const formats: { [key: string]: { template: string; out: string } } = {
  dotenv: {
    template: 'templates/.env.ejs',
    out: '.env',
  },
  shell: {
    template: 'templates/env.sh.ejs',
    out: 'env.sh',
  },
  typescript: {
    template: 'templates/env.ts.ejs',
    out: 'env.ts',
  },
};

const cascadePaths = (paths: string[], cascade: unknown) => {
  return paths.reduce<string[]>((acc, path) => {
    if (cascade === true) {
      acc.push(...[`${path}.local`, path]);
    } else {
      acc.push(...[`${path}.${cascade}`, path]);
    }

    return acc;
  }, []);
};

const expandServerless = (serverlessYaml?: string) => {
  if (!serverlessYaml) {
    return {};
  }
  const serverless = parse(fs.readFileSync(serverlessYaml, 'utf8')) as ServerlessYaml;
  if (!serverless.provider || !serverless.provider.environment) {
    return {};
  }
  return Object.entries(serverless.provider.environment).reduce((acc, [key, value]) => {
    if (typeof value !== 'string') {
      acc[key] = 'injected-at-runtime';
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {} as { [key: string]: string });
};

const expandEnvironment = (paths: string[], output: string, overwrite: boolean) => {
  return paths.reduce<{ [key: string]: string }>((acc, env) => {
    const inFile = path.resolve(env);
    if (inFile === output) {
      if (!overwrite) {
        throw new Error(
          `Error: This would overwrite a source file: ${inFile}. Use \`--overwrite\` to overwrite ${inFile} and exclude it from expansion.`,
        );
      } else {
        console.warn(`WARNING: ${inFile} will be overwritten`);
        return acc;
      }
    }

    const out = dotenvExpand(dotenv.config({ path: inFile }));
    if (!out.parsed) {
      return acc;
    }
    return {
      ...acc,
      ...out.parsed,
    };
  }, {});
};

const generateTemplate = async (env: { [key: string]: string }, templateFile: string) => {
  const entries = Object.entries(env).map(([key, value]) => {
    return { key, value };
  });
  const rendered = await ejs.renderFile(path.resolve(`${__dirname}/${templateFile}`), {
    entries,
  });
  return rendered;
};

const write = (contents: string, location: string) => {
  fs.mkdirSync(path.parse(location).dir, { recursive: true });
  fs.writeFileSync(location, contents);
};

const run = async (
  debug: boolean,
  format: string,
  paths: string[],
  cascade: unknown,
  output: string,
  overwrite: boolean,
  serverlessYaml?: string,
) => {
  if (cascade) {
    paths = cascadePaths(paths, cascade);
  }

  if (debug) console.debug('Paths: ', paths);

  output = path.resolve(`${output}/${formats[format].out}`);

  const expandedEnv = expandEnvironment(paths, output, overwrite);

  if (debug) console.debug('Expanded Environment:', expandedEnv);

  const serverlessEnv = expandServerless(serverlessYaml);

  if (debug) console.debug('Expanded Serverless Environment:', serverlessEnv);

  const rendered = await generateTemplate(
    { ...serverlessEnv, ...expandedEnv },
    formats[format].template,
  );

  if (debug) console.debug(`Rendered ${output}:\n\n\`\`\`${format}\n${rendered}\`\`\`\n`);

  if (!debug) write(rendered, output);
};

(async () => {
  try {
    const argv = await yargs(process.argv.slice(2))
      .usage('Usage: $0 [options]')
      .wrap(null)
      .describe('f', 'Output format')
      .choices('f', Object.keys(formats))
      .describe('d', 'Dryrun + Debug (No output file will be written)')
      .boolean('d')
      .default('d', false)
      .describe(
        'overwrite',
        'Force overwrite if a source file is also a destination file. This will exclude source file from expansion as well',
      )
      .boolean('overwrite')
      .default('overwrite', false)
      .describe('e', 'Path to .env file(s), in order of precedence')
      .default('e', '.env')
      .string('e')
      .array('e')
      .describe('sls', 'Include environment variables from serverless YAML file')
      .boolean('sls')
      .default('sls', false)
      .describe('slsYaml', 'Include environment variables in the provided Serverless YAML file')
      .string('slsYaml')
      .default('slsYaml', 'serverless.yml')
      .describe('o', 'Output directory for generated Typescript file')
      .default('o', '.')
      .describe(
        'c',
        `Cascading env variables from files: 
        .env.<arg> (If not provided an <arg>, defaults to \`local\`)
        .env 
        `,
      )
      .example(
        '$0 -f typescript -d',
        `Dryrun+debug output using:
        .env
`,
      )
      .example(
        '$0 -f typescript',
        `Generate ./env.ts using:
        .env
`,
      )
      .example(
        '$0 -f typescript -e .env',
        `Generate ./env.ts using:
        .env
`,
      )
      .example(
        '$0 -f dotenv -e .env -o src',
        `Generate ./src/.env using:
        .env
`,
      )
      .example(
        '$0 -f typescript -e .env -c',
        `Generate ./env.ts using:
        .env.local
        .env
`,
      )
      .example(
        '$0 -f typescript -e .env -c live',
        `Generate ./env.ts using:
        .env.live
        .env
`,
      )
      .example(
        '$0 -f typescript -e .env -e .other/.env',
        `Generate ./env.ts using:
        .env
        .other/.env
`,
      )
      .example(
        '$0 -f typescript -e .env -e .other/.env -c',
        `Generate ./env.ts using:
        .env.local
        .env
        .other/.env.local
        .other/.env
`,
      )
      .example(
        '$0 -f typescript -e .env -e .other/.env -c live',
        `Generate ./env.ts using:
        .env.live
        .env
        .other/.env.live
        .other/.env
`,
      )
      .example(
        '$0 -f dotenv -e .env -e .other/.env -c live -o outdir',
        `Generate ./outdir/.env using:
        .env.live
        .env
        .other/.env.live
        .other/.env
`,
      )
      .demandOption(['f', 'e', 'o']).argv;

    await run(
      argv.d,
      argv.f,
      argv.e,
      argv.c,
      argv.o,
      argv.overwrite,
      argv.sls ? argv.slsYaml : 'serverless.yml',
    );
  } catch (e) {
    if (!(e instanceof Error)) {
      console.error(e);
      process.exit(-1);
    }
    console.error(e.message);
    process.exit(-1);
  }
})();
