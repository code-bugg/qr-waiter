# Git Workflow

This repository promotes changes through the environments in this order:

```text
feature branch → dev → stage → main (production)
```

Each change must be tested after it is merged into `dev`, `stage`, and `main` before it is considered complete.

## Branch rules

- `main`: production code. Keep it stable and deployable.
- `stage`: release-candidate code for final pre-production testing.
- `dev`: shared integration environment for completed feature work.
- `feature/*`: short-lived branches for individual changes.
- Never commit directly to `dev`, `stage`, or `main`. Use a pull request.

Use a descriptive feature-branch name, for example:

```text
feature/add-order-status
fix/invalid-qr-code
chore/update-dependencies
```

## 1. Start from the latest `main`

Before creating a branch, update your local copy of `main`:

```bash
git switch main
git fetch origin
git pull --ff-only origin main
```

The `--ff-only` option prevents Git from creating an unexpected merge commit while updating your local branch.

## 2. Create and test a feature branch

Create the new branch from the updated `main`:

```bash
git switch -c feature/short-description
```

Make the change, then run the project checks locally. Replace the examples below with the commands defined by the project:

```bash
pnpm lint
pnpm test
pnpm build
```

Commit focused changes with a clear message:

```bash
git status
git add .
git commit -m "Add order status"
```

Push the branch and open a pull request into `dev`:

```bash
git push -u origin feature/short-description
```

The pull request should include what changed, how it was tested, and any screenshots or notes needed by the reviewer.

## 3. Merge into `dev` and test

After review and passing checks:

1. Merge the pull request from `feature/short-description` into `dev`.
2. Deploy or update the `dev` environment.
3. Test the complete change in `dev`, including relevant integration and regression checks.

If problems are found, fix them on the same feature branch, push the fix, and repeat the review and `dev` testing process.

Once the change has merged successfully into `dev`, delete the feature branch:

```bash
git push origin --delete feature/short-description
git branch -d feature/short-description
```

If the branch was not fully merged, use `git branch -D` only after confirming that no work will be lost.

## 4. Promote the tested changes to `stage`

When the changes in `dev` have passed testing, open a pull request from `dev` into `stage`:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
```

Open and merge the pull request:

```text
dev → stage
```

After the merge:

1. Deploy or update the `stage` environment.
2. Run final QA, acceptance tests, and any release-specific checks.
3. Do not promote the change to production until stage testing passes.

## 5. Promote the approved changes to production

After `stage` testing is complete and approved, open a pull request from `stage` into `main`:

```text
stage → main
```

After the pull request is approved and merged:

1. Deploy `main` to production according to the release process.
2. Run the production smoke tests.
3. Confirm that monitoring and error reporting are normal.

Keep the production merge focused on changes that have already passed `dev` and `stage` testing.

## 6. Keep local branches clean

After a pull request is merged, synchronize your local branch list:

```bash
git fetch --prune
git branch --merged
```

Delete local feature branches only when they are merged and no longer needed:

```bash
git branch -d feature/short-description
```

Delete the remote feature branch after it has merged into `dev`:

```bash
git push origin --delete feature/short-description
```

Do not delete `dev`, `stage`, or `main`. These are shared environment branches.

## Quick checklist

- [ ] Update local `main` from `origin/main`.
- [ ] Create a short-lived feature branch from `main`.
- [ ] Make the change and run local checks.
- [ ] Open a pull request: `feature/* → dev`.
- [ ] Test after merging into `dev`.
- [ ] Delete the feature branch after the `dev` merge.
- [ ] Open a pull request: `dev → stage`.
- [ ] Test and approve in `stage`.
- [ ] Open a pull request: `stage → main`.
- [ ] Deploy and smoke-test production.
- [ ] Prune stale local remote-tracking branches.

