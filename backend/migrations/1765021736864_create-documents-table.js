/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createExtension("uuid-ossp", { ifNotExists: true });

    pgm.createTable("documents", {
        document_id: {
            type: "uuid",
            notNull: true,
            default: pgm.func("uuid_generate_v4()"),
            primaryKey: true,
        },
        name: { type: "varchar(255)", notNull: true },
        original_name: { type: "varchar(255)", notNull: true },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
    });

    pgm.createIndex("documents", "document_id");
    pgm.createIndex("documents", "name");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("documents");
};
