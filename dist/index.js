"use strict";
/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.1.2
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pluginutils_1 = require("@rollup/pluginutils");
const vite_1 = require("vite");
const loadShaders_1 = tslib_1.__importDefault(require("./loadShaders"));
/**
 * @const
 * @default
 * @type {string}
 */
const DEFAULT_EXTENSION = 'glsl';
/**
 * @const
 * @default
 * @type {readonly RegExp[]}
 */
const DEFAULT_SHADERS = Object.freeze([
    '**/*.glsl', '**/*.wgsl',
    '**/*.vert', '**/*.frag',
    '**/*.vs', '**/*.fs', '**/*.shader.js'
]);
const MERGED_SHADER = Object.freeze([
    '**/*.shader.js'
]);
/**
 * @function
 * @name glsl
 *
 * @param {FilterPattern} exclude RegExp | RegExp[] of file paths/extentions to ignore
 * @param {FilterPattern} include RegExp | RegExp[] of file paths/extentions to import
 * @param {string} defaultExtension Shader import suffix when no extension is specified
 *
 * @default
 *   exclude = undefined
 *   include = /\.(glsl|wgsl|vert|frag|vs|fs)$/i
 *   defaultExtension = 'glsl'
 *
 * @returns {Plugin}
 */
function default_1(exclude, include = DEFAULT_SHADERS, defaultExtension = DEFAULT_EXTENSION) {
    let config;
    const filter = (0, pluginutils_1.createFilter)(include, exclude);
    const mergedShader = (0, pluginutils_1.createFilter)(MERGED_SHADER, exclude);
    const production = process.env.NODE_ENV === 'production';
    return {
        enforce: 'pre',
        name: 'vite-plugin-glsl',
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        transform(source, shader) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (filter(shader)) {
                    return yield (0, vite_1.transformWithEsbuild)((0, loadShaders_1.default)(source, shader, defaultExtension), shader, {
                        sourcemap: config.build.sourcemap && 'external',
                        minifyWhitespace: production,
                        loader: mergedShader(shader) ? undefined : 'text',
                        format: 'esm'
                    });
                }
            });
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map