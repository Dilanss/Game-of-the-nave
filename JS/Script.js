game = {
    canvas: null,
    ctx: null,
    imagen: null,
    caratula: true,
    imagenEnemigo: null,
    teclaPulsada: null,
    tecla: [],
    colorBala: "red",
    colorBala2: "white",
    balas_array: new Array(),
    balasEnemigas_array: new Array(),
    enemigos_array: new Array(),
    disparo: false,
    puntos: 0,
    finJuego: false,
    boing: null,
    disparoJugador: null,
    intro: null,
    fin: null,
}

/*************  
Constantes 
*************/
const KEY_ENTER = 13;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const BARRA = 32;

/*******
Objetos
********/
function Bala(x, y, w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.dibujar = function () {
        game.ctx.save();
        game.ctx.fillStyle = game.colorBala;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);
        this.y = this.y -4;
        game.ctx.restore();
    };

    this.disparar = function () {
        game.ctx.save();
        game.ctx.fillStyle = game.colorBala2;
        game.ctx.fillRect(this.x, this.y, this.w, this.w);
        this.y = this.y + 6;
        game.ctx.restore();
    }
}

function Jugador(x) {
    this.x = x;
    this.y = 450;
    this.w = 30;
    this.h = 15;
    this.dibujar = function (x) {
        this.x = x;
        game.ctx.drawImage(game.imagen, this.x, this.y, this.w, this.h);
    };
}

function Enemigo(x, y){
    this.x = x;
    this.y = y;
    this.w = 35;
    this.veces = 0;
    this.dx = 5;
    this.ciclos = 0;
    this.num = 14;
    this.figura = true;
    this.vive = true;
    this.dibujar = function () {

        //Retraso
        if(this.ciclos > 30){
            //Saltitos
            if(this.veces > this.num){
                this.dx *= -1;
                this.veces = 0;
                this.num = 28;
                this.y += 20;
                this.dx = (this.dx > 0 )? this.dx++:this.dx--;
            }else {
                this.x += this.dx;
            }

            this.veces++;
            this.ciclos = 0;
            this.figura = !this.figura;

        }else {
            this.ciclos++;
        }

        if(this.figura) {
            game.ctx.drawImage(game.imagenEnemigo, 0, 0, 40, 30, this.x, this.y, 35, 30);
        }else {
            game.ctx.drawImage(game.imagenEnemigo, 50, 0, 35, 30, this.x, this.y, 35, 30);
        }

    };
}

/*******
Funciones  
******/
const caratula = () => {
    let imagen = new Image();
    imagen.src = "./IMG/cara.webp";
    imagen.onload = () => {
        game.ctx.drawImage(imagen, 0, 0);
    }
}

const seleccionar = (e) => {
    if(game.caratula) {
        inicio();
    }
}

const inicio = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.caratula = false;
    game.jugador = new Jugador(0);
    game.x = game.canvas.width / 2;
    game.jugador.dibujar(game.x);
    animar();
}

var x = 100, y = 100;

const animar = () => {
    if(game.finJuego == false){
        requestAnimationFrame(animar);
        verificar();
        pintar();
        colisiones();
    }   
}

const colisiones = () => {
    let enemigo , bala;

    for(var i = 0; i < game.enemigos_array.length; i++){
        for(var j = 0; j < game.balas_array.length; j++) {
            enemigo = game.enemigos_array[i];
            bala = game.balas_array[j];

            if(enemigo != null && bala != null) {
                if((bala.x > enemigo.x) && 
                (bala.x < enemigo.x + enemigo.w) &&
                (bala.y > enemigo.y) && 
                (bala.y < enemigo.y + enemigo.w)){
                    enemigo.vive = false;
                    game.enemigos_array[i] = null;
                    game.balas_array[j] = null;
                    game.disparo = false;
                    game.puntos += 10;
                    game.boing.play();
                }
            }
        }
    }

    //Colision de las balas enemigas
    for(var j = 0; j < game.balasEnemigas_array.length; j++){
        bala = game.balasEnemigas_array[j];

        if(bala != null ){
            if((bala.x > game.jugador.x) && 
                (bala.x < game.jugador.x + game.jugador.w) &&
                (bala.y > game.jugador.y) &&
                (bala.y < game.jugador.y + game.jugador.h)){
                    gameOver();
            }
        }
    }
}

const gameOver = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    game.balas_array = [];
    game.enemigos_array = [];
    game.balasEnemigas_array = [];
    game.finJuego = true;
    game.fin.play();
    mensaje("Game   Over", 100, 60);
    mensaje("WIN " + game.puntos + " points", 220);

    if(game.puntos > 100 || game.puntos <= 200){
        mensaje("you almost did it", 340);
    }else if(game.puntos > 200){
        mensaje("Congratulations", 340);
    }else{
        mensaje("Sorry", 340);
    }
}

