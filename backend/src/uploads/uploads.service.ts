import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Image } from '@prisma/client';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { ListingsService } from '../listings/listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImageObject } from './image.types';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly listingsService: ListingsService,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<string> {
    if (!file || (!file.path && !file.buffer)) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadDir = join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = this.getExtension(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const destPath = join(uploadDir, filename);

    if (file.path) {
      await fs.rename(file.path, destPath);
    } else if (file.buffer) {
      await fs.writeFile(destPath, file.buffer);
    } else {
      throw new BadRequestException('Unable to read uploaded file');
    }

    return `/uploads/${filename}`;
  }

  async createImage(
    userId: string,
    listingId: string,
    file: Express.Multer.File,
    position: number,
  ): Promise<ImageObject> {
    await this.assertListingOwnership(userId, listingId);
    const url = await this.saveFile(file);

    const image = await this.prisma.image.create({
      data: {
        listingId,
        url,
        position,
      },
    });

    return this.toImageObject(image);
  }

  async deleteImage(userId: string, id: string): Promise<boolean> {
    const image = await this.prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    await this.assertListingOwnership(userId, image.listingId);

    const diskPath = this.urlToDiskPath(image.url);
    try {
      await fs.unlink(diskPath);
    } catch {
      // file may already be missing; continue with DB delete
    }

    await this.prisma.image.delete({ where: { id } });
    return true;
  }

  async getImagesByListingId(listingId: string): Promise<ImageObject[]> {
    const images = await this.prisma.image.findMany({
      where: { listingId },
      orderBy: { position: 'asc' },
    });
    return images.map((img) => this.toImageObject(img));
  }

  private getExtension(originalname: string): string {
    const dot = originalname.lastIndexOf('.');
    if (dot === -1 || dot === originalname.length - 1) {
      return '';
    }
    return originalname.slice(dot);
  }

  private urlToDiskPath(url: string): string {
    const prefix = '/uploads/';
    const name = url.startsWith(prefix) ? url.slice(prefix.length) : url;
    return join(process.cwd(), 'uploads', name);
  }

  private toImageObject(image: Image): ImageObject {
    return {
      id: image.id,
      listingId: image.listingId,
      url: image.url,
      position: image.position,
    };
  }

  private async assertListingOwnership(
    userId: string,
    listingId: string,
  ): Promise<void> {
    const listing = await this.listingsService.getListing(listingId);
    const seller = await this.prisma.seller.findUnique({
      where: { id: listing.sellerId },
    });

    if (!seller || seller.userId !== userId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }
}
