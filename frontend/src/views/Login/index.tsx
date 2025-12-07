import React, { useEffect, useState } from "react";

import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import ASSETS_IMAGES from "@/constants/assets";
import useUser from "@/hooks/useUser";
import EKLINE_AUTH_API from "@/api/auth";
import { useNavigate, Link } from "react-router-dom";
import APP_ROUTES from "@/constants/appRoutes";

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const defaultLoginData = {
        email: "",
        password: "",
    };

    const [loginData, setLoginData] = useState(defaultLoginData);

    const handleSignIn = async () => {
        setIsProcessing(true);

        try {
            const { data: loginResponse } = await EKLINE_AUTH_API.login(
                loginData
            );

            if (loginResponse.status === "success") {
                toast.success("Authenticated !! Redirecting to documents", {
                    duration: 3000,
                    position: "bottom-center",
                });

                setUser(loginResponse.data);

                setTimeout(() => {
                    navigate(APP_ROUTES.DOCUMENTS);
                }, 3000);
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message || "Something went wrong";

            toast.error(message, {
                duration: 3000,
                position: "bottom-center",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // useEffect(() => {
    //     if (user?.token) {
    //         navigate(APP_ROUTES.DOCUMENTS);
    //     }
    // }, [user]);

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className={cn("flex flex-col gap-6")}>
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <div className="p-6 md:p-8">
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <h1 className="text-2xl font-bold">
                                            Welcome back
                                        </h1>
                                        <p className="text-muted-foreground text-balance">
                                            Login to your Ekline Docs account
                                        </p>
                                    </div>
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                            className="shadow-none"
                                            value={loginData.email}
                                            onChange={(e) =>
                                                setLoginData({
                                                    ...loginData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor="password">
                                                Password
                                            </FieldLabel>
                                            <a
                                                href="/forgot-password"
                                                className="ml-auto text-sm underline-offset-2 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            className="shadow-none"
                                            placeholder="Your password"
                                            value={loginData.password}
                                            onChange={(e) =>
                                                setLoginData({
                                                    ...loginData,
                                                    password: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <Button
                                            onClick={handleSignIn}
                                            disabled={
                                                !loginData.email ||
                                                !loginData.password ||
                                                isProcessing
                                            }
                                        >
                                            Login
                                        </Button>
                                    </Field>
                                    <Field className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Don't have an account?{" "}
                                            <Link
                                                to={APP_ROUTES.SIGNUP}
                                                className="text-primary underline-offset-2 hover:underline"
                                            >
                                                Sign up
                                            </Link>
                                        </p>
                                    </Field>
                                </FieldGroup>
                            </div>
                            <div className="bg-red-100 hidden md:flex items-center justify-center">
                                <img
                                    src={ASSETS_IMAGES.logo}
                                    alt="Image"
                                    className="h-1/2 w-1/2 object-contain dark:brightness-[0.2] dark:grayscale"
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        By clicking continue, you agree to our{" "}
                        <a
                            href="https://ekline.io/terms-of-service"
                            target="_blank"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://ekline.io/privacy-policy"
                            target="_blank"
                        >
                            Privacy Policy
                        </a>
                        .
                    </FieldDescription>
                </div>
            </div>
        </div>
    );
};
