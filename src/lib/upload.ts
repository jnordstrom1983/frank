import { S3Client, S3ClientConfig, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Blob } from 'node:buffer';
import sharp from "sharp";
import shortUUID from 'short-uuid';


export type UploadedFile = {
    buffer: Buffer,
    type: "file" | "image",
    ext: string,
    filename: string,
    mimeType : string
}

export async function HandleUploadRequest(req: Request) {
    const formData = await req.formData();

    // Get file from formData
    const file = formData.get('file');
    const filename = formData.get('filename')
    const mirrorX = formData.get('mirrorX')
    const mirrorY = formData.get('mirrorY')
    const rotation = formData.get('rotation')

    const ext = (filename?.toString() || "").split(".").pop() || "";
    let fileType: "file" | "image" = "file";
    if (["png", "jpg", "jpeg", "svg"].includes(ext.toLowerCase())) {
        fileType = "image";
    }


    if (file instanceof Blob) {
        
        const stream = file.stream();
        const chunks = [];
        //@ts-ignore
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        let buffer = Buffer.concat(chunks);

        if (fileType === "image" && ext.toLowerCase() !== "svg") {
            const options: processImageOptions = {
                mirrorX: formData.get("mirrorX") === "true",
                mirrorY: formData.get("mirrorY") === "true",
                rotation: formData.get("rotation") ? parseInt(formData.get("rotation") as unknown as string) : undefined,
                cropX: formData.get("cropX") ? parseInt(formData.get("cropX") as unknown as string) : undefined,
                cropY: formData.get("cropY") ? parseInt(formData.get("cropY") as unknown as string) : undefined,
                cropWidth: formData.get("cropWidth") ? parseInt(formData.get("cropWidth") as unknown as string) : undefined,
                cropHeight: formData.get("cropHeight") ? parseInt(formData.get("cropHeight") as unknown as string) : undefined,
                width: formData.get("width") ? parseInt(formData.get("width") as unknown as string) : undefined,
                height: formData.get("height") ? parseInt(formData.get("height") as unknown as string) : undefined,
            }
            buffer = await processImage(buffer, options);

        }
        const ret: UploadedFile = {
            buffer,
            type: fileType,
            ext,
            mimeType : file.type,
            filename: filename?.toString() || ""
        }

        return ret;
    }
}

interface processImageOptions {
    mirrorX?: boolean,
    mirrorY?: boolean,
    rotation?: number,
    cropX?: number,
    cropY?: number,
    cropWidth?: number,
    cropHeight?: number,
    width?: number,
    height?: number,

}
export async function processImage(buffer: Buffer, options: processImageOptions) {
    if (options.mirrorX) {
        buffer = await sharp(buffer).flop().toBuffer()
    }
    if (options.mirrorY) {
        buffer = await sharp(buffer).flip().toBuffer()
    }

    if (options.rotation) {

        buffer = await sharp(buffer).rotate(options.rotation, {
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }).toBuffer()
    }

    if (options.cropX !== undefined && options.cropY !== undefined && options.cropWidth && options.cropHeight) {
        const cropX = Math.round(options.cropX)
        const cropY = Math.round(options.cropY)
        const cropWidth = Math.round(options.cropWidth)
        const cropHeight = Math.round(options.cropHeight)
        buffer = await sharp(buffer).extract({ left: cropX, top: cropY, width: cropWidth, height: cropHeight, }).toBuffer();

    }

    if (options.width && !options.height) {
        const width = options.width
        buffer = await sharp(buffer).resize({ width }).toBuffer()
    }
    if (options.height && !options.width) {
        const height = options.height;
        buffer = await sharp(buffer).resize({ height }).toBuffer()
    }
    if (options.width && options.height) {
        const width = options.width;
        const height = options.height
        buffer = await sharp(buffer).resize({ height, width, fit: "fill" }).toBuffer()
    }
    return buffer;
}



export async function StoreUploadedFile(uploadedFile: UploadedFile) {

    const filename = `${shortUUID().generate()}.${uploadedFile.ext}`

    return await StoreFile(uploadedFile.buffer, filename, uploadedFile.mimeType)
}


async function StoreFile(buffer: Buffer, filename: string, mimeType : string) {
    return await S3Upload(buffer, filename, mimeType )
}

export async function DeleteFile(key: string) {
    return await S3Delete(key);
}

async function S3Delete(key: string) {
    const client = S3GetClient();
    const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET || "",
        Key: key,
    });
    try {
        const response = await client.send(command);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }


}


function S3GetClient() {
    let opts: S3ClientConfig = {
        credentials: {
            accessKeyId: process.env.S3_ACCESSKEYID || "",
            secretAccessKey: process.env.S3_SECRETACCESSKEY || ""
        },
    }
    if (process.env.S3_REGION) {
        opts = { ...opts, region: process.env.S3_REGION }
    }
    if (process.env.S3_ENDPOINT) {
        opts = { ...opts, endpoint: process.env.S3_ENDPOINT }
    }

    const client = new S3Client(opts)

    return client;
}
async function S3Upload(buffer: Buffer, key: string, mimeType : string) {

    const s3_prefix = process.env.S3_PREFIX || ""
    let path = key;
    if (s3_prefix) {
        path = `${s3_prefix}${key}`
    }

    const client = S3GetClient();

    const response = await new Upload({
        client,
        params: {
            ACL: process.env.S3_ACL || 'public-read',
            Bucket: process.env.S3_BUCKET || "",
            Key: path,
            Body: buffer,
            ContentType : mimeType
        },
    }).done()

    let location = (response as unknown as any).Location as string;
    if (!location.startsWith("https://")) {
        location = `https://${location}`
    }
    if (location) {
        return { location: location, key: path }
    }

}