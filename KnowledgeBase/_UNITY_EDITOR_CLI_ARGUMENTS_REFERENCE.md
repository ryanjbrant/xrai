# Unity Editor Command-Line Arguments Reference (Unity 6 / 6000.3)

> Source: Unity Official Documentation (fetched 2026-02-12)
> URL: docs.unity3d.com/6000.3/Documentation/Manual/EditorCommandLineArguments.html

---

## Configuration

| Flag | Params | Description |
|------|--------|-------------|
| `-createProject` | `<path>` | Create an empty project at path |
| `-consistencyCheck` | — | Importer consistency check on startup (local mode default) |
| `-consistencyCheckSourceMode` | `local` / `cacheserver` | Source for importer consistency comparison |
| `-disable-assembly-updater` | `<asm1 asm2 ...>` | Skip auto API update on listed assemblies. Omit list = disable all |
| `-disable-gpu-skinning` | — | Disable GPU skinning at startup |
| `-disable-playback-engines` | `<Names>` | Disable build modules (case-sensitive) |
| `-executeMethod` | `<Class.Method>` | Run static method on project open. Must be in `Editor/` folder |
| `-exportPackage` | `<paths... outputFile>` | Export .unitypackage from listed asset paths |
| `-importPackage` | `<path>` | Import .unitypackage silently (no dialog) |
| `-job-worker-count` | `<N>` | Max threads for Unity JobQueue |
| `-gc-helper-count` | `<N>` | Asset GC helper thread count (default: core count) |
| `-logFile` | `<path>` | Redirect Editor log output. Use `-` for stdout |
| `-noUpm` | — | Disable Unity Package Manager |
| `-openfile` | `<path>` | Open project from scene or package file path |
| `-password` | `<pwd>` | Password for license activation |
| `-projectPath` | `<path>` | Open project at path (absolute or relative) |
| `-quit` | — | Quit Editor after other commands finish |
| `-quitTimeout` | `<seconds>` | Timeout for pending async tasks before quit (default: 300) |
| `-releaseCodeOptimization` | — | Force release code optimization mode |
| `-setDefaultPlatformTextureFormat` | `<fmt>` | Android only. Options: `dxt`, `atc`, `etc`, `etc2`, `astc` |
| `-overrideMaxTextureSize` | `<pixels>` | Override max texture import size |
| `-overrideTextureCompression` | — | Override texture compression settings on import |
| `-silent-crashes` | — | Suppress standalone player crash dialogs |
| `-upmLogFile` | `<path>` | UPM background app log location |
| `-username` | `<email>` | Unity ID email for activation |
| `-vcsMode` | `<mode>` | Set VCS permanently. Options: `"Visible Meta Files"`, `"Hidden Meta Files"`, `Perforce`, `PlasticSCM` |
| `-vcsModeSession` | `<mode>` | Set VCS for this session only (same options) |
| `-version` | — | Print Editor version to stdout |
| `-timestamps` | — | Prefix every log line with timestamp + thread ID |

---

## Batch Mode

| Flag | Params | Description |
|------|--------|-------------|
| `-batchmode` | — | Run without UI. No dialogs, no human interaction. Required for CI |
| `-accept-apiupdate` | — | Run API Updater in batch mode |
| `-ignorecompilererrors` | — | Continue startup despite compile errors |
| `-nographics` | — | Don't init graphics device. Use with `-batchmode` for headless |
| `-upmPack` | `<pkg_folder> <output>` | Export + sign a UPM package in batch mode |

---

## Build

| Flag | Params | Description |
|------|--------|-------------|
| `-activeBuildProfile` | `<path>` | Set active build profile from saved asset |
| `-build` | `<path>` | Build Player from active build profile to target path |
| `-buildTarget` | `<name>` | Set active build target on launch |
| `-buildLinux64Player` | `<path>` | Build 64-bit Linux standalone |
| `-buildLinuxHeadlessSimulation` | `<path>` | Build 64-bit Linux headless simulation |
| `-buildOSXUniversalPlayer` | `<path>` | Build 64-bit macOS standalone |
| `-buildWindowsPlayer` | `<path>` | Build 32-bit Windows standalone |
| `-buildWindows64Player` | `<path>` | Build 64-bit Windows standalone |
| `-standaloneBuildSubtarget` | `Player` / `Server` | Standalone build subtarget |

**`-buildTarget` values:** `android`, `cloudrendering`, `ios`, `linux64`, `osxuniversal`, `tvos`, `visionos`, `windowsstoreapps`, `webgl`, `win`, `win64`

---

## Debugging & Diagnostics

| Flag | Params | Description |
|------|--------|-------------|
| `-disableManagedDebugger` | — | Disable debugger listen socket |
| `-debugCodeOptimization` | — | Enable debug code optimization |
| `-diag-debug-shader-compiler` | — | Single shader compiler instance, 1hr timeout |
| `-enableCodeCoverage` | — | Enable code coverage + Coverage API |
| `-stackTraceLogType` | `None` / `"Script Only"` / `Full` | Stack trace detail level |
| `-log-memory-performance-stats` | — | Detailed memory/perf report in log on close |
| `-wait-for-managed-debugger` | — | Pause Editor until managed debugger attaches |
| `-wait-for-native-debugger` | — | Pause Editor until native debugger attaches |
| `-force-d3d12-debug` | — | Enable DX12 validation layer |
| `-force-d3d12-debug-gbv` | — | Enable DX12 GPU-based validation |
| `-force-vulkan-layers` | — | Enable Vulkan validation layer |

