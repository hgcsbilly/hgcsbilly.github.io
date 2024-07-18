// Función para calcular la EMA
function ema(source, length) {
    let alpha = 2 / (length + 1);
    let ema = source * alpha;
    for (let i = 1; i < length; i++) {
        ema += (1 - alpha) * ema[i - 1];
    }
    return ema;
}

// Función para detectar cruces por encima
function crossover(source1, source2) {
    return source1 > source2 && source1[1] <= source2[1];
}

// Función para detectar cruces por debajo
function crossunder(source1, source2) {
    return source1 < source2 && source1[1] >= source2[1];
}

// Definición de entradas: Largos de EMA y Fuente
let ema_01_len = 80;
let ema_02_len = 240;
let ema_src = document.getElementById("symbol").value;

// Cálculo de los valores EMA
let ema_01 = ema(ema_src, ema_01_len);
let ema_02 = ema(ema_src, ema_02_len);

// Graficar EMAs en el gráfico
function plot(ema, title, color, linewidth) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(0, ema);
    ctx.lineTo(canvas.width, ema);
    ctx.strokeStyle = color;
    ctx.lineWidth = linewidth;
    ctx.stroke();
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText(title, 10, ema + 10);
}

plot(ema_01, "ema_01", "#00FF00", 1);
plot(ema_02, "ema_02", "#ff0040", 1);

// Detección de cruces EMA 1 y EMA 2
let cross_01_up = crossover(ema_01, ema_02);
let cross_01_down = crossunder(ema_01, ema_02);

// Si hay cruce, graficar cruce en el nivel EMA
function plotCross(cross, title, linewidth, color) {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(0, ema_02);
    ctx.lineTo(canvas.width, ema_02);
    ctx.strokeStyle = color;
    ctx.lineWidth = linewidth;
    ctx.stroke();
    ctx.font = "16px Arial";
    ctx.fillStyle = color;
    ctx.fillText(title, 10, ema_02 + 10);
}

if (cross_01_up || cross_01_down) {
    plotCross(ema_02, "cross 02", 3, cross_01_up ? "#00FF00" : "#ff0040");
}