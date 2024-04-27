#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var yargs_1 = __importDefault(require("yargs"));
var dotenv_1 = __importDefault(require("dotenv"));
var dotenv_expand_1 = __importDefault(require("dotenv-expand"));
var path_1 = __importDefault(require("path"));
var ejs_1 = __importDefault(require("ejs"));
var yaml_1 = require("yaml");
var formats = {
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
var cascadePaths = function (paths, cascade) {
    return paths.reduce(function (acc, path) {
        if (cascade === true) {
            acc.push.apply(acc, [path + ".local", path]);
        }
        else {
            acc.push.apply(acc, [path + "." + cascade, path]);
        }
        return acc;
    }, []);
};
var expandServerless = function (serverlessYaml) {
    if (!serverlessYaml) {
        return {};
    }
    var serverless = yaml_1.parse(fs_1.default.readFileSync(serverlessYaml, 'utf8'), {
        logLevel: 'silent',
        prettyErrors: false,
        strict: false,
    });
    if (!serverless.provider || !serverless.provider.environment) {
        return {};
    }
    return Object.entries(serverless.provider.environment).reduce(function (acc, _a) {
        var key = _a[0], value = _a[1];
        if (typeof value !== 'string') {
            acc[key] = '~~use-env~~';
            return acc;
        }
        acc[key] = value;
        return acc;
    }, {});
};
var expandEnvironment = function (paths, output, overwrite) {
    return paths.reduce(function (acc, env) {
        var inFile = path_1.default.resolve(env);
        if (inFile === output) {
            if (!overwrite) {
                throw new Error("Error: This would overwrite a source file: " + inFile + ". Use `--overwrite` to overwrite " + inFile + " and exclude it from expansion.");
            }
            else {
                console.warn("WARNING: " + inFile + " will be overwritten");
                return acc;
            }
        }
        var out = dotenv_expand_1.default(dotenv_1.default.config({ path: inFile }));
        if (!out.parsed) {
            return acc;
        }
        return __assign(__assign({}, acc), out.parsed);
    }, {});
};
var generateTemplate = function (env, templateFile) { return __awaiter(void 0, void 0, void 0, function () {
    var entries, rendered;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                entries = Object.entries(env).map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return { key: key, value: value };
                });
                return [4 /*yield*/, ejs_1.default.renderFile(path_1.default.resolve(__dirname + "/" + templateFile), {
                        entries: entries,
                    })];
            case 1:
                rendered = _a.sent();
                return [2 /*return*/, rendered];
        }
    });
}); };
var write = function (contents, location) {
    fs_1.default.mkdirSync(path_1.default.parse(location).dir, { recursive: true });
    fs_1.default.writeFileSync(location, contents);
};
var run = function (debug, format, paths, cascade, output, overwrite, serverlessYaml) { return __awaiter(void 0, void 0, void 0, function () {
    var expandedEnv, serverlessEnv, rendered;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (cascade) {
                    paths = cascadePaths(paths, cascade);
                }
                if (debug)
                    console.debug('Paths: ', paths);
                output = path_1.default.resolve(output + "/" + formats[format].out);
                expandedEnv = expandEnvironment(paths, output, overwrite);
                if (debug)
                    console.debug('Expanded Environment:', expandedEnv);
                serverlessEnv = expandServerless(serverlessYaml);
                if (debug)
                    console.debug('Expanded Serverless Environment:', serverlessEnv);
                return [4 /*yield*/, generateTemplate(__assign(__assign({}, serverlessEnv), expandedEnv), formats[format].template)];
            case 1:
                rendered = _a.sent();
                if (debug)
                    console.debug("Rendered " + output + ":\n\n```" + format + "\n" + rendered + "```\n");
                if (!debug)
                    write(rendered, output);
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var argv, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, yargs_1.default(process.argv.slice(2))
                        .usage('Usage: $0 [options]')
                        .wrap(null)
                        .describe('f', 'Output format')
                        .choices('f', Object.keys(formats))
                        .describe('d', 'Dryrun + Debug (No output file will be written)')
                        .boolean('d')
                        .default('d', false)
                        .describe('overwrite', 'Force overwrite if a source file is also a destination file. This will exclude source file from expansion as well')
                        .boolean('overwrite')
                        .default('overwrite', false)
                        .describe('e', 'Path to .env file(s), in order of precedence')
                        .default('e', '.env')
                        .string('e')
                        .array('e')
                        .describe('serverless', 'Include environment variables from serverless YAML file')
                        .boolean('serverless')
                        .default('serverless', false)
                        .describe('serverlessYaml', 'Include environment variables in the provided Serverless YAML file')
                        .string('serverlessYaml')
                        .default('serverlessYaml', 'serverless.yml')
                        .describe('o', 'Output directory for generated Typescript file')
                        .default('o', '.')
                        .describe('c', "Cascading env variables from files: \n        .env.<arg> (If not provided an <arg>, defaults to `local`)\n        .env \n        ")
                        .example('$0 -f typescript -d', "Dryrun+debug output using:\n        .env\n")
                        .example('$0 -f typescript', "Generate ./env.ts using:\n        .env\n")
                        .example('$0 -f typescript -e .env', "Generate ./env.ts using:\n        .env\n")
                        .example('$0 -f dotenv -e .env -o src', "Generate ./src/.env using:\n        .env\n")
                        .example('$0 -f typescript -e .env -c', "Generate ./env.ts using:\n        .env.local\n        .env\n")
                        .example('$0 -f typescript -e .env -c live', "Generate ./env.ts using:\n        .env.live\n        .env\n")
                        .example('$0 -f typescript -e .env -e .other/.env', "Generate ./env.ts using:\n        .env\n        .other/.env\n")
                        .example('$0 -f typescript -e .env -e .other/.env -c', "Generate ./env.ts using:\n        .env.local\n        .env\n        .other/.env.local\n        .other/.env\n")
                        .example('$0 -f typescript -e .env -e .other/.env -c live', "Generate ./env.ts using:\n        .env.live\n        .env\n        .other/.env.live\n        .other/.env\n")
                        .example('$0 -f dotenv -e .env -e .other/.env -c live -o outdir', "Generate ./outdir/.env using:\n        .env.live\n        .env\n        .other/.env.live\n        .other/.env\n")
                        .demandOption(['f', 'e', 'o']).argv];
            case 1:
                argv = _a.sent();
                return [4 /*yield*/, run(argv.d, argv.f, argv.e, argv.c, argv.o, argv.overwrite, argv.serverless ? argv.serverlessYaml || 'serverless.yml' : undefined)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                if (!(e_1 instanceof Error)) {
                    console.error(e_1);
                    process.exit(-1);
                }
                console.error(e_1.message);
                process.exit(-1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
