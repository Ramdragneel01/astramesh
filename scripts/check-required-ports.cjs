#!/usr/bin/env node

const net = require("node:net");

const rawPorts = process.argv.slice(2);

if (rawPorts.length === 0) {
  console.error("Usage: node scripts/check-required-ports.cjs <port> [port...]");
  process.exit(1);
}

const ports = [];
for (const rawPort of rawPorts) {
  const trimmed = String(rawPort).trim();
  if (!/^\d+$/.test(trimmed)) {
    console.error(`Invalid port: ${rawPort}`);
    process.exit(1);
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (parsed < 1 || parsed > 65535) {
    console.error(`Port out of range: ${parsed}`);
    process.exit(1);
  }

  if (!ports.includes(parsed)) {
    ports.push(parsed);
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (error) => {
      resolve({
        port,
        ok: false,
        reason: error && typeof error === "object" && "code" in error ? String(error.code) : String(error)
      });
    });

    server.listen(port, "::", () => {
      server.close(() => {
        resolve({
          port,
          ok: true
        });
      });
    });
  });
}

async function main() {
  const results = await Promise.all(ports.map((port) => checkPort(port)));
  const blocked = results.filter((result) => !result.ok);

  if (blocked.length === 0) {
    console.log(`[port-check] all required ports are available: ${ports.join(", ")}`);
    return;
  }

  console.error("[port-check] required ports are already in use:");
  for (const item of blocked) {
    console.error(`- ${item.port} (${item.reason})`);
  }

  console.error(
    "[port-check] stop existing processes on those ports before running the AstraMesh stack to preserve fixed module URLs."
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(`[port-check] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});