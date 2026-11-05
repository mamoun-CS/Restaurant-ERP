const { app } = require("electron");

async function main() {
  await app.whenReady();
  const Database = require("better-sqlite3");
  const databasePath = process.argv[2];
  const mode = process.argv[3] || "basic";
  const db = new Database(databasePath || ":memory:");
  let exitCode = 0;

  try {
    const version = db.prepare("SELECT sqlite_version() AS version").get().version;
    if (databasePath) {
      const migration = db.prepare("SELECT version FROM schema_migrations WHERE version=1").get();
      if (!migration) throw new Error("The installed cashier database migration is missing.");
      db.prepare("SELECT value FROM sync_metadata LIMIT 1").all();
      if (mode === "write-sentinel") {
        db.prepare("INSERT INTO sync_metadata(key,value) VALUES('installer_smoke_sentinel','preserved') ON CONFLICT(key) DO UPDATE SET value=excluded.value").run();
      } else if (mode === "assert-sentinel") {
        const sentinel = db.prepare("SELECT value FROM sync_metadata WHERE key='installer_smoke_sentinel'").get();
        if (sentinel?.value !== "preserved") throw new Error("Installer update or uninstall did not preserve the user's app data.");
      }
    } else {
      db.exec("CREATE TABLE sqlite_smoke (value TEXT NOT NULL)");
      db.prepare("INSERT INTO sqlite_smoke(value) VALUES (?)").run("electron-abi-ok");
      const result = db.prepare("SELECT value FROM sqlite_smoke").get();
      if (result.value !== "electron-abi-ok") throw new Error("SQLite read/write smoke check failed.");
    }
    console.log(`better-sqlite3 loaded successfully with SQLite ${version}${databasePath ? ` at ${databasePath}` : ""}.`);
  } catch (error) {
    console.error(error);
    exitCode = 1;
  } finally {
    db.close();
    app.exit(exitCode);
  }
}

main().catch((error) => { console.error(error); app.exit(1); });
