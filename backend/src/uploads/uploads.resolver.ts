import { Args, Query, Resolver } from '@nestjs/graphql';
import { ImageObject } from './image.types';
import { UploadsService } from './uploads.service';

@Resolver(() => ImageObject)
export class UploadsResolver {
  constructor(private readonly uploadsService: UploadsService) {}

  @Query(() => [ImageObject])
  async imagesByListing(
    @Args('listingId') listingId: string,
  ): Promise<ImageObject[]> {
    return this.uploadsService.getImagesByListingId(listingId);
  }
}
