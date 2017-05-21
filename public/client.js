// Problemas futuros: Numero de espacios disponibles menor a cantidad de comida.
// Choque recto entre dos serpientes, ¿quien muere?
// Cambiar sistema de keyLocked.

var socket;
var start = false;
var keyLocked = false;

var rectSize = 8;
var snakeVel = rectSize;
var snake;

var score;
var deathMessage;
var colorMessage;
var startButton;

var sendingData = [];
var snakes = [];
var foods = [];
var foodQuantity = 50;
var frames = 10;

function setup(){
    createCanvas(720,720);
    frameRate(frames);

    socket = io.connect('http://localhost:3000');

    // Creamos la poblaacion de comida, si somos la primera serpiente en el servidor esta sera la comida con la que empezara el juego total.
    for(var i = 0; i < foodQuantity; i++){
        foods[i] = new Food();
        foods[i].index = i;
        if(!checkCorners(foods[i])){
            i--;
        }
    }

    snake = new Snake();

    background(81);
    startButton = createButton('Respawn');
    startButton.mousePressed(respawn);
    score = createP("Score: 0");
    colorMessage = createP("");
    deathMessage = createP("");

    // Cuando recibo color ya tengo el id disponible, no hay problema.
    socket.on('color', function(data){
        if(data[1] == snake.id){
            snakeStartup(data[0]);

            socket.on('heartbeat', function (data){
                snakes = data[0];

                // Si recibimos una comida nula, es decir, cuando recien comienza el server, no la asignemos al arreglo de comida.
                if(data[1].length != 0){
                    foods = data[1];
                }
            });

            start = true;
        }
    });
}


function draw(){
    background(81);
    // No empezamos hasta que tengamos nuestro socket id.
    if(socket.id && !start){
        startGame();
    }

    if(start){
        if(snake.alive){
            snake.eat();
            snake.update();
            //keyLocked = false;
        }
        else{
            deathMessage.html("Perdiste.");
        }
    }
    drawFood();
    drawSnakes();
}

function keyPressed(){
    // KeyLocked implementado para evitar bug de devolverse y meterse en su propio cuerpo.
    if(!keyLocked){
        if(keyCode == UP_ARROW && snake.vel.y != snakeVel){
            snake.vel.x = 0;
            snake.vel.y = -snakeVel;
        }
        else if(keyCode == DOWN_ARROW && snake.vel.y != -snakeVel){
            snake.vel.x = 0;
            snake.vel.y = snakeVel;
        }
        else if(keyCode == LEFT_ARROW && snake.vel.x != snakeVel){
            snake.vel.x = -snakeVel;
            snake.vel.y = 0;
        }
        else if(keyCode == RIGHT_ARROW && snake.vel.x != -snakeVel){
            snake.vel.x = snakeVel;
            snake.vel.y = 0;
        }
        //keyLocked = true;
        return false;
    }
}


// Enviamos la data de la comida actualizada y la posicion de nuestra serpiente.
function sendData(){
    var tempData;
    var index;
    sendingData[0] = snake;
    // Valor de foods estandar.
    tempData = new Food();

    sendingData[1] = tempData;
    
    // Revisamos si alguna comida fue comida, de ser asi la actualizamos.
    for(var i = 0; i < foods.length; i++){
        if(foods[i].eaten){
            while(!checkFood(tempData)){
                tempData = new Food();
            }
            // Asignamos la data de la comida.
            sendingData[1] = tempData;
            sendingData[1].index = i;
            sendingData[1].updated = false;
            break;
        }
    }

    socket.emit('update', sendingData);
}

// Dibujamos las demas serpientes.
function drawSnakes(){
    for(var i = 0; i < snakes.length; i++){
        var snakeTemp = new Snake();
        snakeTemp.pos.x = snakes[i].pos.x;
        snakeTemp.pos.y = snakes[i].pos.y;
        snakeTemp.tail = snakes[i].tail;
        snakeTemp.headColor = snakes[i].headColor;
        snakeTemp.color = snakes[i].color;
        snakeTemp.show();
    }
}

// Dibujamos toda la comida.
function drawFood(){
    for(var i = 0; i < foods.length; i++){
        var foodTemp = new Food();
        foodTemp.pos.x = foods[i].pos.x;
        foodTemp.pos.y = foods[i].pos.y;
        foodTemp.show();
    }
}

// Para crear la serpiente una vez que tengamos el socket.id (arreglamos problema de empezar el juego sin socket id)
function startGame(){
    snake.id = socket.id;
    var startData = [];
    startData[0] = snake;
    startData[1] = foods;
    socket.emit('start', startData);
    setInterval(sendData, 1000/frames);
}

// Para que la comida no salga encima de las serpientes ni en las esquinas.
function checkFood(tempData){
    if(!checkCorners(tempData)){
        return false;
    }
    for(var j = 0; j < snakes.length; j++){
        if(tempData.pos.x == snakes[j].pos.x && tempData.pos.y == snakes[j].pos.y){
            return false;
        }
        for(var k = 0; k < snakes[j].tail.length; k++){
            if(tempData.pos.x == snakes[j].tail[k].x && tempData.pos.y == snakes[j].tail[k].y){
                return false;
            }
        }
    }
    return true;
}


// Para que la comida no salga en esquinas
function checkCorners(tempFood){
    if(tempFood.pos.x == 0 && tempFood.pos.y == 0){
        return false;
    }
    else if(tempFood.pos.x == width-rectSize && tempFood.pos.y == 0){
        return false;
    }
    else if(tempFood.pos.x == width-rectSize && tempFood.pos.y == height-rectSize){
        return false;
    }
    else if(tempFood.pos.x == 0 && tempFood.pos.y == height-rectSize){
        return false;
    }
    else{
        return true;
    }
}

function snakeStartup(data){
    if (data == 1){
        snake.headColor = [255,0,0];
        snake.color = [255,0,0];
        snake.pos.x = 0;
        snake.pos.y = 0;
        colorMessage.html("Tu color es rojo");
    }
    else if (data == 2){
        snake.headColor = [0,0,255];
        snake.color = [0,0,255];
        snake.pos.x = width-rectSize;
        snake.pos.y = 0;
        colorMessage.html("Tu color es azul");
    }
    else if (data == 3){
        snake.headColor = [0,255,0];
        snake.color = [0,255,0];
        snake.pos.x = width-rectSize;
        snake.pos.y = height-rectSize;
        colorMessage.html("Tu color es verde");
    }
    else if (data == 4){
        snake.headColor = [255,255,0];
        snake.color = [255,255,0];
        snake.pos.x = 0;
        snake.pos.y = height-rectSize;
        colorMessage.html("Tu color es amarillo");
    }
    else{
        snake.headColor = [255,255,255];
        snake.color = [255,255,255];
        snake.pos.x = width/2;
        snake.pos.y = height/2;
        colorMessage.html("Tu color es blanco");
    }
}

function respawn(){
    var tempColor = snake.color;
    snake = new Snake();
    snake.color = tempColor;
    score.html("Score: 0");
    colorMessage.html("");
    deathMessage.html("");
    start = false;
}