exports.NetworkObject = class NetworkObject{
    static _idCount = 0;
    constructor(){
        this.classID = "NWOB";
        this.networkID = ++NetworkObject._idCount;

        this.position = {x:0,y:0,z:0};
        this.rotation = {x:0,y:0,z:0};
        this.scale    = {x:1,y:1,z:1};
    }
    update(game){
        this.position.x = Math.sin(game.time);
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