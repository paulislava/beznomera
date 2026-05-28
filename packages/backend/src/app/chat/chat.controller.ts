import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiClientAuthGuard } from '../auth/api-auth.guard';
import { CurrentUser } from '../users/user.decorator';
import { RequestUser } from '@paulislava/shared/user/user.types';
import CHAT_API, {
  CHAT_CODE_PARAM,
  CHAT_ID_PARAM,
  CHAT_MESSAGE_ID_PARAM,
  CHAT_USER_ID_PARAM,
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
    private readonly chatGateway: ChatGateway,
    private readonly configService: ConfigService,
  ) {}

  @Get(CHAT_API.backendRoutes.myChats)
  @UseGuards(JwtAuthGuard)
  myChats(@CurrentUser() user: RequestUser): Promise<ChatInfo[]> {
    return this.chatService.getMyChats(user.userId);
  }

  @Get(CHAT_API.backendRoutes.myChatsForUser)
  @UseGuards(ApiClientAuthGuard)
  myChatsForUser(
    @Param(CHAT_USER_ID_PARAM, ParseIntPipe) userId: number,
  ): Promise<ChatInfo[]> {
    return this.chatService.getMyChats(userId);
  }

  @Get(CHAT_API.backendRoutes.chatDetails)
  @UseGuards(JwtAuthGuard)
  chatDetails(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<ChatDetails> {
    return this.chatService.getChatDetails(chatId, user.userId);
  }

  @Get(CHAT_API.backendRoutes.chatDetailsForUser)
  @UseGuards(ApiClientAuthGuard)
  chatDetailsForUser(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @Param(CHAT_USER_ID_PARAM, ParseIntPipe) userId: number,
  ): Promise<ChatDetails> {
    return this.chatService.getChatDetails(chatId, userId);
  }

  @Get(CHAT_API.backendRoutes.chatByCarCode)
  @UseGuards(OptionalJwtAuthGuard)
  async chatByCarCode(
    @Param(CHAT_CODE_PARAM) code: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser(true) user?: RequestUser,
  ): Promise<ChatDetails> {
    const cookieName = this.configService.auth.anonymousIdCookie;
    let anonymousId: string | undefined = req.cookies?.[cookieName];

    if (!anonymousId && !user) {
      const ip = req.ip ?? '';
      const ua = (req.headers['user-agent'] as string) ?? '';
      anonymousId = await this.chatService.getOrCreateAnonymousId(
        undefined,
        undefined,
        ip,
        ua,
      );
      if (anonymousId) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 10000);
        res.cookie(cookieName, anonymousId, {
          expires,
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          path: '/',
        });
      }
    }

    return this.chatService.getChatByCarCode(code, user?.userId, anonymousId);
  }

  @Post(CHAT_API.backendRoutes.sendOwnerMessage)
  @UseGuards(JwtAuthGuard)
  async sendOwnerMessage(
    @Body() body: SendOwnerMessageDto,
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<ChatMessageInfo> {
    const message = await this.chatService.sendOwnerMessage(
      chatId,
      body.text,
      body.attachmentUrl,
      user.userId,
    );
    this.chatGateway.emitNewMessage(chatId, message);
    const chatInfo = await this.chatService.getChatInfo(chatId);
    this.chatGateway.emitChatUpdate(user.userId, chatInfo);
    return message;
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

  @Post(CHAT_API.backendRoutes.markAsRead)
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    const chatInfo = await this.chatService.markAsRead(chatId, user.userId);
    this.chatGateway.emitChatUpdate(user.userId, chatInfo);
  }

  @Delete(CHAT_API.backendRoutes.deleteMessage)
  @UseGuards(OptionalJwtAuthGuard)
  async deleteMessage(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @Param(CHAT_MESSAGE_ID_PARAM, ParseIntPipe) messageId: number,
    @Req() req: Request,
    @CurrentUser(true) user?: RequestUser,
  ): Promise<void> {
    const anonymousId =
      req.cookies?.[this.configService.auth.anonymousIdCookie];
    const result = await this.chatService.deleteMessage(
      messageId,
      user?.userId,
      anonymousId,
    );
    this.chatGateway['server']
      .to(`chat:${chatId}`)
      .emit('chat:message_deleted', result);
  }

  @Delete(CHAT_API.backendRoutes.deleteChat)
  @UseGuards(JwtAuthGuard)
  async deleteChat(
    @Param(CHAT_ID_PARAM, ParseIntPipe) chatId: number,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    const ownerId = await this.chatService.deleteChat(chatId, user.userId);
    this.chatGateway['server']
      .to(`chat:${chatId}`)
      .emit('chat:chat_deleted', { chatId });
    this.chatGateway['server']
      .to(`user:${ownerId}`)
      .emit('chat:chat_deleted', { chatId });
  }
}
