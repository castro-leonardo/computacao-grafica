const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VÉRTICES
// --------------------------------------------------


const quant = 100;

function criarCirculo(centroX, centroY, raio){
    const pontos = [];

    pontos.push(centroX, centroY);

    for (let i = 0; i <= quant; i++){
        const ang = 2 * Math.PI * i / quant;

        const x = centroX + Math.cos(ang) * raio;
        const y = centroY + Math.sin(ang) * raio;

        pontos.push(x,y);
    }
    return new Float32Array(pontos);
}


function desenharCirculo(vertices, cor) {

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform4f(
        colorLocation,
        cor[0],
        cor[1],
        cor[2],
        cor[3]
    );

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        quant + 2
    );
}

// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 uColor;

out vec4 outColor;

void main() {
    outColor = uColor;
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// 7. LOCAL DO ATRIBUTO
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );
const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

// --------------------------------------------------
// 9. LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


const centro = criarCirculo(0, 0.4, 0.2);
const petala1 = criarCirculo(0.2, 0.4, 0.2);
const petala2 = criarCirculo(-0.2, 0.4, 0.2);
const petala3 = criarCirculo(0, 0.6, 0.2);
const petala4 = criarCirculo(0, 0.2, 0.2);
const caule = criarCirculo(-0.1, -0.2, 0.5);
const offcaule = criarCirculo(-0.2, -0.2, 0.5);

gl.useProgram(program);


desenharCirculo(caule, [0.0, 1.0, 0.0, 1.0]);
desenharCirculo(offcaule, [0.1, 0.1, 0.1, 1.0]);
desenharCirculo(petala1, [1.0, 0.0, 0.3, 0.6]);
desenharCirculo(petala2, [1.0, 0.0, 0.3, 0.6]);
desenharCirculo(petala3, [1.0, 0.0, 0.3, 0.6]);
desenharCirculo(petala4, [1.0, 0.0, 0.3, 0.6]);
desenharCirculo(centro, [1.0, 1.0, 0.0, 1.0]);