# Clean Core Migration Cockpit — 11-Day Team Execution Plan

> **Basis and limitation:** This plan is based on the directory listing pasted in chat, not on the files themselves. The SAP project folder is not present in the current checkout; the checkout is AlgoViz 2.0. Paths and filenames below match the listing. Existing files are not assumed to be correct or complete. Inspect their contents on Day 1. New ABAP object names are proposals; confirm the tenant release and abapGit serialization before creating them.
>
> **Schedule:** 11 working days, four parallel assignments per day (44 tasks total). M1–M4 are role labels because member names were not supplied. Keep this as a build-and-test plan, not a learning roadmap.

## Goal and scope

Deliver a synthetic-data end-to-end cockpit slice: import the four existing CSV kinds (`objects`, `usage`, `findings`, `dependencies`), report bad rows, retain provenance, evaluate the rules already specified in `docs/rules-spec.md`, expose results through verified RAP services, and provide only the Fiori Elements flow supported by the assigned tenant. Finish with repeatable tests, runbook, screenshots, and demo.

- Use the four schemas in `data/templates/`. Do not add an evidence CSV or another import kind unless the actual `docs/data-contract.md` or approved requirements demand it.
- Treat the files in `data/sample-synthetic/`, `edge-cases/`, and `perf/` as test inputs only. Never describe their data as production observations.
- No direct browser CSV upload, RAP feature, OData version, identity/role mapping, deployment route, or Fiori project generator is assumed. Verify them on Day 1. If upload is unsupported, use verified server-side staged-row ingestion; if that is unsupported too, document interactive import as blocked rather than faking it.
- Do not create a React app or use browser storage as a backend. Use a Fiori Elements application generated or previewed only by a workflow verified on Day 1.
- Any rules, outcomes, risk thresholds, states, and role names must come from the actual project specification. Mark any agreed demo-only values as project policy, not SAP migration guidance.

## Member ownership

| Member | Owns | Must hand off |
|---|---|---|
| M1 | Persistence and import: `src/zccmc_data/`, `src/zccmc_import/`, import tests and CSV fixtures | Activated schemas, stable import contract, batch/error/provenance behavior, test results |
| M2 | Rules and analytics: `src/zccmc_core/`, rule tests, `docs/rules-spec.md` | Deterministic versioned evaluation, explanations, safe unresolved-input behavior, metrics |
| M3 | RAP workflow and security: `src/zccmc_rap/`, `docs/state-transitions.md`, feasibility limits | Verified service/actions, validated state transitions, authorization/audit/stale-update behavior |
| M4 | Fiori Elements, QA and integration: `src/zccmc_ui/`, integration tests and demo/docs | Supported UI, end-to-end results, screenshots, test evidence, final runbook/demo |

## Day-1 and Day-2 gates

**Day 1 — capability proof.** Record pass/fail evidence in `docs/feasibility-note.md` and `docs/runbook.md` for: assigned ABAP tenant/package; activation of the listed tables, CDS and classes; ABAP Unit execution; RAP root/actions/validation; service definition/binding and supported OData version; current-principal and role checks; authorization, ETag/locking; Fiori Elements preview/generation/deployment; CDS aggregation; approved synthetic-data loading; and a supported import path. Probe only capabilities the tenant permits. If a capability fails, record the smallest supported alternative and mark any blocked feature clearly.

**Day 2 — freeze the shared contract before parallel implementation.** Agree exact four CSV headers/types/keys; duplicate and corrected-import rules; reference validation; batch/row-error/provenance fields; rule input/output/version/explanation and tie/no-match/missing/unknown behavior; workflow states/actions/roles/audit; service shapes; and ownership. Update `docs/data-contract.md`, `docs/import-design.md`, `docs/rules-spec.md`, `docs/state-transitions.md`, `docs/architecture.md`, `docs/er-diagram.md`, and `docs/contribution-matrix.md`. M4 publishes the versioned contract; no incompatible coding starts before sign-off.

## 11-day tasks — four members every day

### DAY 1 — inspect the real baseline and verify SAP capabilities

#### M1-D01-T01 — inventory persistence and import baseline
**Targets / purpose / preconditions:** `.abapgit.xml`, `.gitignore`, `README.md`, `src/zccmc_data/*`, `src/zccmc_import/*`, `data/templates/*.csv`, `data/sample-synthetic/*.csv`, `docs/data-contract.md`, `docs/import-design.md`; actual project folder and ADT access must be available. Establish what exists, activates, and matches the CSVs.
**Do / expected behavior:** Inspect primary keys, fields, CDS associations, loader entry points and each exact template header; activate existing data objects without changing the contract. Record missing or inconsistent columns and import entry point.
**Tests / acceptance:** Activate every listed table/CDS; parse/read the four template headers; compare fields to storage. Pass when a baseline checklist names each object, activation result, schema gap and test command.
**Depends / deliverable:** None. Commit the baseline checklist and any approved Day-1-only fixes; record ADT transport IDs for SAP objects.

#### M2-D01-T01 — map rule inputs to available data
**Targets / purpose / preconditions:** `docs/rules-spec.md`, `docs/data-contract.md`, `docs/test-matrix.md`, all four `data/templates/*.csv`, sample CSVs and `src/zccmc_data/zccmc_i_*.ddls.asddls`; actual contents must be read. Establish whether each rule can be evaluated from imported fields.
**Do / expected behavior:** Make a rule-to-field map; identify missing, stale, unknown and conflicting inputs only where the specification/data model represents them. Do not invent outcomes or thresholds.
**Tests / acceptance:** For every rule condition, identify a persisted source field and at least one fixture row, or record a precise gap. Pass when the specification is fully traceable or explicitly blocked pending a contract decision.
**Depends / deliverable:** M1's actual field inventory. Commit the map/gap list to `docs/rules-spec.md` and `docs/test-matrix.md`.

