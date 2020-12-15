const NetworkObject = require("./class-networkobject.js").NetworkObject;

exports.Pawn = class Pawn extends NetworkObject{
    constructor(username="Player"){
        super();
        this.classID = "PAWN";
        this.worldLimit = 100;
        this.velocity = {x:0,y:0,z:0};
        this.aabb.updateBounds(this.position.x, this.position.y, this.scale.x, this.scale.y);
        this.position.x = this.getRandomInt(25);
        this.position.y = this.getRandomInt(25);
        this.input = {};
        this.username = username;
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
        if (this.checkOutOfBounds(game)){
            this.position.x += this.velocity.x * game.dt;
            this.position.y += this.velocity.y * game.dt;
        }
        else console.log("out of bounds");
        this.aabb.updateBounds(this.position.x, this.position.y, this.scale.x, this.scale.y);
    }
    checkOverlap(other){
        return super.checkOverlap(other);
    }
    checkOutOfBounds(game){
        if (this.position.x + this.scale.x/2 + (this.velocity.x * game.dt) > this.worldLimit){
            this.position.x = this.worldLimit - this.scale.x/2;
            return false;
        }
        else if(this.position.x - this.scale.x/2 + (this.velocity.x * game.dt) < 0){
            this.position.x = 0 + this.scale.x/2;
        }           
        if (this.position.y + this.scale.y/2 + (this.velocity.y * game.dt) > this.worldLimit)
        {
            this.position.y = this.worldLimit - this.scale.y/2;
        }
        else if (this.position.y - this.scale.y/2 + (this.velocity.y * game.dt) < 0)
        {
            this.position.y = 0 + this.scale.y/2;
        }
        return true;
    }
    serialize(){
        let b = super.serialize();

        const bname = Buffer.alloc(this.username.length + 1);
        bname.writeUInt8(this.username.length);
        bname.write(this.username, 1);

        const packet = Buffer.concat([b, bname]);

        return packet;
    }
    deserialize(){
        // TODO: turn object into a byte array
    }
}