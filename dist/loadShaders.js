"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
/**
 * @function
 * @name removeSourceComments
 * @description Removes comments from shader source
 * code in order to avoid including commented chunks
 *
 * @param {string} source Shader's source code
 *
 * @returns {string} Shader's source code without comments
 */
function removeSourceComments(source) {
    if (source.includes('/*') && source.includes('*/')) {
        source.slice(0, source.indexOf('/*')) +
            source.slice(source.indexOf('*/') + 2, source.length);
    }
    const lines = source.split('\n');
    for (let l = lines.length; l--;)
        if (lines[l].includes('//'))
            lines[l] = lines[l].slice(0, lines[l].indexOf('//'));
    return lines.join('\n');
}
/**
 * @function
 * @name loadChunk
 *
 * @param {string} source Shader's source code
 * @param {string} directory Shader's directory name
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader's source code without external chunks
 */
function loadChunk(source, directory, extension) {
    const include = /#include(\s+([^\s<>]+));?/gi;
    source = removeSourceComments(source);
    if (include.test(source)) {
        const currentDirectory = directory;
        source = source.replace(include, (_, chunkPath) => {
            chunkPath = chunkPath.trim().replace(/^(?:"|')?|(?:"|')?;?$/gi, '');
            const directoryIndex = chunkPath.lastIndexOf('/');
            directory = currentDirectory;
            if (directoryIndex !== -1) {
                directory = path_1.default.resolve(directory, chunkPath.slice(0, directoryIndex + 1));
                chunkPath = chunkPath.slice(directoryIndex + 1, chunkPath.length);
            }
            let shader = path_1.default.resolve(directory, chunkPath);
            if (!path_1.default.extname(shader)) {
                shader = `${shader}.${extension}`;
            }
            return loadChunk((0, fs_1.readFileSync)(shader, 'utf8'), path_1.default.dirname(shader), extension);
        });
    }
    return source.trim().replace(/(\r\n|\r|\n){3,}/g, '$1\n');
}
/**
 * @function
 * @name loadShaders
 *
 * @param {string} source Shader's source code
 * @param {string} shader Shader's absolute path
 * @param {string} extension Default shader extension
 *
 * @returns {string} Shader file with included chunks
 */
function default_1(source, shader, extension) {
    return loadChunk(source, path_1.default.dirname(shader), extension);
}
exports.default = default_1;
//# sourceMappingURL=loadShaders.js.map