import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import * as webpush from 'web-push';

import { PushSubscription } from '../entities/push-subscription.entity';
import { CarDriver } from '../entities/car/car-driver.entity';
import { Car } from '../entities/car/car.entity';
import { ConfigService } from '../config/config.service';
import { CarNotificationEvent, PushPayload } from '@paulislava/shared/notification/notification.types';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private readonly pushSubscriptionRepository: Repository<PushSubscription>,
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(CarDriver)
    private readonly carDriverRepository: Repository<CarDriver>,
    private readonly configService: ConfigService,
  ) {
    const { subject, publicKey, privateKey } = configService.vapid;
    webpush.setVapidDetails(subject, publicKey, privateKey);
  }

  getVapidPublicKey(): string {
    return this.configService.vapid.publicKey;
  }

  async subscribe(userId: number, endpoint: string, p256dh: string, auth: string): Promise<void> {
    const existing = await this.pushSubscriptionRepository.findOne({
      where: { userId, endpoint },
    });

    if (existing) {
      existing.p256dh = p256dh;
      existing.auth = auth;
      await this.pushSubscriptionRepository.save(existing);
    } else {
      await this.pushSubscriptionRepository.save({ userId, endpoint, p256dh, auth });
    }
  }

  async unsubscribe(userId: number, endpoint: string): Promise<void> {
    await this.pushSubscriptionRepository.delete({ userId, endpoint });
  }

  @OnEvent('car.message')
  async onCarMessage(event: CarNotificationEvent): Promise<void> {
    this.logger.debug(`car.message event received for carId=${event.carId}`);
    await this.sendToCarOwners(event.carId, {
      type: event.type,
      carCode: event.carCode,
      title: event.title,
      body: event.body,
    });
  }

  @OnEvent('car.rating')
  async onCarRating(event: CarNotificationEvent): Promise<void> {
    await this.sendToCarOwners(event.carId, {
      type: event.type,
      carCode: event.carCode,
      title: event.title,
      body: event.body,
    });
  }

  @OnEvent('car.call')
  async onCarCall(event: CarNotificationEvent): Promise<void> {
    await this.sendToCarOwners(event.carId, {
      type: event.type,
      carCode: event.carCode,
      title: event.title,
      body: event.body,
    });
  }

  private async sendToCarOwners(carId: number, payload: PushPayload): Promise<void> {
    const car = await this.carRepository.findOne({ where: { id: carId } });
    if (!car) return;

    const carDrivers = await this.carDriverRepository.find({ where: { carId } });
    const userIds = [car.ownerId, ...carDrivers.map((cd) => cd.driverId)];

    const subscriptions = await this.pushSubscriptionRepository.find({
      where: { userId: In(userIds) },
    });

    this.logger.debug(`Sending push to ${subscriptions.length} subscription(s) for carId=${carId}`);

    const payloadStr = JSON.stringify(payload);

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payloadStr,
          );
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await this.pushSubscriptionRepository.delete({ id: sub.id });
          } else {
            this.logger.warn(`Push send failed for subscription ${sub.id}: ${err?.message}`);
          }
        }
      }),
    );
  }
}
