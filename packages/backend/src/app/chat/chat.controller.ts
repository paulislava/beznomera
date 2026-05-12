import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ChatService } from './chat.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import { RequestUser } from '@paulislava/shared/user/user.types';
import CHAT_API, {
  CHAT_CODE_PARAM,
  CHAT_ID_PARAM,
} from '@paulislava/shared/chat/chat.api';
import {
  ChatContactBody,
  ChatDetails,
  ChatInfo,
  ChatMessageInfo,
  ChatSendMessageBody,
} from '@paulislava/shared/chat/chat.types';
import { ConfigService } from '../config/config.service';

class SendOwnerMessageDto implements ChatSendMessageBody {
  @IsString()
  @IsNotEmpty()
  text: string;

  chatId: number;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

class UpdateContactDto implements ChatContactBody {
  @IsString()
  @IsNotEmpty()
  contactType: string;

  @IsOptional()
  @IsString()
  contactValue?: string;
}

@Controller(CHAT_API.path)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {}

  @Get(CHAT_API.backendRoutes.myChats)
  @UseGuards(JwtAuthGuard)
  myChats(@CurrentUser() user: RequestUser): Promise<ChatInfo[]> {
    return this.chatService.getMyChats(user.userId);
  }

  @Get(CHAT_API.backendRoutes.chatDetails)
  @UseGuards(JwtAuthGuard)
  chatDetails(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<ChatDetails> {
    return this.chatService.getChatDetails(chatId, user.userId);
  }

  @Get(CHAT_API.backendRoutes.chatByCarCode)
  @UseGuards(OptionalJwtAuthGuard)
  chatByCarCode(
    @Param(CHAT_CODE_PARAM) code: string,
    @Req() req: Request,
    @CurrentUser(true) user?: RequestUser,
  ): Promise<ChatDetails> {
    const anonymousId =
      req.cookies?.[this.configService.auth.anonymousIdCookie];
    return this.chatService.getChatByCarCode(code, user?.userId, anonymousId);
  }

  @Post(CHAT_API.backendRoutes.sendOwnerMessage)
  @UseGuards(JwtAuthGuard)
  sendOwnerMessage(
    @Body() body: SendOwnerMessageDto,
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<ChatMessageInfo> {
    return this.chatService.sendOwnerMessage(
      chatId,
      body.text,
      body.attachmentUrl,
      user.userId,
    );
  }

  @Post(CHAT_API.backendRoutes.updateContact)
  @UseGuards(OptionalJwtAuthGuard)
  updateContact(
    @Body() body: UpdateContactDto,
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @Req() req: Request,
    @CurrentUser(true) user?: RequestUser,
  ): Promise<void> {
    const anonymousId =
      req.cookies?.[this.configService.auth.anonymousIdCookie];
    return this.chatService.updateContact(
      chatId,
      body,
      user?.userId,
      anonymousId,
    );
  }
}
