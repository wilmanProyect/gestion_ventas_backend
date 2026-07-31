import { Module, Global } from '@nestjs/common';
import { MinioStorageService } from './infrastructure/storage/minio-storage.service';

@Global()
@Module({
  providers: [MinioStorageService],
  exports: [MinioStorageService],
})
export class SharedModule {}
