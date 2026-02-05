#!/bin/bash
# Wrapper - delegates to module
exec "$(dirname "$0")/../modules/ai-toolchain-sync/sync.sh" "$@"
