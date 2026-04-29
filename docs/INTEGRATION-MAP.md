# Integration Map

This map defines how each repository is represented in the shell.

| Project | Type | Shell Route | Default URL | Start Command |
|---|---|---|---|---|
| astramesh-control-plane | backend | n/a | `http://localhost:4310` | `npm --workspace @astramesh/api run dev` |
| drift-watch | frontend | `/workspace/drift-watch` | `http://localhost:5401` | `npm --prefix ..\\drift-watch\\frontend run dev -- --port 5401 --host` |
| llm-judge | frontend | `/workspace/llm-judge` | `http://localhost:5402` | `npm --prefix ..\\llm-judge\\frontend run dev -- --port 5402 --host` |
| ragbench | frontend | `/workspace/ragbench` | `http://localhost:5403` | `npm --prefix ..\\ragbench\\frontend run dev -- --port 5403 --host` |
| prompt-ops | frontend | `/workspace/prompt-ops` | `http://localhost:5404` | `npm --prefix ..\\prompt-ops\\frontend run dev -- --port 5404 --host` |
| neuralscope | frontend | `/workspace/neuralscope` | `http://localhost:5405` | `npm --prefix ..\\neuralscope\\frontend run dev -- --port 5405 --host` |
| config-forge | frontend | `/workspace/config-forge` | `http://localhost:5406` | `npm --prefix ..\\config-forge\\frontend run dev -- --port 5406 --host` |
| interview-os | frontend | `/workspace/interview-os` | `http://localhost:5407` | `npm --prefix ..\\interview-os\\frontend run dev -- --port 5407 --host` |
| mlops-sentinel | frontend | `/workspace/mlops-sentinel` | `http://localhost:5408` | `npm --prefix ..\\mlops-sentinel\\frontend run dev -- --port 5408 --host` |
| agent-tracer | frontend | `/workspace/agent-tracer` | `http://localhost:5409` | `npm --prefix ..\\agent-tracer\\frontend run dev -- --port 5409 --host` |
| agentic-research-assistant | frontend | `/workspace/agentic-research-assistant` | `http://localhost:5410` | `npm --prefix ..\\agentic-research-assistant\\frontend run dev -- --port 5410 --host` |
| agentic-ui | storybook | `/workspace/agentic-ui` | `http://localhost:6006` | `npm --prefix ..\\agentic-ui run storybook -- --port 6006` |
| context-watchdog | documentation | `/workspace/context-watchdog` | `https://github.com/Ramdragneel01/context-watchdog` | `python -m pip install -r ..\\context-watchdog\\requirements.txt` |
