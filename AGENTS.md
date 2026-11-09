# Publishing this project

- In Ethan's checkout, sync each coherent, verified set of task-owned changes to the public `EthanSK/claude-in-codex` repository as you go. Do not leave publication for a later task or claim a change is synced before the remote commit is verified.
- Before pushing, confirm `origin` is Ethan's repository, inspect the exact diff, run checks appropriate to the change, and exclude credentials, local state, and unrelated or unfinished edits. Preserve concurrent work.
- If a change cannot be published or the push fails, report exactly what remains local. In other people's clones, do not push to Ethan's repository without their explicit authorization.

# Replacing model versions

- When installing a new model version in the bar, remove the old version from the visible list. Keep its route hidden for existing chats, and verify the running bar shows the replacement without the old button. User-requested — 2026-11-09.
- Prefer model-data updates that do not reinstall Codex or interrupt running GPT or Claude chats. Distinguish a prepared source change from support verified in the installed service.
