# Gemini Code Assistant Context

This document provides the necessary context for the Gemini Code Assistant to effectively assist with development in the `Unity-XR-AI` repository.

**Last Updated**: Wednesday, January 21, 2026

## KB Access (Mandatory)

Treat KB access as always-on:
1. Read `~/KnowledgeBase/_KB_INDEX.md`
2. Read `~/KnowledgeBase/_KB_ACCESS_GUIDE.md`
3. Run `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --dry-run`

If user asks about KB, provide a quick tour and examples:
- `kb "unity vfx depth binding"`
- `kbfix "CS0246"`
- `rg -n "VFXARBinder|ARDepthSource" ~/KnowledgeBase`

Prefer on-demand checks or cron (1-12h), not login items/daemons.

## Project Overview

This repository is a comprehensive infrastructure for "intelligence amplification" in Unity XR (AR/VR/MR) development. It combines a vast, token-optimized knowledge base with a suite of tools, AI agent configurations, and example projects to accelerate learning and development.

The core philosophy is to leverage existing knowledge and patterns before writing code from scratch.

**Main Components:**

*   **`KnowledgeBase/`**: 116 markdown files containing development patterns, 520+ GitHub repo references, and technical documentation.
*   **`GLOBAL_RULES.md`**: The master set of instructions and "Single Source of Truth" for all AI agents.
*   **`MetavidoVFX-main/`**: The primary active Unity project (Unity 6, AR Foundation 6).
*   **`AgentBench/`**: Unity research workbench containing engine source code and builtin shaders.
*   **`Vis/`**: 10+ 3D visualization frontends (Three.js, ECharts).
*   **`mcp-server/`**: Modular TypeScript MCP server for KB search.

## Current Status (Jan 21, 2026)

### Primary Pipeline: Hybrid Bridge
The project has transitioned to the **Hybrid Bridge** architecture in `MetavidoVFX-main`.
*   **Source**: `ARDepthSource` (Singleton compute dispatch for all VFX).
*   **Binder**: `VFXARBinder` (Lightweight per-VFX property mapping).
*   **Performance**: Verified 353 FPS with 10 active VFX on iOS.
*   **Legacy**: `OptimalARVFXBridge`, `VFXBinderManager`, and `VFXARDataBinder` are deprecated and have been moved to the root `.deprecated/` folder outside of `Assets/`.

### Active Specifications
*   **Spec 012 (Hand Tracking)**: Unified `IHandTrackingProvider` implemented with 5 backends (`HoloKit`, `XRHands`, `MediaPipe`, `BodyPix`, `Touch`).
*   **Spec 009 (Icosa/Sketchfab)**: Unified 3D model search and LRU caching system implemented.
*   **Spec 003 (Hologram Conferencing)**: WebRtc-based volumetric streaming in progress.

## Setup & Tools

### MCP Configuration
Gemini is configured to use MCP servers defined in `.ai/mcp/mcp.json`.
*   **unity**: Powered by `uvx` (v9.1.0) for rapid Unity Editor interaction.
*   **claude-mem**: Persistent memory via ChromaDB.
*   **github**: GitHub repository integration.
*   **Local Settings**: Optimized rules are stored in `.gemini/settings.json`.
*   **Reference**: See `KnowledgeBase/_GEMINI_UNITY_MCP_SETUP.md` for full command reference and optimization patterns.

### Core Workflow
1.  **Search KB First**: Use `grep` or `search_file_content` on `KnowledgeBase/` before writing code.
2.  **Verify via Unity MCP**: Check console errors (`read_console`) after every change (MANDATORY).
3.  **Optimize**: Use `batch_execute` for multiple Unity operations to save tokens.
4.  **Log Discoveries**: Append new findings to `KnowledgeBase/LEARNING_LOG.md`.

## Development Conventions

*   **Unity Version**: 6000.2.14f1 (Unity 6).
*   **Render Pipeline**: Universal Render Pipeline (URP 17).
*   **Style**: Mimic existing patterns in `MetavidoVFX-main/Assets/Scripts/`.
*   **Safety**: Use the `TryGetTexture` pattern for AR Foundation texture access to avoid initialization crashes.

**For detailed architectural principles, refer to `GLOBAL_RULES.md`.**
