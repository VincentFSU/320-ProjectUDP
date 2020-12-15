using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Net;
using System.Net.Sockets;
using System;
using System.Threading;

public class ClientUDP : MonoBehaviour
{
    private static ClientUDP _singleton;
    public static ClientUDP singleton
    {
        get { return _singleton; }
        private set { _singleton = value; }
    }

    static UdpClient sockSending = new UdpClient();
    static UdpClient sockReceiving = new UdpClient(321);

    public List<RemoteServer> availableGameServers = new List<RemoteServer>();
    public ConnectGUI connectGUI;
    public ChatController chatController;

    public int controlledPawnNetID = -1;

    private bool ready = false;
    Camera cam;

    /// <summary> 
    /// Most recent ball update packet 
    /// that has been received... 
    /// </summary> 
    //uint ackBallUpdate = 0;

    void Start()
    {
        chatController.gameObject.SetActive(false);
        if (singleton != null)
        {
            // already have a clientUDP... 
            Destroy(gameObject);

        }
        else
        {
            cam = Camera.main;
            singleton = this;
            DontDestroyOnLoad(gameObject);
            ListenForPackets();
        }

    }

    public void ConnectToServer(string host, ushort port)
    {
        print($"attempt to connect to {host}:{port}");
        IPEndPoint ep = new IPEndPoint(IPAddress.Parse(host), port);
        sockSending = new UdpClient(ep.AddressFamily);
        sockSending.Connect(ep);

        connectGUI.gameObject.SetActive(false);
        chatController.gameObject.SetActive(true);

        //ObjectRegistry.RegisterAll();

        // set up receive loop (async): 
        // ListenForPackets();

        // send a packet to the server (async): 
        SendPacket(Buffer.From("JOIN"));
    }

    /// <summary> 
    /// This function listens for incoming UDP packets. 
    /// </summary> 
    async void ListenForPackets()
    {

        while (true)
        {
            UdpReceiveResult res;
            try
            {
                res = await sockReceiving.ReceiveAsync();
                ProcessPacket(res);
            }
            catch
            {
                print("FAILED TO RECEIVE PACKET");
                break;
            }
        }
    }
    /// <summary> 
    /// This function processes a packet and decides what to do next. 
    /// </summary> 
    /// <param name="packet">The packet to process</param> 
    private void ProcessPacket(UdpReceiveResult res)
    {
        Buffer packet = Buffer.From(res.Buffer);
        if (packet.Length < 4) return; // do nothing 

        string id = packet.ReadString(0, 4);
        switch (id)
        {
            case "REPL":
                ProcessPacketREPL(packet);
                break;
            case "PAWN":
                if (packet.Length < 5) return;

                ushort networkID = packet.ReadUInt16BE(4);
                controlledPawnNetID = networkID;
                var obj = NetworkObject.GetObjectByNetworkID(networkID);
                if (obj != null)
                {
                    Pawn p = (Pawn)obj;

                    if (p != null) p.canPlayerControl = true;
                    cam.orthographicSize = 6;
                }

                break;
            case "HOST":
                if (packet.Length < 7) return;

                ushort port = packet.ReadUInt16BE(4);
                int nameLength = packet.ReadUInt8(6);

                if (packet.Length < 7 + nameLength) return;

                string name = packet.ReadString(7, nameLength);

                AddToServerList(new RemoteServer(res.RemoteEndPoint, name));

                break;
            case "CHAT":
                if (packet.Length < 6) return;
                int usernameLength = packet.ReadUInt8(4);
                ushort messageLength = packet.ReadUInt16BE(5);
                string username = packet.ReadString(7, usernameLength);
                string message = packet.ReadString(7 + usernameLength, messageLength);
                chatController.AddMessageToChatDisplay($"{username}: {message}");
                print(message);
                break;
            case "STRT":
                if (ready)
                {
                    chatController.gameObject.SetActive(false);
                }
                //PawnScores.singleton.gameObject.SetActive(true);
                break;
        }
    }

