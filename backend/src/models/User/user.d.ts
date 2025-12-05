export interface ICreateUserData {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
}

export interface IUser {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUpdateUserData
    extends Partial<Omit<IUser, "userId" | "createdAt" | "updatedAt">> {}

export interface IUserModel {
    createUser: (user: ICreateUserData) => Promise<IUser | null>;
    findByUserId: (userId: IUser["userId"]) => Promise<IUser | null>;
    updateByUserId: (
        userId: IUser["userId"],
        updatedUserData: IUpdateUserData
    ) => Promise<IUser | null>;
}
