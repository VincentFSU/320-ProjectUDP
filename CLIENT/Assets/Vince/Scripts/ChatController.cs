using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using TMPro;
using UnityEngine;

public class ChatController : MonoBehaviour
{
    public TextMeshProUGUI chatDisplay;
    public TMP_InputField inputChat;
    public TMP_InputField inputUsername;

    public void AddMessageToChatDisplay(string txt)
    {
        chatDisplay.text += $"{txt}\n";
    }

    public void UserDoneEditingUsername()
    {
        string txt = inputUsername.text;
        if (!new Regex(@"^(\s|\t)*$").IsMatch(txt))
        {
            ClientUDP.singleton.SendPacket(PacketBuilder.SetName(txt));
            inputUsername.text = "";
        }
    }

    public void UserDoneEditingMessage()
    {
        string txt = inputChat.text;
        if (!new Regex(@"^(\s|\t)*$").IsMatch(txt))
        {
            ClientUDP.singleton.SendPacket(PacketBuilder.Chat(txt));
            print("CHAT packet sent");
            inputChat.text = "";
        }

        //inputChat.Select();
        //inputChat.ActivateInputField();
    }
}
