# Verification Log: Textbook Content ("book")

**Feature**: `001-book` | **Created**: 2026-08-10 | **Plan**: [plan.md](./plan.md) (decision D5)

Execution status of every code example in the book. One row per example.

**This file is repo-side only.** It is authoring scaffolding and must never appear in, or be
referenced by, reader-facing content (plan D5, FR-020).

---

## Why this exists

Constitution Principle II requires every code example to be executed and to produce the stated
result before its chapter is complete. The development machine is Windows with no ROS 2, Gazebo,
or Isaac installed, so most examples cannot be executed at authoring time.

Rather than let that gap resolve silently, "done" is split in two:

| State | Meaning |
|---|---|
| `drafted` | Written, reviewed by both agents, all blockers fixed, site builds. Code **not** executed. |
| `verified` | Every example executed in the target environment, producing the stated result. |

**A chapter is `verified` only when every one of its rows below reads `executed`. Only `verified`
is done.** Reporting a `drafted` chapter as complete is a defect.

---

## Status values

| Status | Meaning | Resolution |
|---|---|---|
| `executed` | Run by the author; produced the stated result | none needed |
| `pending-env` | Not run; the environment exists but is not yet stood up | task T037 |
| `blocked` | Not run; the required environment is **not available at all** | needs a hardware or access decision |

`pending-env` and `blocked` are deliberately different. `pending-env` has a scheduled resolution.
`blocked` does not — it needs someone to decide something.

## Environments

| Key | What it is | Covers |
|---|---|---|
| `local-python` | Python on the authoring machine | plain-Python examples with no ROS dependency |
| `ros:jazzy-desktop` | `osrf/ros:jazzy-desktop` Docker image under WSL2 (research R2, preferred) | Module 1 fully; headless Gazebo for most of Module 2 |
| `ubuntu-24.04-gui` | Native or VM Ubuntu 24.04 with a display | Gazebo GUI, Unity (Module 2) |
| `rtx-gpu` | Ubuntu 24.04 + RTX-class NVIDIA GPU, CUDA 13.0+, driver 580+ | Module 3 only. **No software substitute** |

---

## Log

Target platform for every example: **ROS 2 Jazzy Jalisco · Ubuntu 24.04 (Noble) · Gazebo Harmonic**
(spec Assumption 2).

| Chapter | Example | Status | Environment required | Date checked | Note |
|---|---|---|---|---|---|
| _(no chapters written yet)_ | | | | | |

---

## Summary

| Metric | Count |
|---|---|
| Examples logged | 0 |
| `executed` | 0 |
| `pending-env` | 0 |
| `blocked` | 0 |
| Chapters `verified` | 0 of 14 |

Update this table whenever rows are added or a status changes (tasks T012, T019, T026, T032, T037).
