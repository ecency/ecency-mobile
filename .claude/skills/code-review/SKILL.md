---
name: code-review
description: Review code changes for bugs, pattern violations, and common pitfalls in ecency-mobile
argument-hint: [file-or-branch]
disable-model-invocation: true
---

# Code Review

Review code for bugs, anti-patterns, and issues specific to the ecency-mobile codebase.

## How to Review

1. **Read the changed files** — understand what changed and why
2. **Verify each finding against current code** — don't assume; read the actual file before flagging
3. **Categorize findings** by severity:
   - **Inline (must fix)**: Bugs, security issues, data corruption risks
   - **Outside-diff (should fix)**: Issues in unchanged code exposed by the change
   - **Nitpick (nice to have)**: Style, naming improvements
4. **Only flag what's confirmed** — if a finding doesn't apply to current code, skip it

## What to Check

### React & Hooks
- [ ] **Missing cleanup in useEffect** — addEventListener needs removeEventListener, setInterval needs clearInterval
- [ ] **Missing dependencies** in useMemo/useCallback/useEffect arrays
- [ ] **setState on unmounted components** — async callbacks may fire after unmount
- [ ] **Stale state in callbacks** — event handlers capturing stale closure values

### Class Components (Legacy)
- [ ] **Missing setState guards** — async callbacks setting state after unmount
- [ ] **Stale `this.state` in async flows** — use callback form: `this.setState((prev) => ...)`
- [ ] **Missing cleanup in componentWillUnmount** — timers, subscriptions

### React Query / SDK
- [ ] **Undefined parameter guards** — queries must use `enabled: !!param` when params can be undefined
- [ ] **Cache key consistency** — use `QueryKeys` from `src/providers/queries/queryKeys.ts` or SDK
- [ ] **Missing invalidation** — mutations should invalidate affected queries
- [ ] **Infinite query pageParam** — `getNextPageParam` must return `undefined` (not `null`) to stop pagination

### SDK Mutations
- [ ] **Authority level mismatch** — posting vs active must match the Hive operation
- [ ] **Missing auth context** — mutation wrappers must use `useMutationAuth()` from `./common.ts`
- [ ] **Manual auth handling** — don't decrypt keys or handle HiveSigner/HiveAuth in wrappers; the adapter does this

### Sheets (Action Sheets)
- [ ] **State not reset on payload change** — sheets stay mounted; state persists between invocations
- [ ] **Missing SheetDefinition** — TypeScript definition needed in `sheets.tsx` for payload/returnValue
- [ ] **Unhandled undefined return** — backdrop tap returns undefined; callers must handle this

### Styling
- [ ] **Hardcoded colors** — use EStyleSheet `$variables` for theme support
- [ ] **Missing dark mode** — new styles should use theme variables, not literal colors
- [ ] **Platform-specific issues** — test on both iOS and Android; use `Platform.select()` when needed

### Hive Blockchain Specific
- [ ] **RPC response validation** — don't trust API responses blindly
- [ ] **Vesting share format** — `vestsToHp()` expects string format (e.g., "123.456789 VESTS")
- [ ] **DMCA filtering** — post queries should filter flagged content via SDK

### i18n
- [ ] **Hardcoded strings** — use `intl.formatMessage({ id: 'key' })` for all user-facing text
- [ ] **Missing locale keys** — new strings must be added to `src/config/locales/en-US.json`
- [ ] **Format inconsistency** — keys use dot notation: `"section.action"` (e.g., `"transfer.confirm"`)

### Common Bug Patterns Found in This Codebase

1. **Stale isAmountValid state** — validation flags not reset when inputs clear or errors occur
2. **Silent no-ops in auth fallbacks** — empty case blocks that silently do nothing for certain auth types
3. **Race conditions in async setState** — multiple concurrent state updates in class components
4. **Missing error.message extraction** — error objects displayed as `[object Object]` instead of `.message`
5. **Inconsistent validation** — amount validated against minimum in one path but not maximum (available balance)
6. **Unused props not cleaned up** — TypeScript interface still declares props that are no longer passed

## Output Format

For each finding:
```
**[SEVERITY]** file:line — Description
- What's wrong
- Why it matters
- Suggested fix
```

Severities: `BUG`, `SECURITY`, `PERF`, `STYLE`, `NITPICK`
