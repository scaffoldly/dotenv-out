#!/usr/bin/env node
module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 932:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __nccwpck_require__) => {

__nccwpck_require__.r(__webpack_exports__);
const fs = require('fs');
const url = require('url');
const yargs = require('yargs');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const path = require('path');
const ejs = require('ejs');

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
  const rendered = await ejs.renderFile(
    path.resolve(`${path.dirname(url.fileURLToPath("file:///Users/christian/scaffoldly/dotenv-ts/index.js"))}/${templateFile}`),
    {
      entries,
    },
  );
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nccwpck_require__(932);
/******/ })()
;