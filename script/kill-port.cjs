const { execSync } = require("child_process");

const portArg = process.argv[2];
const port = Number.parseInt(portArg || "5000", 10);

if (!Number.isInteger(port) || port <= 0) {
  console.error(`Invalid port: ${portArg}`);
  process.exit(1);
}

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function killWindows(targetPort) {
  const output = run(`netstat -ano -p tcp | findstr :${targetPort}`);
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }

  for (const pid of pids) {
    execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    console.log(`Freed port ${targetPort} by terminating PID ${pid}`);
  }
}

function killUnix(targetPort) {
  const output = run(`lsof -ti tcp:${targetPort}`);
  const pids = [...new Set(output.split(/\r?\n/).filter((x) => /^\d+$/.test(x)))];

  for (const pid of pids) {
    execSync(`kill -9 ${pid}`, { stdio: "ignore" });
    console.log(`Freed port ${targetPort} by terminating PID ${pid}`);
  }
}

try {
  if (process.platform === "win32") {
    killWindows(port);
  } else {
    killUnix(port);
  }
} catch {
  // Nothing was listening on the target port.
}
