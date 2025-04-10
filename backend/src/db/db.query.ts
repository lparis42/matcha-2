// SQL query generation functions securised against SQL injection attacks by using parameterized queries.

export function selectQuery(table: string, columns: string[], where: string): string {
    return `SELECT ${columns.join(', ')} FROM ${table} WHERE ${where}`;
}

export function insertQuery(table: string, columns: string[], values: any[]): { query: string; params: any[] } {
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    return { query, params: values };
}

export function updateQuery(table: string, set: string[], where: string, values: any[]): { query: string; params: any[] } {
    const setClause = set.map((column, index) => `${column} = $${index + 1}`).join(', ');
    const query = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    return { query, params: values };
}

export function deleteQuery(table: string, where: string, values: any[]): { query: string; params: any[] } {
    const query = `DELETE FROM ${table} WHERE ${where}`;
    return { query, params: values };
}