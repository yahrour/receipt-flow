import z from "zod";
import { userPreferencesSchema } from "../schema/index.js";
import createError from "http-errors";
import { query } from "../lib/db.js";

type UserPreferencesSchema = z.infer<typeof userPreferencesSchema>;
export async function UpdatePreferencesService(
  userId: string,
  body: UserPreferencesSchema,
) {
  try {
    const data = userPreferencesSchema.parse(body);

    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      throw createError(400, "Not field provided");
    }

    const setClause = fields
      .map((field, idx) => `${field}=$${idx + 2}`)
      .join(", ");

    const updateClause = `UPDATE SET ${setClause}`;

    const insertColumnsClause = fields.map((field) => `${field}`).join(", ");
    const insertValuesClause = fields
      .map((field, idx) => `$${idx + 2}`)
      .join(", ");

    await query(
      `INSERT INTO user_preferences (user_id, ${insertColumnsClause}) VALUES ($1, ${insertValuesClause})
        ON CONFLICT (user_id)
        DO ${updateClause}
        `,
      [userId, ...values],
    );
    return null;
  } catch (e) {
    if (createError.isHttpError(e)) throw e;
    throw createError(500, "Failed to update");
  }
}

interface Preferences {
  id: number;
  currency: string;
}

export async function GetPreferencesService(
  userId: string,
): Promise<Preferences> {
  try {
    const { rows } = await query(
      "SELECT id, currency FROM user_preferences WHERE user_id=$1",
      [userId],
    );

    return rows[0];
  } catch (e) {
    if (createError.isHttpError(e)) throw e;
    throw createError(500, "Failed to update");
  }
}
