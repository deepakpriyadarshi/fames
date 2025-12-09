import React, { useEffect, useState } from "react";
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
import ABLECREDIT_AUTH_API from "@/api/auth";
import { useNavigate, Link } from "react-router-dom";
import APP_ROUTES from "@/constants/appRoutes";
import { toast } from "sonner";

export const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const defaultSignupData = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    };

    const [signupData, setSignupData] = useState(defaultSignupData);

    const handleSignUp = async () => {
        setIsProcessing(true);

        try {
            const { data: signupResponse } = await ABLECREDIT_AUTH_API.register(
                {
                    firstName: signupData.firstName,
                    lastName: signupData.lastName || undefined,
                    email: signupData.email,
                    password: signupData.password,
                }
            );

            if (signupResponse.status === "success") {
                toast.success("Account created successfully", {
                    duration: 3000,
                    position: "bottom-center",
                });

                setUser(signupResponse.data);

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
                                            Create an account
                                        </h1>
                                        <p className="text-muted-foreground text-balance">
                                            Sign up to get started with
                                            AbleCredit Docs
                                        </p>
                                    </div>
                                    <Field>
                                        <FieldLabel htmlFor="firstName">
                                            First Name{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="e.g. Deepak"
                                            required
                                            className="shadow-none"
                                            value={signupData.firstName}
                                            onChange={(e) =>
                                                setSignupData({
                                                    ...signupData,
                                                    firstName: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="lastName">
                                            Last Name{" "}
                                            <span className="text-muted-foreground text-sm font-normal">
                                                (optional)
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="e.g. Priyadarshi"
                                            className="shadow-none"
                                            value={signupData.lastName}
                                            onChange={(e) =>
                                                setSignupData({
                                                    ...signupData,
                                                    lastName: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="e.g. deepak@ablecredit.io"
                                            required
                                            className="shadow-none"
                                            value={signupData.email}
                                            onChange={(e) =>
                                                setSignupData({
                                                    ...signupData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            Password
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            className="shadow-none"
                                            placeholder="Your password"
                                            value={signupData.password}
                                            onChange={(e) =>
                                                setSignupData({
                                                    ...signupData,
                                                    password: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <Button
                                            onClick={handleSignUp}
                                            disabled={
                                                !signupData.firstName ||
                                                !signupData.email ||
                                                !signupData.password ||
                                                isProcessing
                                            }
                                        >
                                            Sign Up
                                        </Button>
                                    </Field>

                                    <Field className="text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Already have an account?{" "}
                                            <Link
                                                to={APP_ROUTES.LOGIN}
                                                className="text-primary underline-offset-2 hover:underline"
                                            >
                                                Login
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
                            href="https://www.ablecredit.com/legal/terms/"
                            target="_blank"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://www.ablecredit.com/legal/privacy/"
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
