const { spawn } = require("node:child_process");

const electronPath = require("electron");
const electronArgs = process.argv.slice(2);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, electronArgs, { env, stdio: "inherit" });
child.on("error", (error) => {
  console.error("Failed to launch Electron:", error);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Electron exited from signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
