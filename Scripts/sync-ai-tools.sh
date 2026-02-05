#!/bin/bash
# Wrapper - delegates to brainlink module
exec "$(dirname "$0")/../modules/brainlink/sync.sh" "$@"
