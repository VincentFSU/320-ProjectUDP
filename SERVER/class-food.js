const NetworkObject = require("./class-networkobject.js").NetworkObject;

exports.Food = class Food extends NetworkObject{
    constructor(){
        super();
        this.classID = "FOOD";

        this.position.x = this.getRandomInt(40);
        this.position.y = this.getRandomInt(40);

        this.scale.x = 0.3;
        this.scale.y = 0.3;
        this.scale.z = 1;

        this.aabb.updateBounds(this.position.x, this.position.y, this.scale.x, this.scale.y);

        this.input = {};
    }
    update(game){

    }
    checkOverlap(other){
        return false;
    }
    serialize(){
        let b = super.serialize();

        return b;
    }
    deserialize(){
        // TODO: turn object into a byte array
    }
    getRandomInt(max){
        return Math.floor(Math.random() * Math.floor(max));
    }
}