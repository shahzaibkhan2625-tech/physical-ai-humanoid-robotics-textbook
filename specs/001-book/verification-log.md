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
| 1.3 Bridging Python Agents with rclpy | `pilot.py` — agent node: subscribes `/gap`, decides via plain-Python `choose_speed`, publishes `/cmd_speed`; two parameters and a status timer | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed** — no ROS 2 on the authoring machine. Static verification only: `ast.parse` clean, `pyflakes` zero findings, Jazzy idiom confirmed. **This is the agent-node skeleton every later module reuses (tasks T009).** Skeleton confirmed byte-for-byte against the canonical `ros2/examples@jazzy` `publisher_member_function.py` / `subscriber_member_function.py`. 26 APIs confirmed against `jazzy`-branch source, including `declare_parameter` type inference (`node.py`), rejection of a wrong-typed `set` (`SetParametersResult(successful=False)`), `get_parameter().value`, and `logger.warning` (not the deprecated `warn`). Interop with 1.2's `range_sensor.py` exact: topic `gap`, type `example_interfaces/msg/Float64`, depth 10 both ends. Review corrected a **wrong prose claim** that the shutdown pair is reached on `Ctrl+C` — rclpy's SIGINT handler chains to CPython's, so `KeyboardInterrupt` propagates out of `spin` and the cleanup lines are skipped (`rclpy/src/rclpy/signal_handler.cpp`; zero `KeyboardInterrupt` handling in jazzy `rclpy`). The code was correct; only the prose was wrong. **Unconfirmed until run**: the emitted log lines. |
| 1.3 Bridging Python Agents with rclpy | `blocking_agent.py` — demonstrates a slow callback stalling the node | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed.** Parse clean, `pyflakes` zero findings, Jazzy idiom confirmed. The chapter's central mechanism claims were confirmed against source: timer ticks are **skipped, not deferred** (`ros2/rcl@jazzy` `src/rcl/timer.c` — `next_call_time += period`, then advance by whole periods while `next_call_time <= now`, so a 1 Hz timer blocked 2 s fires once); default queue depth 10 with keep-last discard (Jazzy QoS docs); no exception or warning raised during a stall. Callback interleaving order (`done` → `heartbeat` → `start`) confirmed against `rclpy@jazzy` `executors.py` wait-order (waitables → timers → subscriptions). **Unconfirmed until run**: the emitted log lines and their timestamps. |
| 1.3 Bridging Python Agents with rclpy | CLI sequence — `ros2 param list` / `get` / `set`, `ros2 topic echo /cmd_speed`, `--ros-args -p` | `pending-env` | `ros:jazzy-desktop` | 2026-08-10 | **Not executed.** Exact output strings confirmed against `ros2cli@jazzy`: `ros2 param list` two-space indent and sorted (`list.py`), `Double value is:` (`get.py`), `Set parameter successful` (`set.py`), `average rate: %.3f` for `ros2 topic hz` (`hz.py`). `use_sim_time` auto-declared on every node (`time_source.py`). `--ros-args -p name:=value` confirmed in `ros2_documentation@jazzy` `Node-arguments.rst`. **Closes an item left inferred at 1.2**: `ros2 topic echo` float rendering is now confirmed from `echo.py` + `message_to_yaml` — `data: 0.3` / `data: 0.0` with `---` and no blank line. All five transcripts in this chapter were re-derived arithmetically and are mutually consistent (staleness 4.50 s, real gap 0.56 m, reading counts, and the sweep wrap all check out). |
| 1.4 URDF: Describing a Humanoid | Example 1 — `simple_humanoid.urdf`, the complete 13-link humanoid model | `executed` | `local-python` | 2026-08-11 | **The single humanoid model required by FR-017.** Extracted programmatically from the `.mdx` and parsed with `xml.etree.ElementTree` three times independently: by `code-verifier`, by `chapter-writer` after the fix pass, and by the orchestrator against the final shipped file. Structure confirmed each time: well-formed XML, `robot name="simple_humanoid"`, 13 links, 12 joints, exactly one root (`base_link`), no duplicate link or joint names, every joint parent/child resolving to a declared link, no cycles, all 13 links reachable. All 12 `revolute` joints carry `<limit>` with `effort` and `velocity` (urdfdom rejects the file otherwise) and non-degenerate `lower < upper`; every joint has an explicit `<axis>`; all three `<material>` names declared and used. **All 39 inertia components recomputed** from mass and shape against the standard rigid-body formulas and correct to the printed precision, including the head's deliberate use of the visual sphere radius 0.11 (`2·2.5·0.11²/5 = 0.0121`) rather than the collision 0.12 (which would give 0.0144). Every numeric prose claim re-derived independently: total mass 34.700 kg, skull top +0.720 m, soles −0.850 m, height 1.5700 m; Exercise 3's `l_hand` inertias (0.000453 / 0.000333 / 0.000547) and totals; Exercise 4's visor corners, the 1.01 cm and 1.31 cm clearances and the 0.133 m enclosing radius. The three inline XML excerpts were confirmed byte-identical to their counterparts in the full listing. **Not executed**: the official `urdfdom` parse, RViz rendering, and any physics engine — logged as separate rows below. |
| 1.4 URDF: Describing a Humanoid | Example 2 — `urdf_tree.py`, stdlib joint-tree walker + its printed transcript | `executed` | `local-python` | 2026-08-11 | **Run on Python 3.14.2 (Windows), four independent times**: by `code-verifier`, by `chapter-writer` post-fix, and by the orchestrator against the final shipped `.mdx`. Exit 0; stdout matches the chapter's ` ```text ` transcript exactly once line endings are normalized (the only difference is Windows CRLF from `print`, not content — verified byte-wise). Standard library only (`sys`, `xml.etree.ElementTree`, `%`-formatting); nothing in it postdates Python 3.7, supporting the "Python 3.8 or newer" claim, though Ubuntu 24.04 ships 3.12 and only 3.14.2 was available here. All three exercise mutations were also executed and reproduce their stated results exactly, including the literal string `not a tree: expected 1 root link, found 2: ['base_link', 'l_shin']` and the `reached: 11` against `links: 13` pair. Review corrected a **false prose claim** that "three checks run first": only two run before the walk and return 1, while `reached` is computed during the walk, printed last, and never compared — a broken tree exits 0. The code was correct; the prose was wrong, and was reworded rather than changing the code, preserving Exercise 2's pedagogy and the executed transcript. Determinism confirmed: `findall` yields document order and dicts preserve insertion order. |
| 1.4 URDF: Describing a Humanoid | `check_urdf simple_humanoid.urdf` — validation with the official parser | `pending-env` | `ros:jazzy-desktop` | 2026-08-11 | **Not executed** — needs Ubuntu 24.04 with `sudo apt install liburdfdom-tools` (independent of ROS; `liburdfdom-tools` 4.0.0-0ubuntu1 on Noble installs `/usr/bin/check_urdf`, confirmed from the packages.ubuntu.com filelist). Output *shape* confirmed from `check_urdf.cpp`: `robot name is: `, the `Successfully Parsed XML` banner, and `root Link: X has N child(ren)` with two-space indented `child(n)` lines. Both quoted failure strings were corrected this pass to match `urdfdom_headers@jazzy` `model.h` exactly — `"Two root links found: [name] and [name]"` (the chapter previously quoted only the prefix) and `"No root link found. The robot xml is not a valid tree."` (trailing period restored). Exercise 2's premise confirmed from source: `initRoot` has no reachability or cycle check, so the delete is rejected while the reparent is accepted silently — which is the exercise's point. **Unconfirmed until run**: the actual emitted banner and tree listing. |
| 1.4 URDF: Describing a Humanoid | `display_humanoid.launch.py` + `ros2 launch` + the RViz walkthrough | `pending-env` | `ubuntu-24.04-gui` | 2026-08-11 | **Not executed** — needs ROS 2 Jazzy on Ubuntu 24.04 **with a display**. `py_compile` clean. All four launch APIs confirmed real and correctly pathed on the `jazzy` branches: `LaunchDescription` (`launch/__init__.py`), `Command` (`launch/substitutions/__init__.py`), `Node` (`launch_ros/actions/__init__.py`), `ParameterValue` (`launch_ros/parameter_descriptions.py`), whose signature makes `value_type` keyword-only — `value_type=str` is load-bearing, since without it the URDF is YAML-parsed and fails. `ros2 launch` with a relative path outside a package confirmed via `ros2launch/command/launch.py`'s single-file branch. Package/executable pairs confirmed for all three nodes. `robot_state_publisher` confirmed to publish the URDF on a `robot_description` topic with `transient_local` QoS, which is how the GUI and RViz obtain the model and why launch ordering does not matter. Two fixes this pass: the claim that all three packages ship in `ros-jazzy-desktop` was **factually wrong** (`joint_state_publisher` appears in none of the six `ros2/variants@jazzy` variants) and was corrected; and the `/home/you/` placeholder path was replaced with a self-locating `os.path.realpath(__file__)` form to satisfy the spec's no-placeholder-values criterion. **Note**: replacing the launch file with `ros2 run --ros-args -p robot_description:="$(cat …)"` was investigated and **refuted** — libyaml rejects the multi-line XML — so the launch file was kept and explained rather than removed. **Unconfirmed until run**: that the three nodes come up, the sliders move the model, and the RViz default-config claims (grid-only, `/map` Fixed Frame). |

---

## Summary

| Metric | Count |
|---|---|
| Examples logged | 11 |
| `executed` | 3 |
| `pending-env` | 8 |
| `blocked` | 0 |
| Chapters `verified` | 1 of 14 |

Chapters 1.2 and 1.3 are **`drafted`**, not `verified`: both reviewed by both agents with all blocker/major findings fixed and the site building, but no example in either has been executed. Both become `verified` at T037.

Chapter 1.4 is **`drafted`**, not `verified` — and it is the closest of the four to done. Its two
*chapter* examples are both `executed`: the humanoid model itself and the loader script that reports
its tree, together covering every numeric claim the chapter makes about the robot. What remains is
tooling around the model, not the model: the official `urdfdom` parse, and the three-node
visualization with its GUI. It becomes `verified` at T037.

**Module 1 is now `drafted` in full** — four chapters plus the landing page, all four having passed
both reviewers with every blocker and major fixed, and the site building. Module 1 holds 3 of the
project's 3 `executed` examples.

Update this table whenever rows are added or a status changes (tasks T012, T019, T026, T032, T037).
