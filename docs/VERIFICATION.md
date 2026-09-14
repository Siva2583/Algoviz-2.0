# Verification — interview-focused edition

## Automated repository checks

- `npm test`: 14 passing test groups; each sorting group covers edge cases and 20 seeded datasets, output correctness, input preservation, deterministic frames and final ID uniqueness.
- Window reference checked against a brute-force oracle for 64 arrays × 12 targets.
- Playback bounds, completion retention, replay and seek/pause transitions.
- Validation failures, deterministic dataset generation and counterexample search.
- Pathfinder repeatability/input preservation/reachability and prefix-range validation.
- `npm run lint`: whole-repository check. See README for the narrow legacy effect-rule exception.
- `npm run build`: production build with lazy route chunks.
- Dependency audit: zero reported vulnerabilities at verification time. This is not a security certification.

## Browser verification performed

Headless Chromium, desktop 1440px and mobile 390px:

- Landing → sorting navigation.
- Step forward/back, play/pause, timeline seek and completed-state retention.
- Save at a selected frame; browser reload and restore.
- Invalid input error, comparison panel and counterexample answers/search.
- Valid experiment import restores its cursor; invalid import and invalid algorithm query are handled.
- Sorting tutorial expansion and two consecutive BFS runs complete successfully.
- No horizontal document overflow on overview, lab, counterexample and library at 390px.
- Ten preserved non-sorting routes mounted without uncaught browser errors.

These are smoke checks, not complete visual regression, screen-reader, WCAG or performance certification. Legacy routes were mount-tested, not every algorithm exhaustively interaction-tested. New lab screenshot inspection was performed. Browser tooling was used outside the project; no browser automation runtime was added to the application stack.

## Known boundaries

Full-snapshot traces run synchronously with a 24-element limit. No worker, code interpreter, benchmark harness or backend. Legacy non-sorting pages retain partial state/playback debt. Model/AI explanations do not exist. Save/export contain input/configuration/cursor, not a full engine-version archive: future changes to algorithm event order can change the meaning of an old cursor.

## Unified UI follow-up

- All ten non-sorting module visualization and learning views checked at 390, 768 and 1440 px: no horizontal document overflow or uncaught browser errors.
- Nine run/pause/resume workflows checked after extracting shared page chrome.
- BFS completion, experiment-picker navigation, N-Queens playground and tutorial switching checked.
- Original sorting/comparison/save/import/counterexample smoke checks rerun successfully.
- Shared neutral styling preserves diagram state colors. This pass did not change algorithm implementations.