#### M3-D01-T01 — prove RAP, identity and authorization capabilities
**Targets / purpose / preconditions:** `docs/feasibility-note.md`, `docs/runbook.md`, `src/zccmc_rap/.gitkeep`; assigned SAP tenant and permitted probe package are required. Avoid designing against unverified features.
**Do / expected behavior:** Probe CDS/RAP read service, behavior/action/validation, supported binding/OData, current-user lookup, role/authorization handler and ETag/lock handling. Record exact release, supported APIs and blockers.
**Tests / acceptance:** Activate and call one permitted minimal probe for each feature; verify allowed and denied identity paths if test roles exist. Pass only for observed results; otherwise state “blocked” and list the supported fallback.
**Depends / deliverable:** None. Commit capability matrix and probe/transport IDs to feasibility note and runbook.

#### M4-D01-T01 — prove the Fiori Elements workflow
**Targets / purpose / preconditions:** `src/zccmc_ui/fiori-app/zccmc_c_customobject.ddlx.asddlxs`, `src/zccmc_ui/fiori-app/.gitkeep`, `docs/feasibility-note.md`, `docs/runbook.md`; depends on tenant access and M3’s service capability result. Establish the only supported UI generation/preview route.
**Do / expected behavior:** Verify Fiori Elements preview or generation against a real supported service. Record the exact generator/runtime and output directory only if it actually generates one. Do not create a React/UI5 substitute.
**Tests / acceptance:** Open the generated/previewed object list against empty or synthetic data; capture one screenshot or a blocker. Pass when the UI route and supported action capabilities are evidenced.
**Depends / deliverable:** M3 capability probe. Commit the verified route/screenshot or blocker to the feasibility note.

### DAY 2 — freeze data, rules, workflow and service contracts

#### M1-D02-T01 — freeze the four-file import contract
**Targets / purpose / preconditions:** `docs/data-contract.md`, `docs/import-design.md`, `data/templates/{objects,usage,findings,dependencies}.csv`, all named edge-case CSVs. Day-1 field inventory is required.
**Do / expected behavior:** Specify exact headers/types, business keys, date formats, reference order, duplicate handling, corrected-batch semantics, row statuses/error codes, batch IDs, provenance, idempotency and limits. Keep exactly the four existing import kinds unless the source docs explicitly require more.
**Tests / acceptance:** Compare each template header with the data contract; map every edge-case file to one expected result. Pass when another member can predict accept/reject/update behavior for each row without interpretation.
**Depends / deliverable:** M1-D01-T01. Commit the versioned import contract and test expectations.

#### M2-D02-T01 — freeze deterministic rules and expected outputs
**Targets / purpose / preconditions:** `docs/rules-spec.md`, `docs/test-matrix.md`, `data/sample-synthetic/*.csv`; M1’s frozen fields and the actual rules document are required.
**Do / expected behavior:** Define rule-set version, input normalization, ordered evaluation, outcome, rationale/trace, priority/score only when already specified, and safe handling for missing/unknown/stale inputs, no match and equal-priority conflicting matches. Do not label demo policy as SAP guidance.
**Tests / acceptance:** Write one expected result per fixture object plus explicit missing/unknown/no-match/tie cases that the model can represent. Pass when each result is deterministic and points to the rule/input that produced it.
**Depends / deliverable:** M1-D02-T01. Commit the frozen v1 rule and golden-test table.

#### M3-D02-T01 — freeze workflow, action and security contract
**Targets / purpose / preconditions:** `docs/state-transitions.md`, `docs/data-contract.md`, `docs/feasibility-note.md`; actual state/action specification and Day-1 capability result are required.
**Do / expected behavior:** Freeze only specified states/actions; define permitted principal/role, transition validation, mandatory override reason, separation of duties, append-only audit fields and stale-update response. Choose ETag/lock handling only if Day 1 proved it; otherwise state the limitation.
**Tests / acceptance:** Build an allowed/denied transition table, including missing override reason, same approver/submitter and stale version. Pass when every action has a server-side validation and an explicit expected error.
**Depends / deliverable:** M3-D01-T01. Commit the workflow/API contract and blocker alternatives.

#### M4-D02-T01 — publish the shared integration contract
**Targets / purpose / preconditions:** `docs/architecture.md`, `docs/er-diagram.md`, `docs/contribution-matrix.md`, `docs/test-matrix.md`, plus the D2 contracts from M1–M3. Resolve parallel ownership before coding.
**Do / expected behavior:** Publish entities, fields, keys, relationships, enumerations, service names, action names, error shapes, team ownership and daily handoffs. Mark new ABAP objects as proposed, not already present.
**Tests / acceptance:** All four members review the same contract version; run a path/name search against the posted tree; every required task maps to a file/object owner. Pass with no unresolved interface mismatch.
**Depends / deliverable:** M1/M2/M3 D2 drafts. Commit one canonical contract version; this is the coding gate.

### DAY 3 — activate the data layer, rule core, RAP skeleton and first list

