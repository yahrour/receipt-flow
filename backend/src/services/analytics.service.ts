import { query } from "../lib/db.js";

export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number,
) {
  const { rows } = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total_amount, 
    count(*)::int AS total_receipts, 
    COALESCE(ROUND(AVG(amount), 2), 0) AS average 
    FROM receipts 
    WHERE user_id=$1
    AND EXTRACT(MONTH FROM receipt_date)=$2
    AND EXTRACT(YEAR FROM receipt_date)=$3`,
    [userId, month, year],
  );

  const data = {
    total_amount: parseFloat(rows[0].total_amount),
    total_receipts: rows[0].total_receipts,
    average: parseFloat(rows[0].average),
  };

  return data;
}

export async function getYearlySpending(userId: string, year: number) {
  const { rows } = await query(
    `SELECT EXTRACT(MONTH FROM receipt_date) AS month,
    SUM(amount) AS total
    FROM receipts WHERE user_id=$1 
    AND EXTRACT(YEAR FROM receipt_date)=$2 
    GROUP BY month 
    ORDER BY month ASC`,
    [userId, year],
  );

  return rows;
}

export async function getCategoriesSpending(
  userId: string,
  month: number,
  year: number,
) {
  const { rows } = await query(
    `SELECT category, SUM(amount) as total 
    FROM receipts 
    WHERE user_id=$1 
    AND EXTRACT(MONTH FROM receipt_date)=$2 
    AND EXTRACT(YEAR FROM receipt_date)=$3 
    GROUP BY category 
    ORDER BY total DESC;`,
    [userId, month, year],
  );

  return rows;
}