    public void Ready()
    {
        ready = true;
        SendPacket(PacketBuilder.Ready());
    }

    public void Disconnect()
    {
        ready = false;
        SendPacket(PacketBuilder.Disconnect());
        //Thread.Sleep(TimeSpan.FromMilliseconds(200));
        //if (sockSending != null) sockSending.Close();
        //if (sockReceiving != null) sockReceiving.Close();

        chatController.gameObject.SetActive(false);
        connectGUI.gameObject.SetActive(true);
        PawnScores.singleton.ClearList();
    }

    private void AddToServerList(RemoteServer server)
    {

        if (!availableGameServers.Contains(server))
        {
            availableGameServers.Add(server);
        }

        //print(availableGameServers.Count);
    }

    private void ProcessPacketREPL(Buffer packet)
    {
        if (packet.Length < 5) return; // do nothing 

        int replType = packet.ReadUInt8(4);

        if (replType != 1 && replType != 2 && replType != 3) return;

        //print($"REPL packet received; type is {replType}");

        int offset = 5;

        while (offset <= packet.Length)
        {

            int networkID = 0;
            switch (replType)
            {
                case 1: // create:
                    if (packet.Length < offset + 5) return; // do nothing 
                    networkID = packet.ReadUInt16BE(offset + 4);

                    string classID = packet.ReadString(offset, 4);

                    // check network ID!

                    if (NetworkObject.GetObjectByNetworkID(networkID) != null) return; // ignore if object already exists
                    NetworkObject obj = ObjectRegistry.SpawnFrom(classID);

                    if (obj == null) return;

                    offset += 4; // trim out ClassID off beginning of packet data

                    Buffer chunk = packet.Slice(offset);
                    offset += obj.Deserialize(chunk);

                    NetworkObject.AddObject(obj); // ERROR: Class ID not found!
                    break;
                case 2: // update:
                    if (packet.Length < offset + 5) return; // do nothing 
                    networkID = packet.ReadUInt16BE(offset + 4);

                    //PawnScores.singleton.ClearList();

                    // lookup the object, using networkID
                    NetworkObject obj2 = NetworkObject.GetObjectByNetworkID(networkID);
                    if (obj2 == null) return;

                    classID = packet.ReadString(offset, 4);
                    if (classID == "PAWN")
                    {
                        PawnScores.singleton.AddPawn((Pawn)obj2);
                    }

                    if (controlledPawnNetID == -1)
                    {
                        cam.orthographicSize = 51;
                    }

                    offset += 4;
                    offset += obj2.Deserialize(packet.Slice(offset));

                    break;
                case 3: // delete:
                    if (packet.Length < offset + 1) return; // do nothing 
                    networkID = packet.ReadUInt16BE(offset);
                    if (networkID == controlledPawnNetID)
                    {
                        chatController.gameObject.SetActive(true);
                        cam.orthographicSize = 51;
                    }

                    NetworkObject obj3 = NetworkObject.GetObjectByNetworkID(networkID);
                    if (obj3 == null) return;

                    if (networkID == 1)
                    {
                        PawnScores.singleton.ClearList();
                    }
                    else
                    {

                        PawnScores.singleton.RemovePawn(networkID);
                    }
                    NetworkObject.RemoveObject(networkID);
                    Destroy(obj3.gameObject);
                    offset++;
                    break;
            }

        }
    }

    /// <summary> 
    /// This function sends a packet (current to localhost:320) 
    /// </summary> 
    /// <param name="packet">The packet to send</param> 
    async public void SendPacket(Buffer packet)
    {
        if (sockSending == null) return;
        if (!sockSending.Client.Connected) return;

        await sockSending.SendAsync(packet.bytes, packet.bytes.Length);
    }
    /// <summary> 
    /// When destroying, clean up objects: 
    /// </summary> 
    private void OnDestroy()
    {
        sockSending.Close();
        sockReceiving.Close();
    }
}
