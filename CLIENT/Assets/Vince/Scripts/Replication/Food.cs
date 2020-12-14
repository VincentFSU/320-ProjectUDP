using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Food : NetworkObject
{
    new public static string classID = "FOOD"; // override parent value

    public bool canPlayerControl = false;

    public override int Deserialize(Buffer packet)
    {
        return base.Deserialize(packet);
    }
}
