const PORTS = [
  { port: 22, service: "ssh", state: "open", info: "OpenSSH 9.2" },
  { port: 80, service: "http", state: "open", info: "nginx/1.24.0" },
  { port: 443, service: "https", state: "open", info: "nginx/1.24.0 (TLS)" },
  {
    port: 3000,
    service: "dev-server",
    state: "filtered",
    info: "Astro dev (internal)",
  },
  { port: 5337, service: "unknown", state: "open", info: "FLAG{port_5337}" },
  { port: 8080, service: "http-proxy", state: "closed", info: null },
  { port: 27017, service: "mongodb", state: "closed", info: null },
];

export async function runPortScan(addLine) {
  addLine("");
  addLine({
    text: "Starting nmap scan on portfolio.dev (192.168.1.337)...",
    type: "accent",
  });
  addLine({ text: "Scanning ports 1-65535", type: "dim" });
  addLine("");

  await sleep(600);

  const bar = "█".repeat(20);
  const empty = "░".repeat(20);
  for (let i = 0; i <= 20; i++) {
    const filled = bar.slice(0, i);
    const remaining = empty.slice(0, 20 - i);
    const pct = Math.round((i / 20) * 100);
    addLine({
      text: `  [${filled}${remaining}] ${pct}%`,
      type: "dim",
      replace: true,
    });
    await sleep(150);
  }

  addLine("");
  addLine({
    text: "PORT      STATE      SERVICE        VERSION",
    type: "accent",
  });
  addLine({ text: "────      ─────      ───────        ───────", type: "dim" });

  for (const p of PORTS) {
    await sleep(300 + Math.random() * 400);
    const port = String(p.port).padEnd(10);
    const state = p.state.padEnd(11);
    const service = p.service.padEnd(15);

    let type = "text";
    if (p.state === "open") type = "success";
    else if (p.state === "filtered") type = "warning";
    else type = "dim";

    const line = `${port}${state}${service}${p.info || ""}`;
    addLine({ text: line, type });

    if (p.port === 5337) {
      await sleep(200);
      addLine("");
      addLine({ text: "  ⚠ Unusual service on port 5337", type: "warning" });
    }
  }

  addLine("");
  addLine({
    text: `Scan complete. ${PORTS.filter((p) => p.state === "open").length} open, ${PORTS.filter((p) => p.state === "filtered").length} filtered, ${PORTS.filter((p) => p.state === "closed").length} closed.`,
    type: "dim",
  });
  addLine("");

  return true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
