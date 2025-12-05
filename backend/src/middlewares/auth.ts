import { Response, NextFunction } from "express";

import { verify } from "jsonwebtoken";
import config from "@/config";
import RedisService from "@/services/RedisService";
import { IJWTTokenData, IRequest } from "./middlewares";
import User from "@/models/User";

const verifyUserToken = (
    request: IRequest,
    response: Response,
    next: NextFunction
) => {
    const authorizationHeader = request.get("Authorization");

    if (authorizationHeader) {
        const token = authorizationHeader.slice(7);

        verify(token, config.JSON_WEBTOKEN_SECRET, async (error, tokenData) => {
            if (error || !tokenData) {
                return response.status(500).json({
                    status: "error",
                    message: "Invalid Authorization Token",
                    error,
                });
            }

            const { userId } = tokenData as IJWTTokenData;

            const cachedUserSession = await RedisService.getKey(
                `user-${userId}-session`
            );

            if (cachedUserSession) {
                request.currentUser = {
                    ...cachedUserSession,
                    isCached: true,
                };

                return next();
            }

            const UserModel = new User();

            const user = await UserModel.findByUserId(userId);

            if (!user) {
                return response.status(500).json({
                    status: "error",
                    message: "User not found",
                });
            }

            const { password: _password, ...userWithoutPassword } = user;

            request.currentUser = userWithoutPassword;

            await RedisService.setKey(
                `user-${userId}-session`,
                userWithoutPassword,
                {
                    EX: config.JSON_WEBTOKEN_EXPIRY,
                }
            );

            next();
        });
    } else {
        return response.status(500).json({
            status: "error",
            message: "Authorization header missing",
        });
    }
};

export default verifyUserToken;
