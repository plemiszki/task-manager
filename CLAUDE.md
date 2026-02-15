# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Ruby 4.0.1** / **Rails** / **PostgreSQL**
- **Sidekiq** (Redis) for background jobs
- **React 19** bundled with **Webpack 5** (Node 24)
- **Clearance** for authentication
- **Montrose** for recurring task scheduling

## Commands

```bash
# Start Rails server
bundle exec rails server

# Start Sidekiq worker (required for background jobs)
bundle exec sidekiq

# Frontend — watch mode for development
npm run dev

# Run tests
bundle exec rails test
```

## Architecture Overview

### Request Flow: Two-Layer Controller Pattern

1. **Public controllers** (`static_pages_controller.rb`, plus resource controllers for lists, recipes, etc.) — render ERB views containing a single `<div>` that React mounts into.
2. **API controllers** (`app/controllers/api/*`) — handle all mutations (create/update/destroy) and return JSON via Jbuilder. All API responses use **camelCase keys**.

### Frontend: handy-components Library

The React frontend uses the **`handy-components`** npm library for generic CRUD:

- **`SimpleDetails`** — declarative detail/edit form. Pass `entityName` and `fields` config; it auto-generates the UI and wires up GET/PUT/DELETE to matching API routes.
- **`FullIndex`** — sortable, paginated index table with optional "new entity" modal.

The entry point is `frontend/entry.jsx`. On `DOMContentLoaded`, it scans for known element IDs and mounts the appropriate component. Webpack bundles everything to `app/assets/javascripts/bundle.js`.

Complex pages (TasksIndex, RecurringTasksIndex, FutureTasksIndex, GroceryListDetails) have dedicated custom components in `frontend/components/`.

### Task Model: Hierarchy and Duplication

Tasks support multi-level nesting via self-referential `parent_id`. Key patterns:

- **Subtasks**: Tasks belong to a parent; a task auto-completes when all subtasks are complete.
- **Duplicates**: A task can be duplicated across timeframes via `duplicate_id`, keeping them linked.
- **Joint tasks**: Shared between users via `joint_id`; completion syncs across users.
- **Timeframes**: `day`, `weekend`, `month`, `year`, `life`, `backlog`.
- **Numbered subtasks syntax**: Text matching `$-- text$n` creates n numbered subtasks.

### Background Jobs: ResetTasks Worker

The `ResetTasks` Sidekiq worker runs daily (or on-demand via `POST /api/reset_tasks_early`) and:

- Creates task instances from recurring task patterns (Montrose gem)
- Converts future tasks to daily tasks when their date arrives
- Deletes completed/expired tasks
- Handles joint task synchronization

Job progress is tracked via the `Job` model with `current_value`/`total_value`/`status` fields and JSONB `metadata`. The frontend polls `GET /api/jobs` to check status.

### Redis Usage

Beyond Sidekiq job queueing, Redis is used directly for:
- Active grocery list state (`"active-list"` key)
- Daily reset preferences (`"daily-reset-early"` key)

### Drag-and-Drop Reordering

Many entities have a `position` column and a `rearrange` PATCH endpoint. The frontend passes a `{ position: id }` mapping. Applies to: tasks, list items, recurring tasks, grocery section items.

### Error Handling Convention

The `RenderErrors` concern transforms ActiveRecord validation errors to camelCase JSON and returns status 422 via `render_errors(@entity)`.

### Key Features Beyond Tasks

- **Lists & ListItems** — reusable task templates that can be added as subtasks
- **Recipes & RecipeItems** — linked to grocery items
- **Grocery management** — stores, sections, items, and shopping lists
- **Future tasks** — scheduled to appear on a specific date
- **Recurring tasks** — configurable recurrence patterns (daily/weekly/monthly) via Montrose
