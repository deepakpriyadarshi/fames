# Database Migrations

This directory contains database migration files managed by `node-pg-migrate`.

## Usage

### Create a new migration

```bash
npm run migrate:create migration-name
```

This will create a new migration file in this directory with a timestamp prefix.

### Run migrations

```bash
# Run all pending migrations
npm run migrate:up

# Or use the general migrate command
npm run migrate up
```

### Rollback migrations

```bash
# Rollback the last migration
npm run migrate:down

# Rollback multiple migrations
npm run migrate down -- -c 3
```

### Other useful commands

```bash
# Check migration status
npm run migrate list

# Run migrations in a specific direction
npm run migrate up -- -c 1  # Run 1 migration
npm run migrate down -- -c 1  # Rollback 1 migration
```

## Migration Files

Migration files follow the pattern: `[timestamp]_[migration-name].ts`

Each migration file exports:

-   `up(pgm: MigrationBuilder)` - Function to apply the migration
-   `down(pgm: MigrationBuilder)` - Function to rollback the migration

Example:

```typescript
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createTable("users", {
        id: "id",
        email: { type: "varchar(255)", notNull: true, unique: true },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("users");
}
```

## Configuration

Migration configuration is stored in `migrate.json` at the root of the backend directory.

The migration runner (`scripts/migrate.ts`) automatically uses the database configuration from `src/config/index.ts`.
