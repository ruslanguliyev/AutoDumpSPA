import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String, { name: 'health' })
  health(): string {
    return this.appService.getHealth();
  }
}
