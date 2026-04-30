#!/usr/bin/env node

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const [modulePathArg, portArg] = process.argv.slice(2);

if (!modulePathArg || !portArg) {
  console.error("Usage: node scripts/start-storybook.cjs <modulePath> <port>");
  process.exit(1);
}

const moduleCwd = path.resolve(process.cwd(), modulePathArg);
if (!fs.existsSync(moduleCwd)) {
  console.error(`Module path does not exist: ${moduleCwd}`);
  process.exit(1);
}

const packageJsonPath = path.join(moduleCwd, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error(`No package.json found in module path: ${moduleCwd}`);
  process.exit(1);
}

const port = String(portArg).trim();
if (!/^\d+$/.test(port)) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

const child = spawn(`npm run storybook -- --port ${port} --ci`, [], {
  cwd: moduleCwd,
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(`Failed to launch Storybook in ${moduleCwd}: ${error.message}`);
  process.exit(1);
});
