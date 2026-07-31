import { Injectable, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioStorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    const useSSL = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.minioClient = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME', 'gestion-ventas');
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
        
        // Configurar política de lectura pública para descargar archivos directamente vía URL
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('Error al inicializar MinIO Bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${folder}/${uniqueSuffix}-${file.originalname.replace(/\s+/g, '_')}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      const endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const port = this.configService.get<string>('MINIO_PORT', '9000');
      const protocol = this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true' ? 'https' : 'http';
      
      return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error al subir archivo a MinIO:', error);
      throw new InternalServerErrorException('No se pudo guardar el archivo multimedia');
    }
  }
}