#### M1-D03-T01 — activate and align persistence objects
**Targets / purpose / preconditions:** `src/zccmc_data/zccmc_sourcesys.tabl.xml`, `zccmc_custobj.tabl.xml`, `zccmc_usage.tabl.xml`, `zccmc_finding.tabl.xml`, `zccmc_depend.tabl.xml`, `zccmc_impbatch.tabl.xml`, `zccmc_improwerr.tabl.xml` and all listed `zccmc_i_*.ddls.asddls`. D2 contract is frozen.
**Do / expected behavior:** Fix only agreed key/type/association gaps; ensure source system, object identity, usage, finding, dependency, batch and row-error records preserve the frozen contract. Add decision/audit/recommendation tables only if D2 documents require persistence and M4 signs the ERD. If Day 1 proves staged-row CRUD is the supported import fallback, add proposed `zccmc_improw.tabl.xml` and its `zccmc_i_importrow.ddls.asddls` with only the staging fields/size frozen on Day 2; if neither upload nor staging is supported, do not create a fake UI import.
**Tests / acceptance:** Activate every changed object; insert/read one synthetic row per agreed entity; verify foreign keys/business keys by test. Pass when all required fields are usable by the importer and consumers.
**Depends / deliverable:** M1-D02-T01/M4-D02-T01. Commit abapGit objects and transport IDs; update `docs/er-diagram.md`.

#### M2-D03-T01 — create the rule-engine core
**Targets / purpose / preconditions:** Proposed `src/zccmc_core/zccmc_cl_rule_engine.clas.abap`; D2 rule contract and activated CDS/data fields are required. Implement business logic separately from RAP/UI.
**Do / expected behavior:** Provide contract-aligned methods such as `EVALUATE_OBJECT`, `RESOLVE_MATCHES`, and `BUILD_EXPLANATION`; record the rule-set version, chosen rule(s), outcome and unresolved inputs. Use only source fields and precedence frozen on Day 2.
**Tests / acceptance:** Add initial tests for one fixture object, missing/unknown input, no match and tie. Pass when repeated evaluation returns byte-for-byte stable outcome/trace for the same inputs.
**Depends / deliverable:** M2-D02-T01 and M1-D03-T01. Commit class and initial ABAP Unit coverage.

#### M3-D03-T01 — create the verified RAP read/service skeleton
**Targets / purpose / preconditions:** `src/zccmc_rap/`; use existing `zccmc_i_customobject`, `zccmc_i_importbatch`, and `zccmc_i_importrowerror` as sources where supported. D1/D2 service contract is required.
**Do / expected behavior:** Create read exposure for custom objects, batches and row errors; create behavior/service/binding objects using only the verified tenant workflow. Preserve the frozen key and error fields; no mock UI endpoint.
**Tests / acceptance:** Activate service artifacts and issue a read for empty and one synthetic object; verify metadata keys/fields against D2. Pass when supported clients can read the agreed contract.
**Depends / deliverable:** M3-D01-T01, M4-D02-T01 and M1-D03-T01. Commit abapGit objects/transport IDs; record the real binding name.

#### M4-D03-T01 — deliver the first Fiori Elements object list
**Targets / purpose / preconditions:** `src/zccmc_ui/fiori-app/`, `zccmc_c_customobject.ddlx.asddlxs`; service from M3-D03-T01 and verified generation/preview route required.
**Do / expected behavior:** Configure a List Report for the supported custom-object service; retain generated files only when the verified workflow creates them. Include the agreed object identity and initial navigation to Object Page.
**Tests / acceptance:** Open list with zero rows and one synthetic row; confirm key fields and navigation work. Pass only with the supported Fiori Elements runtime, not a hand-made substitute.
**Depends / deliverable:** M4-D01-T01 and M3-D03-T01. Commit generated/configured artifacts and a screenshot or an explicit UI blocker.

### DAY 4 — implement CSV parsing, rule tests, import API and feedback

#### M1-D04-T01 — complete CSV parsing and row validation
**Targets / purpose / preconditions:** `src/zccmc_import/zccmc_cl_csv_adapter.clas.abap`, `zccmc_cl_import_validator.clas.abap`, `zccmc_if_source_adapter.intf.abap`; frozen D2 schemas required.
**Do / expected behavior:** Implement header/column validation, quoting/escaping, type/date conversion, required-field checks and typed row errors. Keep validation independent of persistence; do not expose upload unless Day 1 verified it.
**Tests / acceptance:** Run `objects_empty.csv`, `objects_duplicate_keys.csv`, and `usage_malformed_date.csv`; assert the D2 exact row status/error code and no partial invalid write. Pass when template CSVs parse without header drift.
**Depends / deliverable:** M1-D02-T01 and M1-D03-T01. Commit parser/validator plus `zccmc_ut_import_validator.clas.abap` updates.

#### M2-D04-T01 — add rule-engine regression tests
**Targets / purpose / preconditions:** Proposed `src/zccmc_test/zccmc_ut_rule_engine.clas.abap`, `src/zccmc_core/zccmc_cl_rule_engine.clas.abap`, `docs/test-matrix.md`. D2 golden outputs required.
**Do / expected behavior:** Add tests for every fixture outcome, version trace, explanation, missing/unknown/stale representations, no match and equal-priority tie. Use no test output that is absent from the actual specification.
**Tests / acceptance:** Run the complete rule class test; repeat with input row order changed. Pass when all outcomes and explanations match D2 oracle deterministically.
**Depends / deliverable:** M2-D02-T01/M2-D03-T01. Commit ABAP Unit class and recorded results.

