#!/usr/bin/env node
import fs from 'fs';
import yargs from 'yargs';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';
import ejs from 'ejs';

const formats = {
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

const cascadePaths = (paths, cascade) => {
  return paths.reduce((acc, path) => {
    if (cascade === true) {
      acc.push(...[`${path}.local`, path]);
    } else {
      acc.push(...[`${path}.${cascade}.local`, `${path}.${cascade}`, `${path}.local`, path]);
    }

    return acc;
  }, []);
};

const expandEnvironment = (paths, output) => {
  return paths.reduce((acc, env) => {
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

const generateTemplate = async (env, templateFile) => {
  const entries = Object.entries(env).map(([key, value]) => {
    return { key, value };
  });
  const rendered = await ejs.renderFile(fs.realpathSync(templateFile), {
    entries,
  });
  return rendered;
};

const write = (contents, location) => {
  fs.mkdirSync(path.parse(location).dir, { recursive: true });
  fs.writeFileSync(location, contents);
};

const run = async (debug, format, paths, cascade, output) => {
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
    const argv = yargs(process.argv.slice(2))
      .usage('Usage: $0 [options]')
      .wrap(null)
      .describe('f', 'Output format')
      .choices('f', Object.keys(formats))
      .describe('d', 'Dryrun + Debug (No output file will be written)')
      .boolean('d')
      .default('d', false)
      .describe('e', 'Path to .env file(s)')
      .array('e')
      .default('e', '.env')
      .describe('o', 'Output directory for generated Typescript file')
      .default('o', '.')
      .describe(
        'c <environment>',
        `Cascading env variables from files: 
        .env.<environment>.local
        .env.<environment>
        .env.local
        .env 
        `,
      )
      .describe(
        'c',
        `Cascading env variables from files: 
        .env.local
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
        '$0 -f typescript -e .env',
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
        '$0 -f typescript -e .env -c nonlive',
        `Generate ./env.ts using:
        .env.nonlive.local
        .env.nonlive
        .env.local
        .env
`,
      )
      .example(
        '$0 -f typescript -e .scaffoldly/.env -e .env',
        `Generate ./env.ts using:
        .scaffoldly/.env
        .env
`,
      )
      .example(
        '$0 -f typescript -e .scaffoldly/.env -e .env -c',
        `Generate ./env.ts using:
        .scaffoldly/.env.local
        .scaffoldly/.env
        .env.local
        .env
`,
      )
      .example(
        '$0 -f typescript -e .scaffoldly/.env -e .env -c nonlive',
        `Generate ./env.ts using:
        .scaffoldly/.env.nonlive.local
        .scaffoldly/.env.nonlive
        .scaffoldly/.env.local
        .scaffoldly/.env
        .env.nonlive.local
        .env.nonlive
        .env.local
        .env
`,
      )
      .example(
        '$0 -f dotenv -e .scaffoldly/.env -e .env -c nonlive -o outdir',
        `Generate ./env.ts using:
        .scaffoldly/.env.nonlive.local
        .scaffoldly/.env.nonlive
        .scaffoldly/.env.local
        .scaffoldly/.env
        .env.nonlive.local
        .env.nonlive
        .env.local
        .env
`,
      )
      .demandOption(['f', 'e', 'o']).argv;

    await run(argv.d, argv.f, argv.e, argv.c, argv.o);
  } catch (e) {
    console.error(e.message);
    process.exit(-1);
  }
})();
