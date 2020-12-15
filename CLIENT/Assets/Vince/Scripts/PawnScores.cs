using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;

public class PawnScores : MonoBehaviour
{
    public TextMeshProUGUI leaderboardText;
    public TextMeshProUGUI scoreText;
    Dictionary<int, Pawn> pawns = new Dictionary<int, Pawn>();

    private static PawnScores _singleton;
    public static PawnScores singleton
    {
        get { return _singleton; }
        private set { _singleton = value; }
    }

    void DrawLeaderboard()
    {
        List<Pawn> pawnList = pawns.OrderByDescending(p => p.Value.score).Select(p => p.Value).ToList();
        string text = "";
        int i = 0;
        foreach (var pawn in pawnList)
        {
            text += $"{++i}. {pawn.username}\n";
        }

        leaderboardText.text = text;
    }

    public void AddPawn(Pawn pawn)
    {
        if (!pawns.ContainsKey(pawn.networkID))
        {
            pawns.Add(pawn.networkID, pawn);
        }
    }

    public void RemovePawn(int networkID)
    {
        if (pawns.ContainsKey(networkID))
        {
            pawns.Remove(networkID);
        }
    }


    private void Update()
    {
        DrawLeaderboard();
        var playerScore = pawns.Where(p => p.Value.canPlayerControl).Select(p => p.Value.score).FirstOrDefault();
        scoreText.text = $"Score: {playerScore}";
    }

    void Start()
    {
        if (singleton != null)
        {
            // already have a PawnScores... 
            Destroy(gameObject);

        }
        else
        {
            singleton = this;
        }

    }



}
