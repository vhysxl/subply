import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  generateSignature(): {
    timestamp: number;
    signature: string;
    apikey: string;
    cloudName: string;
    uploadPreset: string;
  } {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        upload_preset: 'ml_default',
      },
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      timestamp,
      signature,
      apikey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
      uploadPreset: 'ml_default',
    };
  }
}
