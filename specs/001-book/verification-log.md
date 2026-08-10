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
| 1.1 Introduction to Physical AI & Embodied Intelligence | `sense_think_act.py` — plain-Python sense–think–act loop | `executed` | `local-python` | 2026-08-10 | Run on Python 3.14.2 (Windows), three times independently: by the writer, by `code-verifier`, and by the orchestrator after the fix pass. Code block extracted programmatically from the `.mdx` each time and diffed byte-for-byte against the chapter's stated output: identical. Deterministic across repeated runs. Seeded with `random.Random(7)`; noise drawn from `random()` only, which the standard library guarantees reproducible across versions. Source parses under the 3.8 grammar (`ast.parse(feature_version=(3, 8))`), supporting the chapter's "Python 3.8 or newer" claim. All four exercises executed as variants; `code-verifier` corrected two overstated self-checks (seeds 1 and 3 give identical results; the proportional-policy run is 3.46× the cycles, not 3×) and one misattribution in the walkthrough (the −0.010 m stopping error is discretization from the 0.03 m creep step, not sensor noise — confirmed by re-running with the noise term zeroed). |
| 1.2 ROS 2 Architecture: Nodes, Topics, Services | `range_sensor.py` + `pilot.py` — talker/listener pair over the `/gap` topic | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed** — no ROS 2 on the authoring machine. Static verification only: `ast.parse` + `py_compile` clean, `pyflakes` zero findings, Jazzy init/shutdown idiom confirmed (no context-manager form, no `ExternalShutdownException`, no `AsyncNode`). `example_interfaces/msg/Float64` confirmed to exist on the `jazzy` branch; both ends agree on topic name, type and queue depth. Structurally matches `ros2/examples@jazzy` `publisher_member_function.py` / `subscriber_member_function.py`. **Unconfirmed until run**: the two console-output blocks (log-line format and timestamp shape were confirmed against `rcutils@jazzy` `logging.c`/`time.c`, but the actual emitted lines were never observed). |
| 1.2 ROS 2 Architecture: Nodes, Topics, Services | `motion_gate.py` + `enable_motion_client.py` — service server/client on `/enable_motion` | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed** — no ROS 2 on the authoring machine. Static verification only: parse clean, `pyflakes` zero findings, Jazzy idiom confirmed. `std_srvs/srv/SetBool` confirmed in `ros2/common_interfaces@jazzy` and correctly attributed to `std_srvs`. Client pattern (`rclpy.create_node` → `create_client` → `wait_for_service` → `call_async` → `spin_until_future_complete`) matches `ros2/examples@jazzy` `minimal_client` line-for-line in structure; `(request, response)` callback contract confirmed. **Unconfirmed until run**: the emitted log lines. |
| 1.2 ROS 2 Architecture: Nodes, Topics, Services | CLI inspection sequence — `ros2 node list`, `topic list -t`, `topic info`, `topic echo`, `interface show`, `service list`, `service type`, `service call` | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed.** Output *shapes* confirmed against `ros2cli@jazzy` source (`ros2topic/verb/info.py`, `list.py`, `ros2service/verb/call.py`, `ros2interface/verb/show.py`). Both `ros2 interface show` blocks are character-exact reproductions of `example_interfaces/msg/Float64.msg` and `std_srvs/srv/SetBool.srv` on the `jazzy` branch, comments included. Review corrected the `ros2 service list` block: an `rclpy` node on Jazzy also starts `~/get_type_description` (REP 2016, default-on per `rclpy@jazzy` `type_description_service.py`), so eight lines, not seven — the official turtlesim listing shows six because turtlesim is `rclcpp`. **Re-check at T037**: (a) that `get_type_description` does appear as inferred from source rather than observed; (b) the float rendering of `ros2 topic echo` YAML (`data: 0.86`), inferred from `rosidl_runtime_py.message_to_yaml` + PyYAML; (c) `topic list`/`service list` ordering, which the CLI does not sort. |

---

## Summary

| Metric | Count |
|---|---|
| Examples logged | 4 |
| `executed` | 1 |
| `pending-env` | 3 |
| `blocked` | 0 |
| Chapters `verified` | 1 of 14 |

Chapter 1.2 is **`drafted`**, not `verified`: reviewed by both agents with all blocker/major findings fixed and the site building, but none of its examples has been executed. It becomes `verified` at T037.

Update this table whenever rows are added or a status changes (tasks T012, T019, T026, T032, T037).
