---
name: code-review
description: Review a vision-mobile React Native change (diff, branch, PR or file) against this repo's own shipped-bug traps: action sheet return values, setNativeProps caret, safe-area edges, editor teardown order, notification routing copies, SDK mutation wrappers, EStyleSheet theming.
argument-hint: [file-or-branch]
---

# Code Review

Architecture, commands, TypeScript and ESLint rules live in CLAUDE.md. This file holds
only traps that have already shipped bugs here. Confirm each finding against the code
on disk before reporting it.

## Action sheets

- [ ] **Resolve an object, gate on a named field.** This is a repo convention with a
  reason, not something the library enforces. `react-native-actions-sheet` 0.9.7
  publishes `data || payloadRef.current || data` on close (`dist/src/index.js:408`)
  where `payloadRef` tracks `<ActionSheet>`'s own `payload` prop
  (`dist/src/index.js:87` and `:139`). The provider hands the `SheetManager.show`
  payload to the registered component (`dist/src/provider.js:160`) but no sheet in
  `src/` forwards it on to `<ActionSheet>`, so `payloadRef.current` is `undefined`
  today and a falsy resolve survives: `if (!result) return false;` at
  `src/providers/sdk/mobilePlatformAdapter.ts:317` reads a dismissal correctly. One
  added `payload={payload}` on an `<ActionSheet>` would silently turn every falsy
  cancel into a truthy confirm, which is why sheets resolve `{ cancelled: true }` or
  `{ field: value }` instead. Six sheets document the contract, e.g.
  `src/components/searchFiltersSheet/searchFiltersSheet.tsx`. Callers test the field,
  abridged from `src/screens/searchResult/screen/searchResultScreen.tsx:65-77`:
  ```ts
  const result = await SheetManager.show(SheetNames.SEARCH_FILTERS, {
    payload: { filters, searchValue: clipSearchValue(searchInputValue) },
  });
  if (result && typeof result === 'object' && result.filters) { ... }
  ```
- [ ] **Sheets unmount on hide**, so mount-time resets are enough and every cleanup
  runs on every close (CLAUDE.md, Sheets). Reject "state persists between invocations".
- [ ] **A throw in a sheet render or cleanup is fatal:** `SheetProvider` wraps
  `<Application/>` (`src/index.tsx:39-43`), outside `ErrorBoundary`
  (`src/screens/application/index.tsx:17`). Watch native objects in cleanups.
- [ ] **Payloads freeze at show time.** A handler in a payload keeps the closure it had
  when the sheet opened, so route it through a ref
  (`src/components/quickPostModal/quickPostModalContent.tsx:565-575`).
- [ ] **Missing `SheetDefinition`?** `everySheetHasDefinition`
  (`src/navigation/sheets.tsx:358`) fails typecheck and names it. Keys are string
  literals, never `[SheetNames.X]`.

## Caret on programmatic writes

- [ ] **`setNativeProps({ text })` on its own moves the caret.** Android's
  `updateExtraData` keeps the caret's DISTANCE FROM THE END, so it lands inside the
  text just written and the next keystroke splits it. Pass `selection` whenever the
  caret position after the write matters: inserts and appends into existing text, plus
  full replacements of a focused field. A reset to `text: ''` does not need it. 20 call
  sites, of which 3 pass `selection`:
  `src/components/quickPostModal/quickPostModalContent.tsx:559` and `:604`, plus
  `src/components/markdownEditor/view/markdownEditorView.tsx:371`.

## Editor teardown order

- [ ] **Pending work drains before the save, not in a child cleanup.**
  `componentWillUnmount` runs in the commit phase ahead of every descendant effect
  cleanup, so the screen calls `flushPendingEditorWork()` then `_saveDraftToDB()`
  (`src/screens/editor/screen/editorScreen.tsx:116-127`). Register new deferred editor
  work via `registerPendingFlush`
  (`src/components/uploadsGalleryModal/mediaInsertQueue.ts:33`), never a local cleanup.

