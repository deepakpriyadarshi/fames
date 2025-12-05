import { Request, Response } from "express";
import { hashSync, genSaltSync, compareSync } from "bcrypt";

import UserModel from "@/models/User";

import { consoleLogger } from "@/utils";
import { sign } from "jsonwebtoken";
import config from "@/config";

const AuthController = {
    register: async (req: Request, res: Response) => {
        try {
            const { firstName, lastName, email, password } = req.body;

            const User = new UserModel();

            const userExists = await User.findByEmail(email);

            if (userExists) {
                return res.status(400).json({
                    status: "error",
                    message: "User already exists with email, try logging in",
                });
            }

            const newUser = await User.createUser({
                firstName,
                lastName,
                email,
                password: hashSync(password, genSaltSync(10)),
            });

            if (!newUser) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to register user",
                });
            }

            const { password: _password, ...userWithoutPassword } = newUser;

            return res.status(200).json({
                status: "success",
                message: "User registered successfully",
                data: {
                    ...userWithoutPassword,
                    token: sign(
                        { ...userWithoutPassword },
                        config.JSON_WEBTOKEN_SECRET,
                        {
                            expiresIn: config.JSON_WEBTOKEN_EXPIRY,
                        }
                    ),
                },
            });
        } catch (error) {
            consoleLogger("Error registering user", error);

            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            const User = new UserModel();

            const user = await User.findByEmail(email);

            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: "User not found, please register first",
                });
            }

            const isPasswordValid = compareSync(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid password",
                });
            }

            const { password: _password, ...userWithoutPassword } = user;

            return res.status(200).json({
                status: "success",
                message: "User logged in successfully",
                data: {
                    ...userWithoutPassword,
                    token: sign(
                        { ...userWithoutPassword },
                        config.JSON_WEBTOKEN_SECRET,
                        {
                            expiresIn: config.JSON_WEBTOKEN_EXPIRY,
                        }
                    ),
                },
            });
        } catch (error) {
            consoleLogger("Error logging in user", error);
            return res.status(500).json({
                status: "error",
                message: "Something went wrong, please try again later",
            });
        }
    },
};

export default AuthController;
