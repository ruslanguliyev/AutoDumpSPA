import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { AppointmentObject, RequestAppointmentInput } from './appointment.types';
import { AppointmentsService } from './appointments.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AppointmentsResolver {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Mutation(() => AppointmentObject)
  requestAppointment(@CurrentUser() user: AuthUser, @Args('input') input: RequestAppointmentInput) {
    return this.appointmentsService.request(user.id, input);
  }

  @Query(() => [AppointmentObject])
  myAppointments(@CurrentUser() user: AuthUser) {
    return this.appointmentsService.mine(user.id);
  }

  @Query(() => [AppointmentObject])
  incomingAppointments(@CurrentUser() user: AuthUser) {
    return this.appointmentsService.incoming(user.id);
  }

  @Query(() => Int)
  pendingAppointmentsCount(@CurrentUser() user: AuthUser) {
    return this.appointmentsService.pendingCount(user.id);
  }

  @Mutation(() => AppointmentObject)
  decideAppointment(@CurrentUser() user: AuthUser, @Args('id') id: string, @Args('confirm') confirm: boolean) {
    return this.appointmentsService.decide(user.id, id, confirm);
  }

  @Mutation(() => AppointmentObject)
  cancelAppointment(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.appointmentsService.cancel(user.id, id);
  }
}
