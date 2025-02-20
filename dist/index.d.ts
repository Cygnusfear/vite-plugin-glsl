/**
 * @module vite-plugin-glsl
 * @description Import shader file chunks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @version 0.1.2
 * @license MIT
 */
import type { FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from 'vite';
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
export default function (exclude?: FilterPattern, include?: FilterPattern, defaultExtension?: string): Plugin;