#### M3-D04-T01 — implement the supported import entry path
**Targets / purpose / preconditions:** `src/zccmc_rap/` and existing import classes; Day-1 capability result and D2 input contract required. Do not claim direct file upload works without proof.
**Do / expected behavior:** If a bounded RAP CSV parameter and FE extension were proven, implement that one path. Otherwise expose verified staged-row CRUD plus a `PROCESS_BATCH`-equivalent action; if neither is supported, keep repeatable ABAP Unit ingestion and report interactive import blocked.
**Tests / acceptance:** Submit one valid and one invalid synthetic batch through the selected supported path; check authorization, validation response and persisted batch/error metadata. Pass when the documented path matches what the tenant executes.
**Depends / deliverable:** M3-D01-T01, M1-D04-T01 and M4-D02-T01. Commit service objects/transport ID and update feasibility/runbook.

#### M4-D04-T01 — show batch status and row errors
**Targets / purpose / preconditions:** Verified `src/zccmc_ui/fiori-app/` workflow, M3 batch/error service, and D2 import contract. If no generated FE extension path exists, do not add custom frontend code.
**Do / expected behavior:** Add the supported batch list/error detail and clearly label staged-row import when that is the route. Show error code, row reference and correction guidance from the service.
**Tests / acceptance:** Display one successful and one invalid batch; verify row errors match the CSV validator and are not hidden. Pass when unsupported upload is not presented as an active control.
**Depends / deliverable:** M3-D04-T01. Commit generated/configured UI artifacts and screenshot or blocker.

### DAY 5 — load all four kinds, evaluate recommendations and create decision service

#### M1-D05-T01 — connect orchestrator, loaders and batch manager
**Targets / purpose / preconditions:** `zccmc_cl_import_orchestrator.clas.abap`, `zccmc_cl_import_batch_mgr.clas.abap`, four `zccmc_cl_import_*_loader.clas.abap` files and existing idempotency/edge tests. D2 load order/keys frozen.
**Do / expected behavior:** Process objects, usage, findings and dependencies in agreed order; preserve batch, row and source provenance; reject nonexistent references with typed errors; make repeat imports follow the D2 idempotency policy.
**Tests / acceptance:** Import all four `data/sample-synthetic/*.csv`; repeat the same batch; then import `objects_corrected_batch.csv`. Verify exact row counts, duplicate/update policy, provenance and no duplicate business keys.
**Depends / deliverable:** M1-D04-T01/M1-D03-T01. Commit loaders/orchestrator and update `zccmc_ut_import_idempotency.clas.abap`.

#### M2-D05-T01 — evaluate imported objects and persist/display trace as contracted
**Targets / purpose / preconditions:** `zccmc_cl_rule_engine.clas.abap`, agreed recommendation persistence (if required by D2), `docs/rules-spec.md`; all import entity views and golden oracle ready.
**Do / expected behavior:** Evaluate each imported object, return outcome, rule-set version, explanation, matched rule IDs and unresolved input list; persist a snapshot only if the frozen model calls for it. Never change SAP custom code.
**Tests / acceptance:** Evaluate every `objects.csv` fixture after associated usage/findings/dependencies import; compare outcome and explanation with D2 oracle; re-evaluate unchanged data for stable output. Pass with complete trace.
**Depends / deliverable:** M2-D03-T01, M2-D04-T01, M1-D05-T01. Commit implementation and test results.

#### M3-D05-T01 — expose decision root and allowed actions
**Targets / purpose / preconditions:** `src/zccmc_rap/`, `docs/state-transitions.md`, M1’s D3 persistence objects if required; service/action/role capability must be verified.
**Do / expected behavior:** Expose the decision root and only the frozen create/assign/submit/approve/override actions actually specified. Validate state on the server; write audit events append-only. Do not invent a lifecycle if the source docs differ.
**Tests / acceptance:** Create one decision, read it, attempt one valid and one invalid transition; verify state and audit record. Pass when action metadata and resulting values match the transition table.
**Depends / deliverable:** M3-D02-T01, M1-D03-T01, M3-D03-T01. Commit behavior/service objects and test evidence.

#### M4-D05-T01 — complete object detail with source data and recommendation
**Targets / purpose / preconditions:** `src/zccmc_ui/fiori-app/zccmc_c_customobject.ddlx.asddlxs`, verified FE workflow, object and recommendation services. Use existing CDS annotations plus generator-supported extensions only.
**Do / expected behavior:** Add available usage, finding, dependency and recommendation explanation sections to Object Page; show missing data without implying it exists. Provide navigation to the decision only if the service is live.
**Tests / acceptance:** Open a fully populated object and one with missing optional data; confirm values, explanation and empty-state behavior. Pass when page fields match service metadata.
**Depends / deliverable:** M2-D05-T01, M3-D05-T01, M4-D03-T01. Commit annotations/generated UI and screenshots.

### DAY 6 — finish analytics, provenance, workflow validation and decision UI

#### M1-D06-T01 — harden provenance, corrections and batch error persistence
**Targets / purpose / preconditions:** `zccmc_cl_import_batch_mgr.clas.abap`, `zccmc_cl_import_orchestrator.clas.abap`, `zccmc_impbatch.tabl.xml`, `zccmc_improwerr.tabl.xml`, import tests. D2 batch/error contract required.
**Do / expected behavior:** Ensure each accepted/rejected row can be traced to file kind, batch, source row/key and error; corrected re-import follows the frozen policy without deleting prior audit/provenance.
**Tests / acceptance:** Run malformed date, unknown-object finding, duplicate objects, empty object file and corrected batch fixtures. Verify batch summary totals equal accepted + rejected rows and prior-batch provenance remains.
**Depends / deliverable:** M1-D05-T01. Commit fixes and update `docs/import-design.md`/`docs/runbook.md`.

