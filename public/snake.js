// No se pueden pasar vectores p5 por sockets, hay que hacerlo de esta manera.

function Snake(){
    this.pos = {
        x: floor(random(width, 2*width)),
        y: floor(random(height, 2*height))
    }

    this.vel = {
        x: 0,
        y: 0
    }

    this.tail = [];
    this.total = 0;
    this.alive = true;
    this.id;
    this.headColor = [81,81,81];
    this.color = [81,81,81];


    // tail system is based on Daniel Shiffman's snake game code.
    // Actualiza las posiciones de la cola cada frame. Ademas revisa si la serpiente murio con la funcion this.death;
    this.update = function(){
        if(this.tail.length == this.total){
            for(var i = 0; i < this.tail.length - 1; i++){
                this.tail[i] = this.tail[i+1];
            }
        }

        if(this.total > 0) {
            var vector = {
                x: this.pos.x,
                y: this.pos.y
            }
            this.tail[this.total-1] = vector;
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        
        this.death();

        if(!this.alive) socket.emit('death');

        this.pos.x = constrain(this.pos.x, 0, width-rectSize);
        this.pos.y = constrain(this.pos.y, 0, height-rectSize);
    }

    // Dibujamos la serpiente.
    this.show = function(){
        stroke(0);
        fill(this.color);
        for(var i = 0; i < this.tail.length; i++){
            rect(this.tail[i].x, this.tail[i].y, rectSize, rectSize);
        }
        fill(this.headColor);
        rect(this.pos.x, this.pos.y, rectSize, rectSize);
    }

    // Revisamos si alguna comida fue comida.
    this.eat = function(){
        for (var i = 0; i < foods.length; i++){
            if(this.pos.x == foods[i].pos.x && this.pos.y == foods[i].pos.y){
                this.total++;
                foods[i].eaten = true;
                score.html("Score: " + (this.total+1));
                break;
            }
        }
    }

    // Revisamos si estamos en alguna posicion donde la serpiente moriria.
    this.death = function(){
        if((this.pos.x >= width || this.pos.x < 0 || this.pos.y >= height || this.pos.y < 0) && start) {
            this.alive = false;
            return;
        }

        for (var i = 0; i < this.tail.length; i++){
            if(this.pos.x == this.tail[i].x && this.pos.y == this.tail[i].y){
                this.alive = false;
                return;
            }
        }

        for(var i = 0; i < snakes.length; i++){
            if(snakes[i].id != socket.id){
                if(this.pos.x == snakes[i].pos.x && this.pos.y == snakes[i].pos.y && start){
                    this.alive = false;
                    return;
                }
                for(var j = 0; j < snakes[i].tail.length; j++){
                    if(this.pos.x == snakes[i].tail[j].x && this.pos.y == snakes[i].tail[j].y){
                       this.alive = false;
                       return;
                    }
                }
            }
        }
    }
}