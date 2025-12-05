import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.createExtension("uuid-ossp");

    pgm.createTable("users", {
        user_id: {
            type: "uuid",
            notNull: true,
            default: pgm.func("uuid_generate_v4()"),
            primaryKey: true,
        } as any,
        first_name: { type: "varchar(255)", notNull: true },
        last_name: { type: "varchar(255)", notNull: false },
        email: { type: "varchar(255)", notNull: true, unique: true },
        password: { type: "text", notNull: true },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        } as any,
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        } as any,
    });

    pgm.createIndex("users", "user_id", { unique: true });
    pgm.createIndex("users", "email", { unique: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropTable("users");
}