#### M2-D06-T01 — implement portfolio analytics from persisted data
**Targets / purpose / preconditions:** Proposed `src/zccmc_core/zccmc_cl_portfolio_analytics.clas.abap`, available CDS sources, `docs/test-matrix.md`; D2 metric definitions required.
**Do / expected behavior:** Compute only agreed counts/groupings (for example source system, outcome, priority or evidence status if those fields exist); avoid double-counting joined usage/findings/dependencies. Use CDS aggregation only if Day 1 proved support, otherwise aggregate safely in the service layer.
**Tests / acceptance:** Compare each metric with hand-counted fixture rows and a filtered subset; include empty portfolio. Pass when totals reconcile and filters do not inflate counts.
**Depends / deliverable:** M2-D02-T01, M1-D03-T01/M1-D05-T01. Commit class and `zccmc_ut_portfolio_analytics.clas.abap` tests.

#### M3-D06-T01 — enforce workflow authorization and stale-update rules
**Targets / purpose / preconditions:** RAP decision behavior/pool in `src/zccmc_rap/`, `docs/state-transitions.md`; current principal/roles and concurrency capability must be proven.
**Do / expected behavior:** Enforce allowed state/role per action, mandatory override reason, different submitter/approver where specified, append-only audit and verified ETag/lock or documented fallback. Never rely on disabled UI buttons as security.
**Tests / acceptance:** Test allowed role, denied role, invalid state, blank override reason, same-principal separation, and stale version. Pass when every server response matches the frozen contract; mark unsupported protections blocked.
**Depends / deliverable:** M3-D05-T01 and M3-D01-T01. Commit behavior tests and update limitations/runbook.

#### M4-D06-T01 — add portfolio and decision Fiori Elements views
**Targets / purpose / preconditions:** `src/zccmc_ui/fiori-app/`, verified RAP metadata, M2 analytics and M3 decision actions. Only generated/verified FE workflow files are in scope.
**Do / expected behavior:** Add a portfolio overview and decision list/object workflow using agreed filters and actions; display service errors, no-data state and busy state. Hide/label actions accurately when blocked.
**Tests / acceptance:** Verify empty/populated portfolio, filtered totals, a permitted action and a denied server action. Pass when UI shows real service results and cannot bypass server validation.
**Depends / deliverable:** M2-D06-T01, M3-D06-T01, M4-D05-T01. Commit FE artifacts and screenshots.

### DAY 7 — integrate importer, rules, workflow, service and UI

#### M1-D07-T01 — verify cross-file reference order and transaction behavior
**Targets / purpose / preconditions:** All import loaders/orchestrator and four sample CSVs. The contract must specify dependency/reference ordering and partial-batch policy.
**Do / expected behavior:** Ensure source/object rows are available before dependent usage/finding/dependency rows; return row-level `UNKNOWN_OBJECT`/target errors as specified; do not leave an undocumented half-batch.
**Tests / acceptance:** Import a clean set in documented order, reverse the order, and run `findings_unknown_object.csv`; verify expected accepted/rejected counts and persisted transaction behavior. Pass when batch totals and DB state match D2 policy.
**Depends / deliverable:** M1-D05-T01 and M1-D06-T01. Commit integration fix and update import design.

#### M2-D07-T01 — verify explanations and unresolved-evidence fallbacks end-to-end
**Targets / purpose / preconditions:** `zccmc_cl_rule_engine.clas.abap`, imported fixtures, `docs/rules-spec.md`; exact available fields and D2 oracle required.
**Do / expected behavior:** Ensure trace and rationale survive service projection; missing/unknown/stale inputs, no match and ties use the approved safe result. Do not create evidence facts unsupported by a CSV/model.
**Tests / acceptance:** Evaluate complete, incomplete/unknown where represented, no-match and equal-priority fixture cases through the same service path used by UI; verify outcome, rule version, explanation and missing codes.
**Depends / deliverable:** M2-D05-T01 and M3-D03-T01. Commit rule/service regression results.

#### M3-D07-T01 — integrate OData service actions and error responses
**Targets / purpose / preconditions:** `src/zccmc_rap/`, import service from D4, decision service from D5/D6, and verified binding. Freeze endpoint names on Day 2.
**Do / expected behavior:** Connect reads, import processing, recommendation read and decision actions under one consistent metadata contract; return row/business validation errors with stable codes; preserve server authorization.
**Tests / acceptance:** Call each agreed operation once with valid data and once with invalid data; verify HTTP/OData error and persistence state. Pass when generated FE metadata parses and no action bypasses validation.
**Depends / deliverable:** M3-D04-T01/M3-D06-T01 and M1/M2 D5–D6. Commit service integration and test log.

#### M4-D07-T01 — run the first full Fiori end-to-end slice
**Targets / purpose / preconditions:** Verified app path under `src/zccmc_ui/fiori-app/`, all services, and synthetic fixture reset/import instructions.
**Do / expected behavior:** From the supported UI entry point, load/browse an object, inspect recommendation, view import errors, and create/advance one permitted decision. Use staged rows instead of upload when that is the verified route.
**Tests / acceptance:** Run once from clean data and once with an invalid row. Confirm the UI matches backend result, error and audit. Pass with a short recorded test log and screenshots.
**Depends / deliverable:** M1/M2/M3 D7 tasks. Commit E2E test evidence and defects list.

### DAY 8 — edge cases, performance and security regression

