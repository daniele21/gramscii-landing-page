# Agent guidelines — Gramscii landing

- Keep the public page faithful to the existing Gramscii dark brand tokens in `brand-dark.css`. Do not introduce a consumer pastel theme or rounded display font without approval.
- Keep claims about local execution, source attribution, offline use, costs, GDPR and AI Act strictly scoped and evidence-backed.
- Demo content in `src/content.js` is fictional; never represent it as a real generated result.
- Runtime remains dependency-free, with no user tracking.
- Use `npm test` for deterministic validation and `bash .github/ci/local-test.sh` for the exact shared Mac runner lane.
- Shared CI runs via `daniele21/local-runner-infra`. Do **not** attach runners to this repo or target central runner labels from this repo's jobs.
- `.github/workflows/local-ci.yml` only dispatches an immutable SHA to the central Mac. Dispatch success does not mean CI success: verify commit status `local-ci/mac` and the central runner logs.
- Keep the hosted `quality.yml` job until the Mac status has been successfully demonstrated for the same commit and coverage.
- Do not dispatch untrusted fork commits to a Mac runner, download models or publish from local-test.sh.
- Never expose tokens or other secrets; onboarding instructions live in the README and https://github.com/daniele21/local-runner-infra/blob/main/docs/integration-guide.md.
