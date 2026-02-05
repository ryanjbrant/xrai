# Icosa Gallery API & Integration Patterns

**Last Updated:** 2026-02-05
**Purpose:** API patterns for Icosa Gallery (Google Poly replacement) - search, Unity runtime import, web viewer
**Confidence:** 95% (based on OpenAPI spec at api.icosa.gallery)

---

## Quick Reference

| Need | Pattern |
|------|---------|
| Search assets | `GET /v1/assets?keywords=tree&format=GLTF2` |
| Get single asset | `GET /v1/assets/{asset_url}` |
| Unity import | `IcosaApi.Import(assetId, options, callback)` |
| Web viewer | `GLTFGoogleTiltBrushMaterialExtension` |
| Auth (device) | `POST /v1/login/device_login?device_code={code}` |

---

## API Endpoints (api.icosa.gallery/v1/)

### Search Assets (No Auth Required)
```http
GET /v1/assets
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `keywords` | string | Full-text search |
| `tag` | string | Tag filter |
| `category` | string | Category filter |
| `curated` | boolean | Only curated assets |
| `format` | string | GLTF2, OBJ, etc. |
| `triangleCountMin` | integer | Min triangles |
| `triangleCountMax` | integer | Max triangles |
| `authorName` | string | Filter by author |
| `license` | string | CC-BY, CC0, etc. |
| `pageSize` | integer | Results per page |
| `pageToken` | string | Pagination token |

**Example:**
```bash
curl "https://api.icosa.gallery/v1/assets?keywords=nature&format=GLTF2&curated=true&pageSize=20"
```

**Response:**
```json
{
  "assets": [
    {
      "name": "assets/abc123",
      "displayName": "Forest Tree",
      "authorName": "artist",
      "formats": [
        {
          "formatType": "GLTF2",
          "root": { "url": "https://..." }
        }
      ],
      "thumbnail": { "url": "https://..." },
      "license": "CC-BY",
      "triangleCount": 1500
    }
  ],
  "totalSize": 42,
  "nextPageToken": "abc123"
}
```

### Get Single Asset
```http
GET /v1/assets/{asset_url}
```

### Collections
```http
GET /v1/collections
GET /v1/collections/{collection_url}
```

### oEmbed
```http
GET /v1/oembed?url={asset_url}
```

---

## Authentication (Device Code Flow)

For Unity/VR apps without browser access:

```
1. Request device code from Icosa
2. User visits icosa.gallery/activate
3. User enters device code
4. App polls for access token
5. Use Bearer token for authenticated requests
```

### Login Endpoint
```http
POST /v1/login/device_login?device_code={code}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer"
}
```

### Authenticated Endpoints
```http
GET  /v1/users/me                    # User profile
GET  /v1/users/me/assets             # User's uploads
POST /v1/users/me/assets             # Upload asset
GET  /v1/users/me/likedassets        # Liked assets
GET  /v1/users/me/collections        # User collections
```

---

## Unity Runtime Import

### Package Installation (Unity 2022.3+)
```
Window > Package Manager > + > Add package from git URL:
https://github.com/icosa-foundation/icosa-toolkit-unity.git#upm
```

**Requirement:** Enable "Allow unsafe code" in Player Settings

### Basic Import Pattern
```csharp
using IcosaApiClient;

public class IcosaLoader : MonoBehaviour
{
    public void LoadAsset(string assetId)
    {
        IcosaApi.Import(assetId, new ImportOptions(), (asset, result) =>
        {
            if (result.ok)
            {
                GameObject imported = result.Value.gameObject;
                imported.transform.position = Vector3.zero;
                Debug.Log($"Imported: {imported.name}");
            }
            else
            {
                Debug.LogError($"Import failed: {result.Error}");
            }
        });
    }
}
```

### Manual Search + Import (No SDK)
```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json.Linq;

public class IcosaAssetLoader : MonoBehaviour
{
    const string API_BASE = "https://api.icosa.gallery/v1";

    public IEnumerator SearchAssets(string keywords, System.Action<JArray> onComplete)
    {
        string url = $"{API_BASE}/assets?keywords={keywords}&format=GLTF2&pageSize=20";
        using (var request = UnityWebRequest.Get(url))
        {
            yield return request.SendWebRequest();
            if (request.result == UnityWebRequest.Result.Success)
            {
                var json = JObject.Parse(request.downloadHandler.text);
                onComplete(json["assets"] as JArray);
            }
        }
    }