#### M1-D08-T01 — run edge fixtures and 1k/10k import measurements
**Targets / purpose / preconditions:** `data/sample-synthetic/edge-cases/*`, `data/sample-synthetic/perf/objects_1000.csv`, `objects_10000.csv`, import tests and `docs/test-matrix.md`. D2 defines acceptable performance target or records that only a baseline is available.
**Do / expected behavior:** Run all edge files and both performance files through the same supported parser/loader; record tenant, runtime, row counts, errors and elapsed time. Optimize only proven bottlenecks.
**Tests / acceptance:** Assert 1,000 and 10,000 input row counts and idempotency; assert empty/duplicate/unknown/malformed/corrected results from D2. Pass when no row is silently lost and measured result meets the agreed target or is an explicit blocker.
**Depends / deliverable:** M1-D07-T01. Commit results and update test matrix/runbook.

#### M2-D08-T01 — run complete rules determinism/regression suite
**Targets / purpose / preconditions:** `zccmc_ut_rule_engine.clas.abap`, complete sample set and `docs/rules-spec.md`. Golden expected results must be frozen.
**Do / expected behavior:** Re-run every outcome, rationale, version, missing/unknown/stale case, no-match and tie; verify input ordering cannot alter results and unrelated records cannot leak into explanations.
**Tests / acceptance:** Compare full result tuples across two clean runs and permuted rows to the golden table. Pass only with all ABAP Unit tests green and no undocumented rule or threshold.
**Depends / deliverable:** M2-D07-T01. Commit test log and rule version.

#### M3-D08-T01 — run authorization and stale-update negative tests
**Targets / purpose / preconditions:** RAP behavior, test identities/roles, `docs/state-transitions.md`; actual authorization fixture and ETag support required.
**Do / expected behavior:** Exercise every protected action as permitted and denied principals; attempt stale update/approval and invalid transition; verify audit is appended only for accepted actions.
**Tests / acceptance:** Assert denied requests leave business state/audit unchanged; stale requests return the agreed conflict; valid requests append exactly one event. If tenant cannot test roles/concurrency, report it as not verified.
**Depends / deliverable:** M3-D06-T01/M3-D07-T01. Commit test evidence and limitations.

#### M4-D08-T01 — run UI empty/error/filter regression
**Targets / purpose / preconditions:** Supported Fiori Elements app, `docs/test-matrix.md`, service error cases and synthetic data.
**Do / expected behavior:** Verify loading, empty list, service error, populated object, filters, batch row errors and action visibility in the supported runtime; capture browser screenshots with no live customer data.
**Tests / acceptance:** Replay clean/invalid batch and denied-action paths; compare displayed counts/errors with API. Pass when no UI state reports a blocked feature as successful.
**Depends / deliverable:** M4-D07-T01. Commit screenshots and test log.

### DAY 9 — fix defects and make docs match the build

#### M1-D09-T01 — close persistence/import defects
**Targets / purpose / preconditions:** Changed `src/zccmc_data/`, `src/zccmc_import/`, import test classes, `docs/import-design.md` and `docs/runbook.md`; D8 defect list is required.
**Do / expected behavior:** Fix only reproducible schema/import defects; keep frozen keys/status/error/provenance contract; remove duplicate or dead code only when tests prove safe.
**Tests / acceptance:** Re-run validator, edge-case, idempotency and full import suite including 10k data if time target permits. Pass with zero known P0/P1 import defects and current runbook commands.
**Depends / deliverable:** M1-D08-T01. Commit fixes and linked test results.

#### M2-D09-T01 — close rules/analytics defects and freeze v1
**Targets / purpose / preconditions:** `src/zccmc_core/`, `src/zccmc_test/`, `docs/rules-spec.md`, `docs/test-matrix.md`; D8 findings required.
**Do / expected behavior:** Correct only reproducible rule/metric defects; align documentation to actual precedence, outputs, explanations and version. Do not expand outcomes or add thresholds.
**Tests / acceptance:** Re-run all golden rules and analytics reconciliation tests against clean sample data. Pass when every displayed metric/result is traceable and docs match code.
**Depends / deliverable:** M2-D08-T01. Commit v1 freeze and test report.

#### M3-D09-T01 — close service/security defects and record blockers
**Targets / purpose / preconditions:** `src/zccmc_rap/`, `docs/feasibility-note.md`, `docs/limitations.md`, `docs/runbook.md`; D8 negative tests required.
**Do / expected behavior:** Fix reproducible service/action/authorization errors; make service metadata and error codes match D2 contract; document any unsupported role or stale-update protection explicitly.
**Tests / acceptance:** Re-run valid/invalid action, authorization, audit and stale-update tests. Pass when no UI-only security check exists and all unverified capability claims are removed.
**Depends / deliverable:** M3-D08-T01. Commit service changes and updated limitations.

#### M4-D09-T01 — close cross-layer issues and refresh user docs
**Targets / purpose / preconditions:** Generated FE app, `docs/architecture.md`, `docs/test-matrix.md`, `docs/demo-script.md`, `docs/runbook.md`, screenshots; D8 issue list required.
**Do / expected behavior:** Fix integration mismatches; update navigation/field labels and supported import route; ensure demo/runbook use only tested features and synthetic data.
**Tests / acceptance:** Execute documented runbook from a reset; verify every screenshot corresponds to the current app and every demo step is backed by a passing test.
**Depends / deliverable:** M1/M2/M3 D9 fixes. Commit docs and updated screenshots.

### DAY 10 — clean reset, acceptance run and demo rehearsal

