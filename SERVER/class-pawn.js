const NetworkObject = require("./class-networkobject.js").NetworkObject;

exports.Pawn = class Pawn extends NetworkObject{
    constructor(){
        super();
        this.classID = "PAWN";

        this.velocity = {x:0,y:0,z:0};

        this.input = {};
    }
    accelerate(vel, acc, dt){
        if(acc != 0)
        {
            vel += acc * dt; // optionally multiply by a scalar;
        }
        else
        {
            if(vel > 0)
            {
                acc = -1;
                vel += acc * dt; // optionally multiply by a scalar;
                if(vel < 0) vel = 0;
            }
            if(vel < 0)
            {
                acc = 1;
                vel += acc * dt; // optionally multiply by a scalar;
                if(vel > 0) vel = 0;
            }
        }
        return vel ? vel : 0;
    }
    update(game){
        let moveX = this.input.axisH|0; // -1 , 0, or 1
        let moveY = this.input.axisV|0;
        this.velocity.x = this.accelerate(this.velocity.x, moveX, game.dt);
        this.velocity.y = this.accelerate(this.velocity.y, moveY, game.dt);
        this.position.x += this.velocity.x * game.dt;
        this.position.y += this.velocity.y * game.dt;
    }
    serialize(){
        let b = super.serialize();

        return b;
    }
    deserialize(){
        // TODO: turn object into a byte array
    }
}