#!/bin/bash
# Wrapper - delegates to open-multibrain module
exec "$(dirname "$0")/../modules/open-multibrain/sync.sh" "$@"
