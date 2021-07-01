#!/usr/bin/env node
import fs from 'fs';
import yargs from 'yargs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';
import ejs from 'ejs';

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

const expandEnvironment = (paths: string[], output: string) => {
  return paths.reduce<{ [key: string]: string }>((acc, env) => {
    const inFile = path.resolve(env);
    if (inFile === output) {
      throw new Error(
        `Error: This would overwrite a source file: ${inFile}. Use \`-o\` to change the output directory.`,
      );
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
) => {
  if (cascade) {
    paths = cascadePaths(paths, cascade);
  }

  if (debug) console.debug('Paths: ', paths);

  output = path.resolve(`${output}/${formats[format].out}`);

  const env = expandEnvironment(paths, output);

  if (debug) console.debug('Environment:', env);

  const rendered = await generateTemplate(env, formats[format].template);

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
      .describe('e', 'Path to .env file(s), in order of precedence')
      .default('e', '.env')
      .string('e')
      .array('e')
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

    await run(argv.d, argv.f, argv.e, argv.c, argv.o);
  } catch (e) {
    console.error(e.message);
    process.exit(-1);
  }
})();