## Safe area

- [ ] **`edges` REPLACES the defaults, it does not add to them.** `edges={['bottom']}`
  removes the top inset. The top inset is the screen's job: a screen rendering
  `BasicHeader` wraps it in its own `SafeAreaView`
  (`src/components/basicHeader/view/basicHeaderStyles.ts:13`), while child components
  and `Modal` bodies inherit the screen's. Modals use
  `Platform.select({ ios: [], default: ['top'] })`.

## Notification routing

Three separate copies whose type strings do NOT match. A new type must be added to
every copy it should reach.

- [ ] Tap routing: the switch at
  `src/screens/application/hook/useInitApplication.tsx:222-302` handles 15 types
  (`vote`, `unvote`, `mention`, `follow`, `unfollow`, `ignore`, `reblog`,
  `scheduled_published`, `favorite`, `bookmark`, `reply`, `transfer`, `inactive`,
  `spin`, `hiveuri`); its `default` does nothing.
- [ ] Websocket to FCM bridge: the allowlist at
  `src/screens/application/container/applicationContainer.tsx:891-901` admits 8 types
  (`mention`, `reply`, `transfer`, `delegations`, `scheduled_published`, `payouts`,
  `account_update`, `weekly_earnings`). Each one also needs a case in the title/body
  switch at `:914`, whose `default` announces a bare `@source`.
- [ ] Foreground banner: the allowlist at
  `src/components/foregroundNotification/foregroundNotification.tsx:51-58` admits five
  (`reply`, `mention`, `transfer`, `delegations`, `scheduled_published`); anything else
  shows nothing. Its own `_onPress` (`:127`) routes `transfer` and `delegations` to the
  wallet, everything else to a post.

Mind the singular/plural split: tap routing matches `favorite`, the list and websocket
paths match `favorites`/`payouts`.

## SDK, queries, styling, i18n

- [ ] Mutation wrappers are two imports plus a four-line function: `useMutationAuth()`
  from `src/providers/sdk/mutations/common.ts` then the SDK hook (45 call sites). No
  key decryption or HiveSigner/HiveAuth branching in one; the adapter owns that.
- [ ] Optional query params need `enabled: !!param` (38 call sites).
- [ ] Mobile-only keys come from `QUERIES`, the DEFAULT export of
  `src/providers/queries/queryKeys.ts` (10 importers); SDK-owned data uses `QueryKeys`
  from `@ecency/sdk`.
- [ ] DMCA lists are set once by `ConfigManager.setDmcaLists` in
  `src/providers/queries/sdk-config.ts:69`; a hand-rolled filter in a query is a
  finding.
- [ ] `vestsToHp(vests, hivePerMVests)` takes TWO args and returns `0` when either is
  falsy (`src/utils/conversions.ts`), so a missing rate renders a silent 0.
- [ ] Colors come from theme vars: `'$primaryBackgroundColor'` inside
  `EStyleSheet.create` (262 files) or `EStyleSheet.value('$primaryBlue')` at runtime.
  A literal hex in a style is a finding.
- [ ] Text via `intl.formatMessage({ id: 'section.key' })`, key added to the NESTED
  `src/config/locales/en-US.json`; ids are dotted only because `flattenMessages`
  flattens the tree in `src/index.tsx`.
- [ ] Redux reads use `useAppSelector` plus a selector from `src/redux/selectors`
  (265 calls); a raw `useSelector` is a finding. Handlers are `_`-prefixed
  (496 `const _handle*`/`const _on*` against 114 unprefixed).

## Report

Group as inline (must fix), outside-diff (should fix), nitpick. Per finding:
`**[BUG|SECURITY|PERF|STYLE|NITPICK]** file:line`, then what is wrong, why it matters
and the fix. Gate on `yarn lint`, `yarn typecheck` (empty baseline, any error fails CI)
and `yarn test:ci`.
