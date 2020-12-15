const AABB = require("./class-AABB.js").AABB;

exports.NetworkObject = class NetworkObject{
    static _idCount = 0;
    constructor(){
        this.classID = "NWOB";
        this.networkID = ++NetworkObject._idCount;

        this.position = {x:0,y:0,z:0};
        this.rotation = {x:0,y:0,z:0};
        this.scale    = {x:1,y:1,z:1};
        this.aabb = new AABB(this.position.x, this.position.y, this.scale.x, this.scale.y);
    }
    update(game){
        //this.position.x = Math.sin(game.time);
    }
    checkOverlap(other){
        if(this.aabb.compareBounds(this.aabb.bounds, other.aabb.bounds)){
            // console.log("overlap");
            // console.log("A: " + "\n\txMin: " + this.aabb.bounds.xMin
            //                   + "\n\txMax: " + this.aabb.bounds.xMax
            //                   + "\n\tyMin: " + this.aabb.bounds.yMin
            //                   + "\n\tyMax: " + this.aabb.bounds.yMax
            //         + "\nB: " + "\n\txMin: " + other.aabb.bounds.xMin
            //                   + "\n\txMax: " + other.aabb.bounds.xMax
            //                   + "\n\tyMin: " + other.aabb.bounds.yMin
            //                   + "\n\tyMax: " + other.aabb.bounds.yMax);

            this.scale.x += other.scale.x/5;
            this.scale.y += other.scale.y/5;
            //this.scale.z += other.scale.z/5;

            return true;
        }
    }
    serialize(){
        const buffer = Buffer.alloc(38);

        buffer.writeUInt16BE(this.networkID, 0);
        buffer.writeFloatBE(this.position.x, 2);
        buffer.writeFloatBE(this.position.y, 6);
        buffer.writeFloatBE(this.position.z, 10);

        buffer.writeFloatBE(this.rotation.x, 14);
        buffer.writeFloatBE(this.rotation.y, 18);
        buffer.writeFloatBE(this.rotation.z, 22);

        buffer.writeFloatBE(this.scale.x, 26);
        buffer.writeFloatBE(this.scale.y, 30);
        buffer.writeFloatBE(this.scale.z, 34);

        return buffer;
    }
    deserialize(buffer){
        //buffer.position.x = buffer.readFloatBE(0);
        //buffer.position.y = buffer.readFloatBE(0);
        //buffer.position.z = buffer.readFloatBE(0);
    }
}