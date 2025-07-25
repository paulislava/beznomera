import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../entities/car/car.entity';
import { Repository } from 'typeorm';
import {
  CarInfo,
  EditCarInfo,
  FullCarInfo,
  ShortCarInfo,
  CarCallBody,
  CarMessageBody,
  AddOwnerBody,
  TelegramContact,
} from '@paulislava/shared/car/car.types';
import { Call } from '../entities/call.entity';
import { TelegramService } from '../telegram/telegram.service';
import { RequestUser } from '@paulislava/shared/user/user.types';
import { Agent } from 'useragent';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore cannot find module?
import { lookup } from 'ip-location-api';
import { CALL_TIMEOUT_S } from '~/constants';
import {
  CallNeedTimeoutException,
  CarNotFoundException,
  ValidationException,
} from './car.exceptions';
import { Chat } from '../entities/chat/chat.entity';
import { ChatMessage } from '../entities/chat/message.entity';
import { AnonymousUser } from '../entities/user/anonymous-user.entity';
import { ConfigService } from '../config/config.service';
import { Response, Request } from 'express';
import { CarCreateDto } from './car.controller';
import { SubmissionError, ValidationCode } from '@paulislava/shared/errors';
import { ChatService } from '../chat/chat.service';
import { BrandInfo, ModelInfo } from '@paulislava/shared/car/car.types';
import { Brand } from '../entities/car/brand.entity';
import { Model } from '../entities/car/model.entity';
import { User } from '../entities/user/user.entity';
@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Call) private readonly callRepository: Repository<Call>,
    @InjectRepository(AnonymousUser)
    private readonly anonymousUserRepository: Repository<AnonymousUser>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messagesRepository: Repository<ChatMessage>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Model)
    private readonly modelRepository: Repository<Model>,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  async getList(): Promise<string[]> {
    const cars = await this.carRepository.find({
      select: ['code'],
    });

    return cars.map((car) => car.code);
  }

  async getInfo(code: string): Promise<CarInfo> {
    const {
      id,
      no,
      model,
      brand,
      brandRaw,
      year,
      version,
      color,
      owner,
      rawColor,
      imageUrl,
      imageRatio: imageRatio,
    } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner', 'brand', 'color'],
    });

    return {
      id,
      no,
      brand,
      brandRaw,
      model,
      year,
      version,
      color,
      rawColor,
      imageUrl,
      imageRatio: imageRatio,
      owner: {
        firstName: owner.firstName,
        lastName: owner.lastName,
        nickname: owner.nickname,
        tel: owner.tel,
      },
    };
  }

  async call(
    code: string,
    { coords }: CarCallBody,
    userAgent: Agent,
    ip: string,
  ): Promise<void> {
    const { id, no, owner } = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

    const lastCall = await this.callRepository.findOne({
      where: { car: { id }, ip },
      order: { date: 'DESC' },
    });

    if (
      lastCall &&
      (new Date().getTime() - lastCall.date.getTime()) / 1000 < CALL_TIMEOUT_S
    ) {
      throw new CallNeedTimeoutException(id);
    }

    let text = `${no}: позвали водителя.\nОтправлено из: ${userAgent.family}, ${userAgent.os.family}`;

    const ipInfo = await lookup(ip);
    if (ipInfo?.city) {
      text += `\n${ipInfo.city}, ${ipInfo.region1_name}${ipInfo.region2_name && `, ${ipInfo.region2_name}`}, ${ipInfo.country_name}`;
    }

    await this.callRepository.save({ car: { id }, ip });

    const message = await this.telegramService.sendMessage(text, owner);

    if (coords) {
      await this.telegramService.sendLocation(coords, owner, {
        reply_to_message_id: message.message_id,
      });
    }
  }

  async userList({ userId }: RequestUser): Promise<ShortCarInfo[]> {
    const cars = await this.carRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner', 'brand', 'color'],
    });

    return cars;
  }

  async sendMessage(
    code: string,
    { coords, text }: CarMessageBody,
    userAgent: string,
    ip: string,
    res: Response,
    req: Request,
    user?: RequestUser,
  ) {
    const car = await this.carRepository.findOneOrFail({
      where: { code },
      relations: ['owner'],
    });

    await this.chatService.sendMessage(
      car,
      {
        coords,
        text,
      },
      userAgent,
      ip,
      user,
      res,
      req,
    );
  }

  async getFullInfo(id: number, user?: RequestUser): Promise<FullCarInfo> {
    const car = await this.carRepository.findOne({
      where: { id, owner: user ? { id: user.userId } : undefined },
      relations: ['owner', 'brand', 'color'],
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    const [messagesCount, callsCount, chatsCount] = await Promise.all([
      this.chatService.getMessagesCount(id),
      this.callRepository.count({
        where: { car: { id } },
      }),
      this.chatService.getChatsCount(id),
    ]);

    return {
      ...car,
      messagesCount,
      callsCount,
      chatsCount,
      owner: {
        firstName: car.owner.firstName,
        lastName: car.owner.lastName,
        nickname: car.owner.nickname,
        tel: car.owner.tel,
        id: car.owner.id,
      },
    };
  }

  async getInfoForUpdate(id: number, user: RequestUser): Promise<EditCarInfo> {
    const car = await this.carRepository.findOne({
      where: { id, owner: { id: user.userId } },
      relations: ['brand', 'color'],
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    return {
      no: car.no,
      model: car.model,
      version: car.version,
      imageUrl: car.imageUrl,
      code: car.code,
      color: {
        value: car.color,
        newValue: car.rawColor,
      },
      brand: car.brand?.id,
      // brand: {
      //   value: car.brand,
      //   newValue: car.brandRaw,
      // },
      year: car.year,
      imageRatio: car.imageRatio,
    };
  }

  async update(
    id: number,
    data: EditCarInfo,
    user: RequestUser,
  ): Promise<void> {
    const car = await this.carRepository.findOne({
      where: { id, owner: { id: user.userId } },
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    await this.carRepository.update(car.id, {
      no: data.no,
      model: data.model,
      version: data.version,
      color: data.color?.value && {
        id: data.color?.value.id,
      },
      brand: data.brand && {
        id: data.brand,
      },
      // brand: data.brand?.value && {
      //   id: data.brand?.value.id,
      // },
      rawColor: data.color?.newValue,
      // brandRaw: data.brand?.newValue,
      year: data.year,
      imageRatio: data.imageRatio,
      imageUrl: data.imageUrl,
      code: data.code,
    });
  }

  async create(data: CarCreateDto, user: RequestUser): Promise<number> {
    // Проверяем уникальность номера и кода
    const [existingNo, existingCode] = await Promise.all([
      this.carRepository.findOne({ where: { no: data.no } }),
      data.code && this.carRepository.findOne({ where: { code: data.code } }),
    ]);

    const errors: Record<string, SubmissionError[]> = {};

    if (existingNo) {
      errors.no = [
        {
          message: 'Автомобиль с таким номером уже существует',
          code: ValidationCode.DUPLICATE_NUMBER,
        },
      ];
    }

    if (existingCode) {
      errors.code = [
        {
          message: 'Автомобиль с таким кодом уже существует',
          code: ValidationCode.DUPLICATE_CODE,
        },
      ];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }

    const code = data.code || data.no.toLowerCase().replace(/\s+/g, '');

    const car = this.carRepository.create({
      no: data.no,
      model: data.model,
      version: data.version,
      year: data.year,
      imageRatio: data.imageRatio,
      imageUrl: data.imageUrl,
      owner: {
        id: user.userId,
      },
      code,
      color: data.color?.value && {
        id: data.color.value.id,
      },
      brand: data.brand && {
        id: data.brand,
      },
      // brand: data.brand?.value && {
      //   id: data.brand?.value.id,
      // },
      // brandRaw: data.brand?.newValue,
      rawColor: data.color?.newValue,
    });

    await this.carRepository.save(car);
    return car.id;
  }

  async sendPlate(image: string, id: number, user: RequestUser): Promise<void> {
    const car = await this.carRepository.findOne({
      where: { id, owner: { id: user.userId } },
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    await this.telegramService.sendPhoto(
      image,
      user,
      `Автовизитка ${car.no}.png`,
      `Автовизитка ${car.no}`,
    );
  }

  async sendQR(image: string, id: number, user: RequestUser): Promise<void> {
    const car = await this.carRepository.findOne({
      where: { id, owner: { id: user.userId } },
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    await this.telegramService.sendPhoto(
      image,
      user,
      `QR-код ${car.no}.png`,
      `QR-код ${car.no}`,
    );
  }

  async delete(id: number, user: RequestUser): Promise<void> {
    const car = await this.carRepository.findOne({
      where: { id, owner: { id: user.userId } },
    });

    if (!car) {
      throw new CarNotFoundException(id);
    }

    await car.remove();
  }

  async getBrands(): Promise<BrandInfo[]> {
    return this.brandRepository.find();
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.modelRepository.find();
  }

  async addOwner(body: AddOwnerBody, userId: number): Promise<void> {
    const car = await this.carRepository.findOneOrFail({
      where: { id: body.carId },
      relations: ['owner'],
    });

    // Проверяем, что пользователь является владельцем автомобиля
    if (car.owner.id !== userId) {
      throw new Error('Только владелец автомобиля может добавлять других владельцев');
    }

    // Ищем или создаем пользователя по Telegram ID
    const userRepo = this.carRepository.manager.getRepository(User);
    let newOwner = await userRepo.findOne({ where: { telegramID: body.contact.id } });

    if (!newOwner) {
      newOwner = userRepo.create({
        firstName: body.contact.first_name,
        lastName: body.contact.last_name,
        nickname: body.contact.username,
        telegramID: body.contact.id,
        tel: body.contact.phone_number,
      });
      newOwner = await userRepo.save(newOwner);
    }

    // Обновляем владельца автомобиля
    car.owner = newOwner;
    await this.carRepository.save(car);
  }
}
