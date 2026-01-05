import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const getSignedImageUrl = async (bucket: string, fileName: string, fileType: string, folder: string = "images"): Promise<{ uploadUrl: string; publicUrl: string; key: string } | null> => {
  try {
    const key = `${folder}/${fileName}`;
    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
      Expires: 1000,
    });

    // Construct Public URL
    // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
    const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, publicUrl, key };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteS3File = async (bucket: string, key: string): Promise<void> => {
  try {
    await s3.deleteObject({
      Bucket: bucket,
      Key: key,
    }).promise();
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    // We might not want to throw here to allow DB deletion to proceed, 
    // or arguably we should log it and maybe alert. 
    // For now, logging error is sufficient.
  }
};