#### M1-D10-T01 — prove reproducible data reset and import
**Targets / purpose / preconditions:** `docs/runbook.md`, all four `data/sample-synthetic/*.csv`, import classes and batch/error tables; release candidate required.
**Do / expected behavior:** Follow reset procedure; load the four fixture files in documented order; export/record counts and batch provenance without changing production data.
**Tests / acceptance:** Two consecutive clean runs must produce the same object/business-key counts and expected per-file accepted/rejected totals; re-import must follow idempotency policy. Pass with saved run log.
**Depends / deliverable:** M1-D09-T01. Commit reset/import evidence and final runbook.

#### M2-D10-T01 — sign off recommendation and metric oracle
**Targets / purpose / preconditions:** `docs/rules-spec.md`, fixture output table, rules/analytics test classes; M1 clean-run data required.
**Do / expected behavior:** Reconcile every fixture result, explanation, version and portfolio metric against the frozen oracle; publish the exact expected demo outputs.
**Tests / acceptance:** Independently recount fixture inputs and compare to service output; run full rules/analytics suites. Pass when there are no unexplained rows, outcomes or metric differences.
**Depends / deliverable:** M2-D09-T01/M1-D10-T01. Commit sign-off and test log.

#### M3-D10-T01 — rehearse workflow with allowed and denied roles
**Targets / purpose / preconditions:** Supported roles/test identities, decision UI/service, `docs/state-transitions.md`, audit reads.
**Do / expected behavior:** Rehearse one valid lifecycle and one rejected override/transition using actual test principals; show state and audit event; do not claim production SSO/role mapping if only a sandbox role was tested.
**Tests / acceptance:** Verify final state, actor separation, reason and append-only audit; verify rejected action leaves state unchanged. Pass with role/capability limitation stated.
**Depends / deliverable:** M3-D09-T01/M4-D09-T01. Commit rehearsal evidence and limitations.

#### M4-D10-T01 — rehearse the 10–12 minute end-to-end demo
**Targets / purpose / preconditions:** `docs/demo-script.md`, `docs/runbook.md`, current screenshots, passing acceptance tests and synthetic reset.
**Do / expected behavior:** Rehearse import/alternative staging route, one row error, recommendation explanation, portfolio filter, decision action/audit and test evidence. Remove unsupported steps from the script.
**Tests / acceptance:** Complete start-to-finish within 10–12 minutes from a clean state; verify every screen matches current service data; record blockers and time. Pass with signed rehearsal checklist.
**Depends / deliverable:** M1/M2/M3 D10 and M4-D09-T01. Commit final demo script/screenshots.

### DAY 11 — final acceptance, handoff and release decision

#### M1-D11-T01 — deliver persistence/import package and test evidence
**Targets / purpose / preconditions:** All `src/zccmc_data/`, `src/zccmc_import/`, import test classes, data templates/fixtures and runbook. D10 reset test required.
**Do / expected behavior:** Freeze schemas, loaders, error/provenance behavior and delivery identifiers; list exact activated table/CDS/class objects and any unsupported import path.
**Tests / acceptance:** Run all import ABAP Unit tests plus named edge fixtures and repeat import; confirm all test results and object activations are recorded. Pass with clean abapGit status and no open P0/P1 import defect.
**Depends / deliverable:** M1-D10-T01. Commit release note/test results and ADT transport IDs.

#### M2-D11-T01 — deliver rules/analytics v1
**Targets / purpose / preconditions:** `src/zccmc_core/`, `src/zccmc_test/`, `docs/rules-spec.md`, golden output and metric tests.
**Do / expected behavior:** Freeze the versioned rules, explanation/trace fields, unresolved-input fallback and portfolio calculation; clearly separate project demo policy from SAP guidance.
**Tests / acceptance:** Run all rule and analytics tests twice on clean fixtures; verify version, stable output, no-match/tie handling and metric totals. Pass with no undocumented rules or P0/P1 defect.
**Depends / deliverable:** M2-D10-T01. Commit release note, frozen rule version and test report.

#### M3-D11-T01 — deliver verified RAP workflow or explicit blocker
**Targets / purpose / preconditions:** `src/zccmc_rap/`, service metadata, `docs/state-transitions.md`, `docs/feasibility-note.md`, `docs/limitations.md`.
**Do / expected behavior:** Freeze only activated/read-tested RAP services/actions; verify authorization, validation, audit and stale-update results to the level proved by the tenant. Label every unsupported capability as blocked.
**Tests / acceptance:** Run agreed service contract and negative workflow tests; confirm action list, state changes and errors against the D2 matrix. Pass with no fabricated role, binding or concurrency claim.
**Depends / deliverable:** M3-D10-T01. Commit final RAP artifacts/transport IDs or signed blocker list.

#### M4-D11-T01 — perform final regression and hand off the demo
**Targets / purpose / preconditions:** Supported `src/zccmc_ui/fiori-app/`, all `docs/*.md`, screenshots and test evidence from M1–M3.
**Do / expected behavior:** Run the complete test matrix and 10–12 minute demo once more; make `README.md`, `docs/runbook.md`, `docs/demo-script.md`, `docs/limitations.md` and screenshots agree with the released build.
**Tests / acceptance:** Verify import→recommendation→decision→audit in a clean synthetic run; test empty/error UI; confirm no unsupported feature is presented as working. Pass with all blockers, test outcomes and handoff owner recorded.
**Depends / deliverable:** M1/M2/M3 D11 sign-off. Commit final QA report, screenshots and demo handoff.

## Integration and handoff gates

