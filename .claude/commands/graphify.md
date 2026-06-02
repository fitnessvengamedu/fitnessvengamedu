# Command: `/graphify`

## Purpose
Enforces the automatic installation and configuration of the Graphify repository within the project directory if it is not already present, followed by running the graph mapping and clustering pipeline.

## Execution Steps

When the user triggers the `/graphify` command, follow these steps:

### 1. Check Installation Status
Check if the `./graphify/` folder exists in the project root and if the `graphify` command is available in Python.

### 2. Auto-Install Graphify (If Missing)
If Graphify is not present:
1. Clone the repository:
   ```bash
   git clone https://github.com/safishamsi/graphify.git graphify
   ```
2. Install the package locally in editable mode:
   ```bash
   pip install -e graphify/
   ```
3. Install Gemini and OpenAI-compatible extra dependencies:
   ```bash
   pip install "graphifyy[gemini]"
   ```
4. Configure Git ignore rules:
   Verify that `graphify/` is present in the project's `.gitignore` file. If not, append it.
5. Register the Google Antigravity skill locally:
   ```bash
   graphify install --platform antigravity-windows --project
   ```

### 3. Build & Cluster the Knowledge Graph
Execute the graph building commands:
1. Run structural/semantic extraction:
   ```bash
   graphify .
   ```
2. Rerun clustering and update report and HTML visualization:
   ```bash
   graphify cluster-only .
   ```

### 4. Report to the User
Confirm the success of the execution and display the counts of nodes, edges, and communities generated. Provide links to:
- [graphify-out/GRAPH_REPORT.md](file:///c:/Users/sk143/Downloads/fitness%20app/graphify-out/GRAPH_REPORT.md)
- [graphify-out/graph.html](file:///c:/Users/sk143/Downloads/fitness%20app/graphify-out/graph.html)