---

## Graphics API

| Flag | Params | Description |
|------|--------|-------------|
| `-force-d3d11` | — | Windows: Use Direct3D 11 |
| `-force-d3d12` | — | Windows: Use Direct3D 12 |
| `-force-glcore` | — | Use OpenGL 3/4 core profile |
| `-force-glcoreXY` | XY: `32`,`33`,`40`-`45` | Request specific OpenGL core version |
| `-force-gles` | — | Windows: Use OpenGL ES |
| `-force-glesXY` | XY: `30`,`31`,`31aep`,`32` | Windows: Request specific GLES version |
| `-force-opengl` | — | Use legacy OpenGL backend |
| `-force-vulkan` | — | Use Vulkan |
| `-force-metal` | — | macOS: Use Metal as default |
| `-force-low-power-device` | — | macOS Metal: Use low-power GPU |
| `-enable-metal-capture` | — | macOS: Enable Metal capture from Editor |
| `-force-device-index` | `<index>` | Use specific GPU by device index |
| `-force-clamped` | — | With `-force-glcoreXY`: skip GL extension checks |

---

## Profiler

| Flag | Params | Description |
|------|--------|-------------|
| `-deepprofiling` | — | Enable Deep Profiling for CPU profiler |
| `-profiler-enable` | — | Profile startup of Player or Editor |
| `-profiler-log-file` | `<path.raw>` | Stream profile data to `.raw` file |
| `-profiler-capture-frame-count` | `<N>` | Number of frames to capture (Players only) |
| `-profiler-maxusedmemory` | `<bytes>` | Max profiler memory. Default: 16MB (Player), 256MB (Editor) |

---

## Licensing

| Flag | Params | Description |
|------|--------|-------------|
| `-serial` | `<key>` (optional) | Activate paid license. Requires `-batchmode` |
| `-returnlicense` | — | Return current serial/named-user license |
| `-createManualActivationFile` | — | Step 1 of manual activation (generates `.alf`) |
| `-manualLicenseFile` | `<path.ulf>` | Step 3 of manual activation (imports `.ulf`) |

---

## Unity Accelerator / Cache Server

| Flag | Params | Description |
|------|--------|-------------|
| `-EnableCacheServer` | — | Enable Unity Accelerator (requires `-cacheServerEndpoint`) |
| `-cacheServerEndpoint` | `<host:port>` | Accelerator address (default port: 10080) |
| `-cacheServerNamespacePrefix` | `<prefix>` | Namespace prefix for Accelerator |
| `-cacheServerEnableDownload` | `true`/`false` | Toggle Accelerator downloads |
| `-cacheServerEnableUpload` | `true`/`false` | Toggle Accelerator uploads |
| `-cacheServerWaitForConnection` | `<ms>` | Connection timeout in milliseconds |
| `-cacheServerWaitForUploadCompletion` | — | Block quit until uploads complete |
| `-cacheServerDownloadBatchSize` | `<N>` | Artifacts per download batch (default: 128) |
| `-cacheServerUploadExistingImports` | — | Upload previously un-uploaded imports |
| `-cacheServerUploadAllRevisions` | — | Upload all import revisions |
| `-cacheServerUploadExistingShaderCache` | — | Upload shader cache imports |

---

## Special

| Flag | Params | Description |
|------|--------|-------------|
| `-enableIncompatibleAssetDowngrade` | — | Allow opening assets from newer Unity versions |
| `-giCustomCacheLocation` | `<abs_path>` | Custom GI cache folder location |
| `-rebuildLibrary` | — | Delete `Library/` to force full reimport |
| `-useHub` | — | Launch with Hub integration |
| `-hubIPC` | — | Enable Editor<->Hub communication |
| `-hubSessionId` | `<id>` | Unique Hub session identifier |

---

## Common Patterns (Portals Project)

### CI Build (iOS)
```bash
Unity -batchmode -quit -projectPath ./unity \
  -buildTarget ios \
  -executeMethod BuildScript.PerformiOSBuild \
  -logFile ./build.log
```

### Run Edit Mode Tests (CI)
```bash
Unity -batchmode -quit -projectPath ./unity \
  -runTests -testPlatform EditMode \
  -testResults ./test-results.xml \
  -logFile ./test.log
```

### Headless Launch (suppress dialogs)
```bash
Unity -batchmode -nographics -quit \
  -accept-apiupdate -disable-assembly-updater \
  -projectPath ./unity \
  -executeMethod MyScript.Run \
  -logFile -
```

### Launch for MCP/Coplay (from ensure_unity_editor.sh)
```bash
Unity -projectPath ./unity \
  -accept-apiupdate -disable-assembly-updater \
  -logFile ./unity_editor.log
```

### Profile Startup
```bash
Unity -profiler-enable -deepprofiling \
  -profiler-log-file ./startup_profile.raw \
  -projectPath ./unity
```
