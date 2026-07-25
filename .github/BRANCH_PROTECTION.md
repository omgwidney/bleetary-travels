# Recommended `main` branch protection

This repository does not currently have a GitHub remote, so branch protection
cannot be enabled from the local workspace. After connecting the repository,
configure a ruleset for `main` with:

- pull requests required before merging;
- one approving review;
- dismissal of stale approvals after new commits;
- required status checks: `Verify` and `End-to-end`;
- conversation resolution required;
- force pushes and branch deletion blocked;
- administrator bypass disabled for normal development.
