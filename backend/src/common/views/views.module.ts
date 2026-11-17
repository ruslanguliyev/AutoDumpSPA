import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ViewsResolver } from './views.resolver';
import { ViewsService } from './views.service';

@Global()
@Module({
  imports: [AuthModule],
  providers: [ViewsService, ViewsResolver],
  exports: [ViewsService],
})
export class ViewsModule {}
