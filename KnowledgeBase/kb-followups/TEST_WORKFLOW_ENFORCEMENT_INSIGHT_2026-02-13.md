# KB Insight: Auto Test Workflow Enforcement Snapshot

Date: February 13, 2026
Scope: Portals rapid dev/test/debug ladder hardening

## Insight

Low-risk workflow hardening is strongest when each policy statement has a concrete trigger and a fast, repeatable guard check.

## Enforced Points (Exact References)

- Canonical rapid runner and hard Expo tunnel gate:
  - `scripts/run_all_tests.sh:58`
  - `scripts/run_all_tests.sh:120`
  - `scripts/run_all_tests.sh:127`
- Drift guard (phase order + required docs/scripts):
  - `scripts/enforce_test_workflow.sh:29`
  - `scripts/enforce_test_workflow.sh:41`
  - `scripts/enforce_test_workflow.sh:43`
- Local push enforcement:
  - `.githooks/pre-push:5`
- CI enforcement on PR/push:
  - `.github/workflows/ci.yml:21`
- Standard command entrypoint:
  - `package.json:24`
- Developer workflow definition:
  - `README.md:41`
- Full matrix definition:
  - `docs/AUTOMATED_TESTING_GUIDE_MATRIX.md:1`
- Policy ladder lock-in:
  - `GLOBAL_RULES.md` (test ladder section)

## Verification Evidence

- `bash -n scripts/run_all_tests.sh` passed
- `bash -n scripts/enforce_test_workflow.sh` passed
- `./scripts/enforce_test_workflow.sh` passed
  - Output:
    - `🔒 test-workflow-guard: validating enforced ladder`
    - `✅ test-workflow-guard: all invariants satisfied`

## Operational Rule

For workflow changes, keep this minimum set:

1. One enforcement change (script/hook/CI)
2. One docs update (README + matrix or equivalent)
3. One executable verification proof