| Gate | Owner handoff | Required result before next work |
|---|---|---|
| End Day 1 | M1/M2/M3/M4 → all | Actual object/field inventory; SAP capability pass/fail evidence; FE/import alternatives recorded |
| End Day 2 | All → all | One signed data, rule, workflow, service and ownership contract; no parallel coding against different fields |
| End Day 3 | M1 → M2/M3/M4 | Activated data/CDS contract; M2 engine compiles; M3 service metadata available; M4 first supported list works |
| End Day 5 | M1/M2/M3 → M4 | Repeatable imports, recommendation trace and live decision service; UI binds only to real services |
| End Day 7 | All → all | One clean synthetic end-to-end slice plus invalid-row/error path |
| End Day 8 | All → M4 | Edge, performance, rules and security test results with blockers recorded |
| End Day 10 | All → release | Reproducible reset/import and timed demo; no untested demo steps |
| End Day 11 | M1/M2/M3 → M4/reviewer | Release checklist, test evidence, ADT IDs, runbook, screenshots and limitations |

## Exact test matrix

| Area | Exact input/action | Expected result to assert |
|---|---|---|
| Clean imports | `data/sample-synthetic/objects.csv`, then `usage.csv`, `findings.csv`, `dependencies.csv` in the frozen order | Row totals and stored business keys match Day-2 contract; every accepted row has batch/source provenance |
| Empty file | `edge-cases/objects_empty.csv` | Zero accepted object rows; no crash; batch summary follows frozen empty-file status |
| Duplicate key | `edge-cases/objects_duplicate_keys.csv` | Exact duplicate policy from contract; no silent duplicate business key; row errors identify offending input row |
| Bad date | `edge-cases/usage_malformed_date.csv` | Bad row rejected with frozen date error; valid rows, if any, follow partial-batch policy |
| Unknown reference | `edge-cases/findings_unknown_object.csv` | Row rejected with typed unknown-object error; no orphan finding |
| Corrected/repeat import | `edge-cases/objects_corrected_batch.csv`; then replay same sample batch | Corrected row behavior and provenance follow contract; repeated import is idempotent; no duplicate object |
| Performance | `perf/objects_1000.csv`, `perf/objects_10000.csv` | Assert input/output/error counts; record tenant, elapsed time and agreed target result; no silent truncation |
| Rules | Every row in `sample-synthetic`; missing/unknown/stale/no-match/tie cases representable by frozen fields | Outcome, rule version, matched rule, explanation and unresolved-input list equal the D2 golden table; repeat and row permutation are deterministic |
| Workflow/security | Every allowed action; invalid state; denied role; blank override reason; same submitter/approver; stale ETag/version | Allowed transition changes state and appends one audit event; rejected action leaves state/audit unchanged; stale update returns agreed conflict |
| Fiori | Empty data, populated object, invalid batch, service error, filters and denied action | Loading/empty/error states render; metrics/errors match service; no hidden client-side authorization claim |
| Delivery | Clean reset, full test run, demo replay | Runbook reproduces the same fixture counts; all test results and blockers are recorded |

## Day-11 acceptance checklist

- [ ] The exact project tree and contents were inspected; all file/object changes are in the stated owners’ areas.
- [ ] Day-1 SAP/ADT/RAP/OData/Fiori/identity/import capabilities have evidence; unsupported paths are marked blocked.
- [ ] Day-2 shared contracts are frozen and implementation matches them.
- [ ] Four CSV templates parse; sample imports, empty, duplicate, malformed date, unknown reference, corrected and repeated imports pass their exact assertions.
- [ ] Row errors, import batches and provenance are inspectable; no orphan references or duplicate business keys remain.
- [ ] Rules are versioned, deterministic, explained and covered for represented missing/unknown/stale/no-match/tie cases; no undocumented outcome/threshold was added.
- [ ] Workflow actions validate server-side state/role/reason/separation/audit/stale updates to the extent proven by the environment.
- [ ] Fiori Elements is delivered only through the verified tenant workflow; no unsupported upload/authentication is claimed.
- [ ] 1k/10k performance measurements, full ABAP Unit output, integration tests and negative security tests are recorded.
- [ ] `README.md`, architecture, contribution matrix, data contract, ER diagram, feasibility note, import design, limitations, rule spec, runbook, state transitions, test matrix and demo script match the delivered build.
- [ ] Synthetic-only demo is reproducible in 10–12 minutes; screenshots and handoff artifacts are saved.
- [ ] Every remaining blocker has an owner, impact and supported next step; no unresolved P0/P1 defect is presented as accepted.

## Demo sequence (10–12 minutes)

1. **0:00–1:00 — scope and capability note:** show the supported tenant path, synthetic-data label and any blocked capability.
2. **1:00–3:00 — import:** load the four sample CSVs through the verified upload or staged-row route; show batch counts and provenance.
3. **3:00–4:00 — validation:** replay one malformed/unknown-reference row; show typed row error and corrected-batch handling.
4. **4:00–6:00 — recommendation:** open an object; show version, explanation, matched rule and missing/unknown fallback when represented.
5. **6:00–7:00 — portfolio:** show agreed metrics and filter; reconcile counts to the fixture/test matrix.
6. **7:00–9:00 — workflow:** perform one allowed transition, demonstrate override reason/separation rule if specified, then show appended audit; show one rejected action.
7. **9:00–10:30 — quality evidence:** show ABAP Unit, edge/performance results and clean reset/runbook.
8. **10:30–12:00 — limitations and handoff:** state what was verified, what remains blocked, and where the source/docs/tests live.
