import { query } from "../lib/db.js";

export async function getSummaryService(userId: string) {
  const { rows } = await query(
    `SELECT 
        COALESCE(SUM(amount), 0) as "totalAmount", 
        COUNT(*)::int as "count", 
        COALESCE(ROUND(AVG(amount), 2), 0) as "average"
     FROM receipts 
     WHERE user_id = $1`,
    [userId],
  );

  return rows[0];
}

export async function getSpendingByCategoryService(userId: string) {
  const { rows } = await query(
    `SELECT category, SUM(amount) as total FROM receipts WHERE user_id=$1 GROUP BY category ORDER BY total DESC`,
    [userId],
  );

  return rows;
}

export async function getSpendingByMonthService(userId: string) {
  const { rows } = await query(
    `SELECT DATE_TRUNC('month', receipt_date) AS month, SUM(amount) FROM receipts WHERE user_id=$1 GROUP BY month ORDER BY month ASC`,
    [userId],
  );

  return rows;
}
