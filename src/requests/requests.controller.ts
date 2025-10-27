import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { CreateRequestDto } from './dto/create-request.dto';

import { FindRequestsQueryDto } from './dto/find-requests';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateRequestDto) {
    return this.requestsService.createRequest(user.userId, dto);
  }

  @Get()
  async findAll(@Query() query: FindRequestsQueryDto) {
    const { lat, lng, radius, category, importance, limit, skip } =
      query as any;
    return this.requestsService.findNearby({
      lat,
      lng,
      radius,
      category,
      importance,
      limit,
      skip,
    });
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.requestsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.requestsService.updateRequest(id, user.userId, dto);
  }

  // requester confirms helper's offer
  @UseGuards(JwtAuthGuard)
  @Post(':id/confirm')
  async confirmOffer(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('helperId') helperId: string,
  ) {
    return this.requestsService.confirmOffer(id, user.userId, helperId);
  }

  // complete request flow - usually called after both sides confirmed via chat
  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('success') success: boolean,
  ) {
    // In a stricter implementation you would enforce a two-step confirmation via offers/messages
    return this.requestsService.completeRequest(id, user.userId, success);
  }
}
