/**
 * Logs a message to the console
 * @param args - The message to log (e.g., "Hello, world!")
 */
export const consoleLogger = (...args: any[]): void => {
    console.log(...args);
};

/**
 * Converts a camelCase string to snake_case
 * @param str - camelCase string (e.g., "firstName")
 * @returns snake_case string (e.g., "first_name")
 */
export const camelToSnake = (str: string): string => {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Converts a snake_case string to camelCase
 * @param str - snake_case string (e.g., "first_name")
 * @returns camelCase string (e.g., "firstName")
 */
export const snakeToCamel = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts an object with camelCase keys to snake_case keys
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export const toSnakeCase = <T extends Record<string, any>>(
    obj: T
): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const snakeKey = camelToSnake(key);
            result[snakeKey] = obj[key];
        }
    }
    return result;
};

/**
 * Converts an object with snake_case keys to camelCase keys
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export const toCamelCase = <T extends Record<string, any>>(
    obj: T
): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const camelKey = snakeToCamel(key);
            result[camelKey] = obj[key];
        }
    }
    return result;
};
