const NetworkObject = require("./class-networkobject.js").NetworkObject;

exports.Pawn = class Pawn extends NetworkObject{
    constructor(){
        super();
        this.classID = "PAWN";

        this.velocity = {x:0,y:0,z:0};
        this.aabb.updateBounds(this.position.x, this.position.y, this.scale.x, this.scale.y);
        this.position.x = this.getRandomInt(10);
        this.position.y = this.getRandomInt(10);
        this.input = {};
    }
    accelerate(vel, acc, dt){
        if(acc != 0)
        {
            vel += acc * dt * (1/this.scale.x); // optionally multiply by a scalar;
        }
        else
        {
            if(vel > 0)
            {
                acc = -2;
                vel += acc * dt * this.scale.x; // optionally multiply by a scalar;
                if(vel < 0) vel = 0;
            }
            if(vel < 0)
            {
                acc = 2;
                vel += acc * dt * this.scale.x; // optionally multiply by a scalar;
                if(vel > 0) vel = 0;
            }
        }
        return vel ? vel : 0;
    }
    getRandomInt(max){
        return Math.floor(Math.random() * Math.floor(max));
    }
    update(game){
        let moveX = this.input.axisH|0; // -1 , 0, or 1
        let moveY = this.input.axisV|0;
        this.velocity.x = this.accelerate(this.velocity.x, moveX, game.dt);
        this.velocity.y = this.accelerate(this.velocity.y, moveY, game.dt);
        this.position.x += this.velocity.x * game.dt;
        this.position.y += this.velocity.y * game.dt;
        this.aabb.updateBounds(this.position.x, this.position.y, this.scale.x, this.scale.y);
    }
    checkOverlap(other){
        return super.checkOverlap(other);
    }
    serialize(){
        let b = super.serialize();

        return b;
    }
    deserialize(){
        // TODO: turn object into a byte array
    }
}