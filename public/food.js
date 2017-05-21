function Food(){
    var x = floor(width/rectSize);
    var y = floor(height/rectSize);
    this.pos = {
    	x: floor(random(x))*rectSize,
    	y: floor(random(y))*rectSize
    }
    this.index;
    this.eaten = false;
    this.updated = true;

    this.show = function(){
        stroke(0);
        fill(180,0,255);
        rect(this.pos.x, this.pos.y, rectSize, rectSize);
    }
}