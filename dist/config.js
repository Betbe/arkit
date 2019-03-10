"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const logger_1 = require("./logger");
const DEFAULT_COMPONENTS = [
    {
        type: 'Component',
        patterns: ['**/*.ts', '**/*.js', '**/*.jsx', '**/*.tsx']
    },
    {
        type: 'Dependency',
        patterns: ['node_modules/*']
    }
];
class Config {
    constructor(options) {
        this.patterns = [];
        this.extensions = ['.js', '.ts', '.jsx', '.tsx'];
        this.directory = options.directory;
        const userConfigPath = path.resolve(this.directory, 'arkit');
        const userConfig = this.safeRequire(userConfigPath);
        this.components = this.array(userConfig && userConfig.components) || [];
        if (!this.components.length) {
            this.components.push(...DEFAULT_COMPONENTS);
        }
        this.outputs = this.getOutputs(options, userConfig);
        this.excludePatterns = this.getExcludePatterns(options, userConfig);
        for (const component of this.components) {
            if (component.patterns) {
                this.patterns.push(...component.patterns);
            }
        }
    }
    getOutputs(options, userConfig) {
        const generatedSchema = {};
        const userConfigOutput = userConfig && userConfig.output;
        if (options.output && options.output.length) {
            generatedSchema.path = options.output;
        }
        if (!userConfigOutput) {
            generatedSchema.groups = [
                { type: 'Dependencies', components: ['Dependency'] },
                {} // everything else
            ];
        }
        if (options.first && options.first.length) {
            generatedSchema.groups = [
                {
                    first: true,
                    patterns: options.first
                },
                ...(generatedSchema.groups || [])
            ];
        }
        if (Object.keys(generatedSchema).length || !userConfigOutput) {
            return this.array(generatedSchema);
        }
        return this.array(userConfigOutput);
    }
    getExcludePatterns(options, userConfig) {
        const excludePatterns = [];
        if (options.exclude) {
            excludePatterns.push(...options.exclude);
        }
        if (userConfig && userConfig.excludePatterns) {
            excludePatterns.push(...userConfig.excludePatterns);
        }
        for (const component of this.components) {
            if (component.excludePatterns) {
                excludePatterns.push(...component.excludePatterns);
            }
        }
        return excludePatterns;
    }
    safeRequire(path) {
        try {
            return require(path);
        }
        catch (e) {
            logger_1.trace(e.toString());
        }
    }
    array(input) {
        if (input) {
            return [].concat(input);
        }
    }
}
exports.Config = Config;
