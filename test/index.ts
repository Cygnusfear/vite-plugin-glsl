/// <reference types="./shaders" />
import {fragment, vertex} from './glsl/fabricCloud.shader.js';

const app = document.getElementById('app');

app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';
app.textContent = `${fragment} ${vertex}`;
