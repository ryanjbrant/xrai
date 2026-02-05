#!/bin/bash
# Wrapper - delegates to brainmux module
exec "$(dirname "$0")/../modules/brainmux/sync.sh" "$@"
