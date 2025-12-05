import { consoleLogger } from "@/utils";
import postgresSQLConn from "@/config/database";

import { ICreateUserData, IUserModel, IUser, IUpdateUserData } from "./user";

class User implements IUserModel {
    async createUser(newUserData: ICreateUserData) {
        try {
            const query =
                "INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4) RETURNING *";
            const { rows } = await postgresSQLConn.query(query, [
                newUserData.firstName,
                newUserData.lastName,
                newUserData.email,
                newUserData.password,
            ]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            consoleLogger("Error creating user", error);
        }
    }

    async findByUserId(userId: IUser["userId"]) {
        try {
            const query = "SELECT * FROM users WHERE id = $1";
            const { rows } = await postgresSQLConn.query(query, [userId]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            consoleLogger("Error finding user by user id", error);
        }
    }

    async updateByUserId(
        userId: IUser["userId"],
        updatedUserData: IUpdateUserData
    ) {
        try {
            const query = "UPDATE users SET $1 = $2 WHERE id = $3 RETURNING *";
            const { rows } = await postgresSQLConn.query(query, [
                updatedUserData,
                userId,
            ]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            consoleLogger("Error updating user by user id", error);
        }
    }
}

export default User;
