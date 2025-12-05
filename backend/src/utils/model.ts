/**
 * Builds SQL SET clauses and parameterized values for UPDATE queries
 * @param data - Object with snake_case keys containing the fields to update
 * @param startParamIndex - Starting index for SQL parameters (default: 1)
 * @returns Object containing setClauses array and values array, or null if no fields to update
 */
export const buildUpdateClauses = (
    data: Record<string, any>,
    startParamIndex: number = 1
): { setClauses: string[]; values: any[] } | null => {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = startParamIndex;

    for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] !== undefined) {
            setClauses.push(`${key} = $${paramIndex}`);
            values.push(data[key]);
            paramIndex++;
        }
    }

    if (setClauses.length === 0) {
        return null;
    }

    return { setClauses, values };
};
