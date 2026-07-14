---
name: bats-testing-patterns
description: Best-practice patterns for testing Bash scripts using Bats (Bash Automated Testing System). Cover setup/teardown, fixtures, mocking, assertions, and CI-friendly test organization.
risk: safe
source: "community"
date_added: "2026-07-11"
---

# Bats Testing Patterns

## Overview

Bats makes it easy to write tests for shell scripts. This skill focuses on repeatable, CI-friendly patterns: clean test setup/teardown, deterministic fixtures, good assertions, and isolating side effects.

## When to Use

- Testing Bash utilities and scripts
- Validating CLI behavior (exit codes, stdout/stderr)
- Creating repeatable tests with fixtures
- Running tests in CI without flakiness
- Testing pure functions and wrapper scripts

---

## Core Concepts

### Bats File Structure

A common organization:

- `test/` contains `*.bats`
- Each file groups related scripts/commands
- Use helper scripts for shared setup/utility

```text
test/
  cli-login.bats
  filesystem-utils.bats
  helpers/
    asserts.bash
```

### Arrange / Act / Assert (AAA)

- Arrange: create fixtures, set env vars
- Act: run the command under test
- Assert: check exit code, stdout, stderr

---

## Setup / Teardown Patterns

### Global Setup (test file level)

```bash
# test/cli-login.bats
setup() {
  export BASE_URL="http://example.test"
  mkdir -p "$TMPDIR/fixtures"
}

teardown() {
  rm -rf "$TMPDIR/fixtures"
}
```

### Per-Test Setup for Determinism

Use `setup()` to create fresh state for every test:

- Fresh temp directories
- Fresh mocked files
- Controlled env vars

---

## Fixtures & Temporary Data

### Use a Temporary Directory

```bash
setup() {
  TMPDIR="$(mktemp -d)"
}

teardown() {
  rm -rf "$TMPDIR"
}
```

### Fixture Loading

```bash
@test "loads config fixture" {
  cp "test/fixtures/config.json" "$TMPDIR/config.json"
  run my-cli --config "$TMPDIR/config.json"
  [ "$status" -eq 0 ]
  [[ "$output" == *"ready"* ]]
}
```

---

## Mocking External Dependencies

### Mock by PATH Precedence

Put a mock executable earlier in `PATH`:

```bash
setup() {
  MOCK_DIR="$TMPDIR/mocks"
  mkdir -p "$MOCK_DIR"
  export PATH="$MOCK_DIR:$PATH"
}

@test "uses mocked curl" {
  cat > "$MOCK_DIR/curl" <<'EOF'
#!/usr/bin/env bash
echo "mocked-response"
EOF
  chmod +x "$MOCK_DIR/curl"

  run my-script
  [ "$status" -eq 0 ]
  [[ "$output" == "mocked-response" ]]
}
```

### Mock by Environment Variables

If the script supports it, prefer env-driven injection:

- `MYCLI_HTTP_MODE=mock`
- `MYCLI_FAKE_TOKEN=...`

---

## Assertions & Output Checking

### Exit Code Assertions

```bash
run my-cli --unknown-arg
[ "$status" -eq 2 ]
```

### stdout / stderr Separation

Bats exposes:

- `$output` (combined stdout unless customized)
- `$stderr` (if captured/configured)

Pattern:

```bash
run my-cli --verbose
# Example checks (adapt if stderr separated in your harness)
[[ "$output" == *"VERBOSE"* ]]
```

### Exact vs Partial Matching

- Exact: `"$output" = "expected"`
- Partial: `[[ "$output" == *"substring"* ]]`

```bash
@test "prints help" {
  run my-cli --help
  [[ "$output" == *"Usage:"* ]]
}
```

---

## Testing Command-Line Interfaces

### Testing Flags

```bash
@test "supports --dry-run" {
  run my-cli deploy --dry-run
  [ "$status" -eq 0 ]
  [[ "$output" == *"Would deploy"* ]]
}
```

### Testing Usage of Exit Codes

```bash
@test "returns non-zero on invalid input" {
  run my-cli parse --input ""
  [ "$status" -ne 0 ]
}
```

---

## CI-Friendly Patterns

### Avoid Network / Time Dependency

- Mock HTTP calls
- Freeze time if needed (use env var/time provider injection)

### Keep Tests Fast

- Avoid large fixture downloads
- Use local fixtures
- Prefer small isolated tests

---

## Common Patterns Checklist

- [ ] Fresh temp directories per test
- [ ] Deterministic fixtures
- [ ] Mock external dependencies via PATH or env flags
- [ ] Assert exit codes
- [ ] Assert meaningful output (partial matching when stable)
- [ ] Avoid flakiness (no sleeps unless unavoidable)
- [ ] CI-friendly runtime

---

## Limitations

- Bats is best for shell-level testing, not complex integration suites
- For deep integrations, combine with higher-level test frameworks
- Stop and ask for required inputs if scripts depend on unavailable external systems
