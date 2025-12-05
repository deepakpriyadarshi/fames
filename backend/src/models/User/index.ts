import { consoleLogger, toSnakeCase, toCamelCase } from "@/utils";
import { buildUpdateClauses } from "@/utils/model";

import postgresSQLConn from "@/config/database";

import { ICreateUserData, IUserModel, IUser, IUpdateUserData } from "./user";

class User implements IUserModel {
    async createUser(newUserData: ICreateUserData) {
        try {
            const snakeCaseData = toSnakeCase(newUserData);

            const query =
                "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *";

            const { rows } = await postgresSQLConn.query(query, [
                snakeCaseData.first_name,
                snakeCaseData.last_name,
                snakeCaseData.email,
                snakeCaseData.password,
            ]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IUser) : null;
        } catch (error) {
            consoleLogger("Error creating user", error);

            throw error;
        }
    }

    async findByUserId(userId: IUser["userId"]) {
        try {
            const query = "SELECT * FROM users WHERE user_id = $1";

            const { rows } = await postgresSQLConn.query(query, [userId]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IUser) : null;
        } catch (error) {
            consoleLogger("Error finding user by user id", error);

            throw error;
        }
    }

    async findByEmail(email: IUser["email"]) {
        try {
            const query = "SELECT * FROM users WHERE email = $1";

            const { rows } = await postgresSQLConn.query(query, [email]);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IUser) : null;
        } catch (error) {
            consoleLogger("Error finding user by email", error);

            throw error;
        }
    }

    async updateByUserId(
        userId: IUser["userId"],
        updatedUserData: IUpdateUserData
    ) {
        try {
            const snakeCaseData = toSnakeCase(updatedUserData);

            const updateClauses = buildUpdateClauses(snakeCaseData);

            if (!updateClauses) {
                return null;
            }

            const { setClauses, values } = updateClauses;

            values.push(userId);

            const query = `UPDATE users SET ${setClauses.join(
                ", "
            )} WHERE user_id = $${values.length} RETURNING *`;

            const { rows } = await postgresSQLConn.query(query, values);

            return rows.length > 0 ? (toCamelCase(rows[0]) as IUser) : null;
        } catch (error) {
            consoleLogger("Error updating user by user id", error);

            throw error;
        }
    }
}

export default User;
