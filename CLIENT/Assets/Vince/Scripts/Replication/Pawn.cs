using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Pawn : NetworkObject
{
    new public static string classID = "PAWN"; // override parent value

    public bool canPlayerControl = false;
    Vector3 velocity = new Vector3();

    private void FixedUpdate()
    {
        if (canPlayerControl)
        {
            int moveX = (int)Input.GetAxisRaw("Horizontal");
            int moveY = (int)Input.GetAxisRaw("Vertical");
            velocity.x = Accelerate(velocity.x, moveX);
            velocity.y = Accelerate(velocity.y, moveY);

            transform.position += new Vector3(velocity.x, velocity.y, 0) * Time.fixedDeltaTime;
        }
    }

    float Accelerate(float vel, float acc)
    {
        if (acc != 0)
        {
            vel += acc * Time.fixedDeltaTime * (1/transform.localScale.x);
        }
        else
        {
            if (vel > 0)
            {
                acc = -2;
                vel += acc * Time.fixedDeltaTime * transform.localScale.x; // optionally multiply by a scalar;
                if (vel < 0) vel = 0;
            }
            if (vel < 0)
            {
                acc = 2;
                vel += acc * Time.fixedDeltaTime * transform.localScale.x; // optionally multiply by a scalar;
                if (vel > 0) vel = 0;
            }
        }
        return vel;
    }

    public override void Serialize()
    {
        // TODO: turn object into a byte array
    }

    public override int Deserialize(Buffer packet)
    {
        return base.Deserialize(packet);
    }
}
