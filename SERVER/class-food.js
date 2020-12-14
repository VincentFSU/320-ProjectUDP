const NetworkObject = require("./class-networkobject.js").NetworkObject;

exports.Food = class Food extends NetworkObject{
    constructor(){
        super();
        this.classID = "FOOD";

        this.position.x = Math.getRandomInt(40);
        this.position.y = Math.getRandomInt(40);

        this.scale.x = 0.3;
        this.scale.y = 0.3;
        this.scale.z = 0.3;

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

    }
    serialize(){
        let b = super.serialize();

        return b;
    }
    deserialize(){
        // TODO: turn object into a byte array
    }
}