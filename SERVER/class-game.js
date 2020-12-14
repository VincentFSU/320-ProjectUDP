const Pawn = require("./class-pawn.js").Pawn;
const Food = require("./class-food.js").Food;

exports.Game = class Game {

    static Singleton;

    constructor(server){
        Game.Singleton = this;
        this.frame = 0;
        this.time = 0;
        this.dt = .016;
        this.timeUntilNextStatePacket = 0;

        this.objs = [];

        this.server = server;
        this.update();

    }
    update(){
        this.time += this.dt;
        this.frame++;

        this.server.update(this); // check for client disconnects, etc

        const player = this.server.getPlayer(0);

        for(var i in this.objs){
            this.objs[i].update(this);
        }

        if(player){
            this.objs.length < 300; // approx number of food items
            this.spawnObject(new Food());
        }

        if (this.timeUntilNextStatePacket > 0)
        {
            this.timeUntilNextStatePacket -= this.dt;
        }
        else
        {
            this.timeUntilNextStatePacket = .1;
            this.sendWorldState();
        }

        setTimeout(()=> this.update(), 16); // wait 16ms and call update again.
    }
    sendWorldState(){
        const packet = this.makeREPL(true);
        this.server.sendPacketToAll(packet);
    }
    makeREPL(isUpdate){
        isUpdate = !!isUpdate; // force into a boolean
        let packet = Buffer.alloc(5);
        packet.write("REPL", 0);
        packet.writeUInt8(isUpdate ? 2 : 1, 4);


        this.objs.forEach(o=>{
            const classID = Buffer.from(o.classID);
            const data = o.serialize();
            packet = Buffer.concat([packet, classID, data]);
        });

        return packet;
    }
    spawnObject(obj){
        this.objs.push(obj);

        let packet = Buffer.alloc(5);
        packet.write("REPL", 0);
        packet.writeUInt8(1, 4);

        const classID = Buffer.from(obj.classID);
        const data = obj.serialize();
        packet = Buffer.concat([packet, classID, data]);
        this.server.sendPacketToAll(packet);
    }
    removeObject(obj){
        const index = this.objs.indexOf(obj);
        if(index < 0) return;
        
        const netID = this.objs[index].networkID;

        this.objs.splice(index, 1);

        const packet = Buffer.alloc(6);
        packet.write("REPL", 0);
        packet.writeUInt8(3, 4); // delete
        packet.writeUInt8(netID, 5);

        this.server.sendPacketToAll(packet);
    }
}