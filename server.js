// Socket and server settings.
var express = require('express');
var socket = require('socket.io');

var app = express();

var server = app.listen(3000);
var io = socket(server);

app.use(express.static('public'));

console.log("Server on");


// Snake stuff
var sendingData = [];
var snakes = [];
var foods = [];
var counter = 0;

io.sockets.on('connection', newConnection);
setInterval(heartbeat, 100);

// Funcion que actualiza la informacion de las serpientes y la comida en todos los clientes.
function heartbeat() {
    sendingData[0] = snakes;
    sendingData[1] = foods;
    io.sockets.emit('heartbeat', sendingData);
}


function newConnection(socket){
    console.log("new connection " + socket.id);

    socket.on('start', function(data){
        snakes.push(data[0]);

        if(counter < 0){
            counter = 0;
        }
        if(counter > 5){
            counter = 5;
        }

        var snakeData = [];
        snakeData[1] = data[0].id;

        if(foods.length == 0){
            foods = data[1];
        }

        snakeData[0] = assignColor(data[0].color);

        if(snakeData[0] == 10){
            snakeData[0] = counter;
        }

        io.sockets.emit('color', snakeData);
    });



    socket.on('update', function(data){
        // Si esta viva, actualizamos su posicion y status en el arreglo de las serpientes.
        if(data[0].alive){
            for (var i = 0; i < snakes.length; i++) {
                if (data[0].id == snakes[i].id) {
                    snakes[i] = data[0];
                    break;
                }
            }
        }

        // Si la comida no esta updateada, la updateamos.
        if(!data[1].updated){
            foods[data[1].index] = data[1];
            foods[data[1].index].updated = true;
        }
    });


    socket.on('death', function(){
        removeElement(socket.id);
    });


    socket.on('disconnect', function() {
        counter--;
        removeElement(socket.id);
        console.log("Client has disconnected");
    });
}

// Quitamos la serpiente del arreglo de serpientes.
function removeElement(id){
    for(var i = 0; i < snakes.length; i++){
        if(snakes[i].id == id){
            snakes.splice(i,1);
            break;
        }
    }
}


// Busca su antiguo color y retorna el numero que definira su color en client.js.
function assignColor(data){
    var red = [255,0,0];
    var blue = [0,0,255];
    var green = [0,255,0];
    var yellow = [255,255,0];
    var white = [255,255,255];
    var gray = [81,81,81];
    var isRed = false;
    var isBlue = false;
    var isGreen = false;
    var isYellow = false;
    var isWhite = false;
    var isGray = false;

    isRed = compareArray(red, data);
    isBlue = compareArray(blue, data);
    isGreen = compareArray(green, data);
    isYellow = compareArray(yellow, data);
    isWhite = compareArray(white, data);
    isGray = compareArray(gray, data);

    if(isRed) return 1;
    if(isBlue) return 2;
    if(isGreen) return 3;
    if(isYellow) return 4;
    if(isWhite) return 5;
    if(isGray) {
        counter++;
        return 10;
    }
}

function compareArray(arrA, arrB){
    for(var i = 0; i < arrA.length; i++){
        if(arrA[i] != arrB[i]){
            return false;
        }
    }
    return true;
}