using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class Pawn : NetworkObject
{
    new public static string classID = "PAWN"; // override parent value

    private Camera cam;

    public bool canPlayerControl = false;
    Vector3 velocity = new Vector3();


    TextMeshPro usernameText;
    GameObject sign;

    [HideInInspector]
    public string username;

    public int score;

    public PawnScores scoreBoard;

    private void FixedUpdate()
    {
        if (canPlayerControl)
        {
            int moveX = (int)Input.GetAxisRaw("Horizontal");
            int moveY = (int)Input.GetAxisRaw("Vertical");
            velocity.x = Accelerate(velocity.x, moveX);
            velocity.y = Accelerate(velocity.y, moveY);

            transform.position += new Vector3(velocity.x, velocity.y, 0) * Time.fixedDeltaTime;
            cam.transform.position =  new Vector3(transform.position.x, transform.position.y, (float)(transform.position.x - 1.5 * transform.localScale.z));
            sign.transform.position = new Vector3(transform.position.x, transform.position.y, -10);
            cam.orthographicSize += scaleDiff;
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

    private void Awake()
    {
        cam = Camera.main;
        sign = new GameObject("player_label");        
        sign.transform.rotation = cam.transform.rotation;
        sign.transform.position = transform.position;
        sign.layer = LayerMask.NameToLayer("UI");
        usernameText = sign.AddComponent<TextMeshPro>();
        usernameText.fontStyle = FontStyles.Normal;
        usernameText.color = UnityEngine.Color.black;
        usernameText.alignment = TextAlignmentOptions.Center;
        usernameText.fontSize = transform.localScale.x;

        PawnScores.singleton.AddPawn(this);
    }

    public override void Serialize()
    {
        // TODO: turn object into a byte array
    }

    public override int Deserialize(Buffer packet)
    {
        int usernameLength = packet.ReadInt8(38);
        username = packet.ReadString(39, usernameLength);
        usernameText.text = username;
        sign.transform.position = new Vector3(transform.position.x, transform.position.y, -10);
        usernameText.fontSize = transform.localScale.x + 1;
        score = (int)(transform.localScale.x * 100) - 100;
        return base.Deserialize(packet) + usernameLength + 1;
    }
}
