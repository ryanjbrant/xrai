using UnityEngine;

[CreateAssetMenu(fileName = "GeminiConfig", menuName = "Portals/GeminiConfig")]
public class GeminiConfig : ScriptableObject
{
    [SerializeField] private string _apiKey;
    public string ApiKey => _apiKey;

    private static GeminiConfig _instance;
    public static GeminiConfig Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = Resources.Load<GeminiConfig>("GeminiConfig");
            }
            return _instance;
        }
    }
}
