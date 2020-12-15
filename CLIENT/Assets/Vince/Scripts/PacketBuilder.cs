using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class PacketBuilder
{
    static int previousInputH = 0;
    static int previousInputV = 0;

    public static Buffer CurrentInput()
    {
        int h = (int)Input.GetAxisRaw("Horizontal"); // (-1 | 0 | 1)
        int v = (int)Input.GetAxisRaw("Vertical");

        //if (h == previousInputH) return null;
        //if (v == previousInputV) return null;

        previousInputH = h;
        previousInputV = v;
        
        Buffer b = Buffer.Alloc(6); // 5 bytes for an INPT packet

        b.WriteString("INPT", 0);
        b.WriteInt8((sbyte)h, 4); // write the horizontal input 4 bytes in to the packet
        b.WriteInt8((sbyte)v, 5); // write the vertical input 5 bytes in to the packet

        return b;
    }

    public static Buffer Ready()
    {
        Buffer packet = Buffer.Alloc(5);
        packet.WriteString("REDY", 0);

        return packet;
    }

    public static Buffer Chat(string msg)
    {
        Buffer packet = Buffer.Alloc(6 + msg.Length);
        packet.WriteString("CHAT", 0);
        packet.WriteUInt16BE((ushort)msg.Length, 4);
        packet.WriteString(msg, 6);

        return packet;
    }

    public static Buffer SetName(string name)
    {
        Buffer packet = Buffer.Alloc(5 + name.Length);
        packet.WriteString("NAME", 0);
        packet.WriteUInt8((byte)name.Length, 4);
        packet.WriteString(name, 5);

        return packet;
    }
}
