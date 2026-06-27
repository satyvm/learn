# Instructions for the `teach` skill in this workspace

This workspace is configured to support **multiple sets of lessons (topics)** instead of just a single topic.

When operating in this workspace using the `teach` skill, you MUST follow these customized guidelines, which override the default `teach` skill directory structure:

## 1. Topic-Specific Subdirectories

Each distinct topic should be contained within its own separate subdirectory, rather than at the root of the workspace.

- Format: `topic-name/` (e.g., `python-basics/`, `yoga-poses/`, `topic-01/`).
- Inside EACH topic's subdirectory, maintain the standard `teach` skill structure:
  - `MISSION.md`
  - `./lessons/*.html`
  - `./reference/*.html`
  - `./learning-records/*.md`
  - `RESOURCES.md`
  - `NOTES.md`

## 2. Global `home.html` Hub

There should be a single `home.html` file in the root of the workspace.

- This file acts as the main index or hub for all topics and lessons.
- Every time you create a new topic or a new lesson, you MUST update `home.html` in the root directory to include a link to the new topic and its newly created lessons.
- The `home.html` page should be beautiful, clean, and nicely formatted (e.g., using modern CSS, clean typography) to allow easy navigation across different topics.

## 3. Creating Lessons

When the user asks to learn a new topic:

1. Determine a suitable directory name for the topic (e.g., `machine-learning/`).
2. Initialize the topic directory with a `MISSION.md` and appropriate subdirectories.
3. Create lessons inside `topic-name/lessons/`.
4. Update the global `home.html` to link to the new topic and its lessons.

When the user asks to continue learning an existing topic, locate the appropriate `topic-name/` directory, create the next lesson in its `lessons/` folder, and update `home.html`.

## Example Directory Structure

```text
workspace-root/
├── AGENTS.md
├── home.html
├── topic-01-python/
│   ├── MISSION.md
│   ├── RESOURCES.md
│   ├── lessons/
│   │   ├── 0001-hello-world.html
│   │   └── 0002-variables.html
│   └── learning-records/
└── topic-02-yoga/
    ├── MISSION.md
    └── lessons/
        └── 0001-downward-dog.html
```

When interacting with the user, always remember that their learning state is distributed across these topic folders, and `home.html` serves as their main entry point.

Always make the learning materials in Dark Mode.