    public IEnumerator DownloadAsset(string gltfUrl, System.Action<byte[]> onComplete)
    {
        using (var request = UnityWebRequest.Get(gltfUrl))
        {
            yield return request.SendWebRequest();
            if (request.result == UnityWebRequest.Result.Success)
            {
                onComplete(request.downloadHandler.data);
            }
        }
    }
}
```

### With glTFast (Recommended)
```csharp
using GLTFast;
using UnityEngine;

public async void LoadFromUrl(string gltfUrl)
{
    var gltf = new GltfImport();
    bool success = await gltf.Load(gltfUrl);

    if (success)
    {
        var parent = new GameObject("IcosaAsset");
        await gltf.InstantiateMainSceneAsync(parent.transform);
    }
}
```

### Format Priority
| Format | Status |
|--------|--------|
| glTF 2.0 | ✅ Preferred |
| OBJ | ✅ Fallback |
| glTF 1.0 | ❌ Not supported |
| .tilt | ❌ Not supported |

---

## Web Viewer (Three.js)

### Installation
```bash
npm install three-icosa
# or load from CDN
```

### Basic Integration
```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFGoogleTiltBrushMaterialExtension } from 'three-icosa';

const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();

// Register Open Brush material extension (required for Tilt Brush assets)
gltfLoader.register(parser =>
  new GLTFGoogleTiltBrushMaterialExtension(
    parser,
    'https://icosa-gallery.github.io/three-icosa-template/brushes/'
  )
);

// Load asset
gltfLoader.load('https://api.icosa.gallery/v1/assets/abc123/format/gltf2', (gltf) => {
  scene.add(gltf.scene);
});
```

### CDN Setup
```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@latest/build/three.module.js",
    "three-icosa": "./three-icosa.module.js"
  }
}
</script>
```

### Supported Formats
| Format | Handler |
|--------|---------|
| .tilt | Native Tilt Brush/Open Brush |
| .gltf/.glb (2.0) | Three.js GLTFLoader |
| .spz, .splat, .ksplat | Spark (Gaussian splats) |

---

## Self-Hosting

Deploy your own Icosa Gallery instance:

```bash
git clone https://github.com/icosa-foundation/icosa-gallery.git
cd icosa-gallery
docker-compose up -d
```

**Stack:** Django + PostgreSQL + Meilisearch

**Benefits:**
- Control rate limits
- Custom content curation
- ActivityPub federation with other instances

---

## GitHub Repositories

| Repo | Purpose |
|------|---------|
| [icosa-foundation/icosa-gallery](https://github.com/icosa-foundation/icosa-gallery) | Backend API |
| [icosa-foundation/icosa-toolkit-unity](https://github.com/icosa-foundation/icosa-toolkit-unity) | Unity SDK (active) |
| [icosa-foundation/gallery-viewer](https://github.com/icosa-foundation/gallery-viewer) | Web viewer |
| [icosa-foundation/three-icosa](https://github.com/icosa-foundation/three-icosa) | Three.js extension |
| [icosa-foundation/open-brush-unity-tools](https://github.com/icosa-foundation/open-brush-unity-tools) | Newer Unity tools |
| [icosa-foundation/icosa-client-libraries](https://github.com/icosa-foundation/icosa-client-libraries) | Auto-gen clients (experimental) |

---

## Licensing Notes

- Default API returns CC-licensed assets only (CC-BY, CC0, CC-BY-SA)
- Filter with `license` parameter
- Attribution required for CC-BY assets
- Check `formats[].license` in response

---

## Trusted Resources

| Resource | URL |
|----------|-----|
| API Docs | https://api.icosa.gallery/v1/docs |
| OpenAPI Spec | https://api.icosa.gallery/v1/openapi.json |
| Discord | https://discord.openbrush.app |
| NLnet Funding | https://nlnet.nl/project/IcosaGallery/ |

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "Unsafe code" error | Enable in Player Settings → Other Settings |
| glTF 1.0 not loading | Convert to glTF 2.0 or use OBJ |
| Missing textures | Check `resources` array in format response |
| Rate limited | Self-host or contact Icosa Foundation |
| Open Brush materials black | Use three-icosa extension with brush folder |
