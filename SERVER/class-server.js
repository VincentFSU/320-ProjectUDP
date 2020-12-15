const Game = require("./class-game.js").Game;
const Client = require("./class-client.js").Client;

exports.Server = class Server {
    constructor(){

        this.clients = [];
        this.PlayerCount = 0;
        this.timeUntilNextBroadcast = 5;
        this.port = 320; // server listens on 
        this.serverName = "Vince's server";
        this.readyPlayers = 0;

        // create socket:
        this.sock = require("dgram").createSocket("udp4");

        // setup event-listeners:
        this.sock.on("error", (e)=>this.onError(e));
        this.sock.on("listening", ()=>this.onStartListen());
        this.sock.on("message", (msg, rinfo)=>this.onPacket(msg, rinfo));      
        
        this.game = new Game(this);
        
        // start listening:
        this.sock.bind(this.port);
    }
    onError(e){
        console.log("ERROR: " + e);
    }
    onStartListen(){
        console.log("Server is listening on port " + this.port);
    }
    onPacket(msg, rinfo){
        if(msg.length < 4) return;
        const packetID = msg.slice(0,4).toString();
        
        const c = this.lookupClient(rinfo);
        if(c){
            c.onPacket(msg, this.game);
        } else {
            if(packetID == "JOIN"){
                this.makeClient(rinfo);
            }
        }


        // TODO: lookup which client sent the packet
        // TODO: if the client doesn't exist, add to list of clients
        // TODO: if the client does exist, give packet to client for processing
    }
    getKeyFromRinfo(rinfo){
        return rinfo.address+":"+rinfo.port;
    }
    lookupClient(rinfo){
        const key = this.getKeyFromRinfo(rinfo);
        return this.clients[key];
    }
    makeClient(rinfo){
        const key = this.getKeyFromRinfo(rinfo);
        const client = new Client(rinfo);
        this.clients[key] = client;

        const packet = this.game.makeREPL(false);
        this.sendPacketToClient(packet, client); // TODO: needs ACK!!

        this.showClientList();
        // depending on scene (and other conditions) spawn Pawn:
        

        return client;
    }
    disconnectClient(client){
        if(client.pawn)
         {
             this.game.removeObject(client.pawn);
             this.PlayerCount--;
         }

        const key = this.getKeyFromRinfo(client.rinfo);
        delete this.clients[key];
        
        this.showClientList();
    }
    showClientList(){
        console.log("====== "+Object.keys(this.clients).length+" clients connected ======");
        for(var key in this.clients){
            console.log(key);
        }
    }
    getPlayer(num=0){
        num = parseInt(num);
        let i = 0;
        for(var key in this.clients){
            if(num == i) return this.clients[key];
            i++;
        }
    }
    sendChat(msg, client){
        const msgLength = msg.readUInt16BE(4);
        const message = msg.slice(6, 6+msgLength).toString();
        console.log(message);
		const packet = Buffer.alloc(7 + msgLength + client.username.length)
		packet.write("CHAT", 0);
		packet.writeUInt8(client.username.length, 4);
		packet.writeUInt16BE(msgLength, 5);
		packet.write(client.username, 7);
		packet.write(message, 7 + client.username.length);

		this.sendPacketToAll(packet)
    }
    sendPacketToAll(packet){
        for(var key in this.clients){
            this.sendPacketToClient(packet, this.clients[key]);
        }
    }
    sendPacketToClient(packet, client){
        this.sock.send(packet, 0 , packet.length, 321, client.rinfo.address, ()=>{});
    }
    broadcastPacket(packet){
        const clientListenPort = 321;

        this.sock.send(packet, 0, packet.length, clientListenPort, undefined);
    }
    broadcastServerHost(){
        const nameLength = this.serverName.length;
        const packet = Buffer.alloc(7 + nameLength);
        
        packet.write("HOST", 0);
        packet.writeUInt16BE(this.port, 4);
        packet.writeUInt8(nameLength, 6);
        packet.write(this.serverName, 7);
        
        this.broadcastPacket(packet);
        //console.log("broadcast packet...")
    }
    update(game){
        // check clients for disconnects, etc.

        // TODO: refactor this nightmare
        for(let key in this.clients){
            this.clients[key].update(game);
            if(this.clients[key] != null && this.clients[key].ready == true){
                this.readyPlayers++;
                if(this.readyPlayers >= 1){
                    const packet = Buffer.alloc(4);
                    packet.write("STRT");
                    this.sendPacketToAll(packet);
                    for(let key in this.clients){
                        this.clients[key].update(game);
                        if(this.clients[key] != null || this.clients[key].ready != null){ // weird bug
                            if(this.clients[key].ready && !this.clients[key].pawn){
                                this.clients[key].spawnPawn(this.game);
                                this.PlayerCount++; 
                                const packet = Buffer.alloc(6);
                                packet.write("PAWN", 0);
                                packet.writeUInt16BE(this.clients[key].pawn.networkID, 4);
                                this.sendPacketToClient(packet, this.clients[key]);
                            }
                        }
                    }
                }
            }
        }
        //console.clear();

        this.timeUntilNextBroadcast -= game.dt;
        if(this.timeUntilNextBroadcast <= 0){
            this.timeUntilNextBroadcast = 1.5;
            this.broadcastServerHost();
        }
    }
}