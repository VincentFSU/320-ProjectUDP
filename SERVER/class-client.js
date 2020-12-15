const { TIMEOUT } = require("dns");
const Game = require("./class-game.js").Game;
const { Pawn } = require("./class-pawn");

exports.Client = class Client {

    static TIMEOUT = 60;

    constructor(rinfo){
        this.rinfo = rinfo;
        this.input = {
            axisH:0,
            axisV:0,
        };
        this.pawn = null;
        this.timeOfLastPacket = Game.Singleton.time; // in seconds
        this.username = "Player";
        this.ready = false;
    }
    spawnPawn(){
        const game = Game.Singleton;
        if (this.pawn) return; // if pawn exists, do nothing.

        this.pawn = new Pawn(this.username);
        game.spawnObject(this.pawn);


    }
    update(){
        const game = Game.Singleton;

        if(game.time > this.timeOfLastPacket + Client.TIMEOUT)
        {
            // send a "KICK" packet to client

            // remove pawn (and send REPL-delete to all)
            game.server.disconnectClient(this);

            // remove client
        }
    }
    onPacket(packet){
        const game = Game.Singleton;
        if(packet.length < 4) return; // ignore packet
        const packetID = packet.slice(0,4).toString();
        this.timeOfLastPacket = game.time;
        switch(packetID)
        {
            case "JOIN":                
                break;
            case "INPT":
                if(packet.length < 6) return;
                this.input.axisH = packet.readInt8(4);
                this.input.axisV = packet.readInt8(5);

                // send input to Pawn object:
                if(this.pawn) this.pawn.input = this.input;                              
                break;
            case "NAME":
                const nameLength = packet.readInt8(4);
                this.username = packet.slice(5, 5+nameLength).toString();
                break;
            case("CHAT"):
                game.server.sendChat(packet, this);
                console.log("chat packet received.");
                break;
            case("REDY"):
                this.ready = true;
                break;
            case("DCON"):
                this.ready = false;
                break;
            default:
                console.log("ERROR: packet type not recognized");
        }
    }
}