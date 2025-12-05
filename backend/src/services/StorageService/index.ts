import AWS from "aws-sdk";
import config from "@/config";
import { IStorageService } from "../services";

const StorageService = new AWS.S3({
    endpoint: new AWS.Endpoint(config.AWS_SPACE_ENDPOINT),
    //forcePathStyle: false,
    region: "blr1",
    //signatureVersion: "v4",
    credentials: {
        accessKeyId: config.AWS_SPACE_ACCESS_KEY,
        secretAccessKey: config.AWS_SPACE_ACCESS_SECRET,
    },
    accessKeyId: config.AWS_SPACE_ACCESS_KEY,
    secretAccessKey: config.AWS_SPACE_ACCESS_SECRET,
}) as IStorageService;

StorageService.getSignedURL = async (
    filePath: string | null | undefined | "",
    expiry: number | null = null
) => {
    if (["", null, undefined].includes(filePath)) return null;

    const getParams = {
        Bucket: config.AWS_SPACE_BUCKET,
        Key: filePath,
        ...(expiry != null ? { Expires: expiry } : {}),
    };

    return StorageService.getSignedUrl("getObject", getParams);
};

export default StorageService;