const mensaje = (cadena, y, tamano = 40) => {
    let medio = game.canvas.width / 2;
    game.ctx.save();
    game.ctx.fillStyle = "yellow";  
    game.ctx.strokeStyle = "blue"; 
    game.ctx.textBaseline = "top";
    game.ctx.font = "bold " + tamano + "px Courier";
    game.ctx.textAlign = "center";
    game.ctx.fillText(cadena, medio, y);  
    game.ctx.restore();
}

const verificar = () => {
    if(game.tecla[KEY_RIGHT]) game.x += 10;
    if(game.tecla[KEY_LEFT])  game.x -= 10;

    //Verificacion de caños a los lados
    if(game.x > game.canvas.width -10) game.x = game.canvas.width - 10;
    if(game.x < 0) game.x = 10;

    //Disparo
    if(game.tecla[BARRA]){
        if(game.disparo == false){
            game.balas_array.push(new Bala(game.jugador.x + 12, game.jugador.y - 3, 5));
            game.tecla[BARRA] = false;
            game.disparo = true;
            game.disparoJugador.play();
        }
    }

    //Disparar enemigo
    if(Math.random() > 0.96) {
        dispararEnemigo();
    }
}

const dispararEnemigo = () => {
    var ultimos = new Array();

    for(var i = game.enemigos_array.length -1; i > 0; i--){
        if(game.enemigos_array[i] != null){
            ultimos.push(i);
        }

        if(ultimos.length == 10) break;
    }

    d = ultimos[Math.floor(Math.random() * 10)];

    game.balasEnemigas_array.push(new Bala(game.enemigos_array[d].x + game.enemigos_array[d].w / 2, game.enemigos_array[d].y, 5));
}

const pintar = () => {
    game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    score();

    game.jugador.dibujar(game.x);

    //Mover las balas
    for(var i = 0 ; i < game.balas_array.length ; i++){
        if(game.balas_array[i] != null) {
            game.balas_array[i].dibujar();

            if(game.balas_array[i].y < 0 ){
                game.disparo = false;
                game.balas_array[i] = null;
            } 
        }
    }

    //balas enemgias
    for(var i = 0; i < game.balasEnemigas_array.length; i++){
        if(game.balasEnemigas_array[i] != null) {
            game.balasEnemigas_array[i].disparar();
            if(game.balasEnemigas_array[i].y > game.canvas.height)
                game.balasEnemigas_array[i] = null;
        }
    }

    //Enemigos
    for(i = 0 ; i < game.enemigos_array.length ; i++){
        if(game.enemigos_array[i] != null) {
            game.enemigos_array[i].dibujar();
        }
    }
}

const score = () => {
    game.ctx.save();
    game.ctx.fillStyle = "white";
    game.ctx.font = "bold 20px Courier";
    game.ctx.fillText("SCORE: " + game.puntos, 10, 20);
    game.ctx.restore();
}

//Funcion para las teclas
document.addEventListener("keydown", function(e) {
    game.teclaPulsada = e.keyCode;
    game.tecla[e.keyCode] = true;
});

document.addEventListener("keyup", function(e) {
    game.tecla[e.keyCode] = false;
});

window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webKitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 17); }
})();

window.onload = function() {
    game.canvas = document.getElementById('canvas');

    if (game.canvas && game.canvas.getContext) {
        game.ctx = game.canvas.getContext("2d");

        if (game.ctx) {

            //Sonidos del juego
            game.boing = document.getElementById("boing");
            game.disparoJugador = document.getElementById("disparo");
            game.intro = document.getElementById("intro");
            game.fin = document.getElementById("fin");

            //Imagen del juego
            game.imagen = new Image();
            game.imagen.src = "./IMG/torre.fw.png";

            //CREACION DE ENEMIGOS  
            game.imagenEnemigo = new Image()
            game.imagenEnemigo.src = "./IMG/invader.fw.png";
            game.imagenEnemigo.onload = function() {
                for(var i = 0 ; i < 5 ; i++) {
                    for(var j = 0 ; j < 10 ; j++) {
                        game.enemigos_array.push(new Enemigo(100 + 40 * j, 30 + 45 * i));
                    }   
                }
            }

            caratula();

            game.canvas.addEventListener("click", seleccionar, false);

        } else {
            alert("No se soporta la etiqueta canvas");
        }
    }
}
