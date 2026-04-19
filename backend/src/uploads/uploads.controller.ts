import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ImageObject } from './image.types';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post(':listingId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Req() req: Request & { user: AuthUser },
    @Param('listingId') listingId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('position', new DefaultValuePipe(0), ParseIntPipe) position: number,
  ): Promise<ImageObject> {
    if (!file) {
      throw new BadRequestException('file is required');
    }
    return this.uploadsService.createImage(req.user.id, listingId, file, position);
  }

  @Delete('image/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.uploadsService.deleteImage(req.user.id, id);
    return { success: true };
  }
}
