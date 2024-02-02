CREATE TABLE IF NOT EXISTS "schema_migration" (
"version" TEXT PRIMARY KEY
);
CREATE UNIQUE INDEX "schema_migration_version_idx" ON "schema_migration" (version);
CREATE TABLE IF NOT EXISTS "logs" (
"id" TEXT PRIMARY KEY,
"username" TEXT,
"password" TEXT,
"ipv4" TEXT,
"ipv6" TEXT,
"country" TEXT,
"as" TEXT,
"browser_agent" TEXT,
"count" INTEGER NOT NULL DEFAULT '0',
"created_at" DATETIME NOT NULL,
"updated_at" DATETIME NOT NULL
);
