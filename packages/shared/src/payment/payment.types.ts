export interface PaymentOptionFull {
  id: string;
  summ: number;
  bonusPercent: number | null;
  bonusSumm: number | null;
  recommended: boolean;
}
