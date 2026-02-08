# Barely Managing Manuscript Workspace

This folder implements the manuscript plan for *Barely Managing* on the traditional query track.

## Plan Snapshot

- Objective: query-ready package and manuscript draft (`60,000-75,000` words)
- Timeline: February 9, 2026 to August 9, 2026
- Workflow: outline first, AI first draft, weekly review loop, revision lock
- Default manuscript target: `68,000` words

## Folder Layout

- `templates/`: reusable drafting interfaces
- `research/`: anonymized anecdote inventory and source validation notes
- `tracker/`: chapter status and cadence tracking
- `outline/`: chapter briefs and detailed outlines for all 17 chapters
- `chapters/`: chapter drafts and polished samples
- `query-package/`: submission-ready assets for agents
- `manuscript/`: assembled manuscript files and export sources

## Implemented Milestones

- Phase 1 foundation artifacts complete:
  - chapter brief template
  - anecdote cards inventory
  - draft tracker schema and chapter rows
  - full chapter briefs and detailed outlines
- Phase 2 and 3 anchor deliverables drafted:
  - Chapter 10 polished sample
  - Chapter 12 polished sample
  - chapter-by-chapter synopses
  - query letter draft + full package notes

## Cadence Rules

- Weekly chapter review checkpoint every Friday
- Only one chapter is allowed to roll over into the next week
- Chapters 9-13 must explicitly map Team, Role, Business, and Legal/Ethical bases
- Every chapter ends with manager actions (checklist or reusable decision framework)

## Build EPUB

To build an EPUB from the assembled manuscript source:

```bash
pandoc /Users/ariw/code/llm-nonsense/barely-managing/manuscript/barely-managing-manuscript.md \
  -o /Users/ariw/code/llm-nonsense/barely-managing/manuscript/barely-managing-manuscript.epub \
  --toc
```
