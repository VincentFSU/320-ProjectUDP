using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Color : MonoBehaviour
{
    public List<Material> Mats = new List<Material>();

    private void Awake()
    {
        GetComponent<Renderer>().material = Mats[Random.Range(0, Mats.Count)];
    }
}
