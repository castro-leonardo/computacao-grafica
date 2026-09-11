const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// CONSTANTES DO JOGO
// --------------------------------------------------

const RAIO_BOLA = 0.05;
const METADE_ALTURA_BARRA = 0.2;
const METADE_LARGURA_BARRA = 0.05;
const X_BARRA_ESQUERDA = -0.9;
const X_BARRA_DIREITA = 0.9;
const LIMITE_VERTICAL = 1.0;
const VELOCIDADE_BARRA = 0.025;

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(X_BARRA_ESQUERDA, 0.0);

let MbarraDireita = m3.translation(X_BARRA_DIREITA, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
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
// CRIAR PROGRAMA
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
// LOCAL DOS ATRIBUTOS E DO UNIFORM
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

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
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

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
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

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
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

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let tyBarraEsquerda = 0.0;
let tyBarraDireita = 0.0;

let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.012;
let tyBola_offset = 0.008;

let placarEsquerda = 0;
let placarDireita = 0;

// --------------------------------------------------
// CONTROLES (TECLADO)
// --------------------------------------------------
// Esquerda: W (sobe) / S (desce)
// Direita: seta para cima (sobe) / seta para baixo (desce)

const teclas = {};

window.addEventListener("keydown", (e) => {
    teclas[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
});

function moverBarras(){

    // Barra esquerda
    if (teclas["w"] || teclas["W"]) {
        tyBarraEsquerda += VELOCIDADE_BARRA;
    }
    if (teclas["s"] || teclas["S"]) {
        tyBarraEsquerda -= VELOCIDADE_BARRA;
    }

    // Barra direita
    if (teclas["ArrowUp"]) {
        tyBarraDireita += VELOCIDADE_BARRA;
    }
    if (teclas["ArrowDown"]) {
        tyBarraDireita -= VELOCIDADE_BARRA;
    }

    // Limita as barras para não saírem da tela
    const limite = LIMITE_VERTICAL - METADE_ALTURA_BARRA;
    tyBarraEsquerda = Math.max(-limite, Math.min(limite, tyBarraEsquerda));
    tyBarraDireita = Math.max(-limite, Math.min(limite, tyBarraDireita));

    MbarraEsquerda = m3.translation(X_BARRA_ESQUERDA, tyBarraEsquerda);
    MbarraDireita = m3.translation(X_BARRA_DIREITA, tyBarraDireita);
}

function resetBola(direcao){
    txBola = 0.0;
    tyBola = 0.0;
    txBola_offset = 0.012 * direcao;
    tyBola_offset = (Math.random() * 0.012) - 0.006;
}

function atualizaPlacar(){
    const elEsquerda = document.getElementById("placarEsquerda");
    const elDireita = document.getElementById("placarDireita");
    if (elEsquerda) elEsquerda.textContent = placarEsquerda;
    if (elDireita) elDireita.textContent = placarDireita;
}

function atualizaAnimacao(){

    moverBarras();

    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // Colisão com o topo e a base da tela
    const limiteTopoBase = LIMITE_VERTICAL - RAIO_BOLA;
    if (tyBola > limiteTopoBase){
        tyBola = limiteTopoBase;
        tyBola_offset = -tyBola_offset;
    }
    if (tyBola < -limiteTopoBase){
        tyBola = -limiteTopoBase;
        tyBola_offset = -tyBola_offset;
    }

    // Colisão com a barra esquerda
    const bordaDireitaBarraEsquerda = X_BARRA_ESQUERDA + METADE_LARGURA_BARRA;
    if (
        txBola_offset < 0 &&
        txBola - RAIO_BOLA <= bordaDireitaBarraEsquerda &&
        txBola - RAIO_BOLA >= X_BARRA_ESQUERDA - METADE_LARGURA_BARRA &&
        tyBola >= tyBarraEsquerda - METADE_ALTURA_BARRA - RAIO_BOLA &&
        tyBola <= tyBarraEsquerda + METADE_ALTURA_BARRA + RAIO_BOLA
    ){
        txBola = bordaDireitaBarraEsquerda + RAIO_BOLA;
        txBola_offset = -txBola_offset * 1.05; // acelera um pouco a cada rebatida
    }

    // Colisão com a barra direita
    const bordaEsquerdaBarraDireita = X_BARRA_DIREITA - METADE_LARGURA_BARRA;
    if (
        txBola_offset > 0 &&
        txBola + RAIO_BOLA >= bordaEsquerdaBarraDireita &&
        txBola + RAIO_BOLA <= X_BARRA_DIREITA + METADE_LARGURA_BARRA &&
        tyBola >= tyBarraDireita - METADE_ALTURA_BARRA - RAIO_BOLA &&
        tyBola <= tyBarraDireita + METADE_ALTURA_BARRA + RAIO_BOLA
    ){
        txBola = bordaEsquerdaBarraDireita - RAIO_BOLA;
        txBola_offset = -txBola_offset * 1.05;
    }

    // Ponto: bola passou da barra esquerda (ponto para a direita)
    if (txBola < X_BARRA_ESQUERDA - METADE_LARGURA_BARRA - RAIO_BOLA){
        placarDireita++;
        atualizaPlacar();
        resetBola(1);
    }

    // Ponto: bola passou da barra direita (ponto para a esquerda)
    if (txBola > X_BARRA_DIREITA + METADE_LARGURA_BARRA + RAIO_BOLA){
        placarEsquerda++;
        atualizaPlacar();
        resetBola(-1);
    }

    MbolaCentro = m3.translation(txBola,tyBola);
}


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();