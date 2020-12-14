using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ConnectGUI : MonoBehaviour
{
    public InputField inputIP;
    public InputField inputPort;

    public ServerRowGUI prefabServerRowGUI;

    List<ServerRowGUI> rows = new List<ServerRowGUI>();

    float timeUntilRefresh = 1;

    public void DirectConnect()
    {
        if (inputIP == null) return;
        if (inputPort == null) return;

        string addr = inputIP.text;
        string port = inputPort.text;
        ushort portNum = 0;

        System.UInt16.TryParse(port, out portNum);
        ClientUDP.singleton.ConnectToServer(addr, portNum);
    }

    private void Start()
    {
        
    }
    private void Update()
    {
        timeUntilRefresh -= Time.deltaTime;
        if (timeUntilRefresh <= 0)
        {
            UpdateServerList();
            timeUntilRefresh = 2;
        }
    }

    public void UpdateServerList()
    {
        foreach (var row in rows)
        {
            if (row != null) Destroy(row.gameObject);
        }

        rows.Clear();
        int i = 0;
        foreach (var server in ClientUDP.singleton.availableGameServers)
        {
            ServerRowGUI row = Instantiate(prefabServerRowGUI, transform);
            RectTransform rt = (RectTransform)row.transform;
            rt.localScale = Vector3.one;
            rt.sizeDelta = new Vector2(500, 50);
            rt.anchorMax = rt.anchorMin = new Vector2(.5f, .5f);
            rt.pivot = new Vector2(0.5f, 0.5f);
            rt.anchoredPosition = new Vector2(0, -i * 70);
            row.Init(server);
            rows.Add(row);
            i++;
        }
    }
}
