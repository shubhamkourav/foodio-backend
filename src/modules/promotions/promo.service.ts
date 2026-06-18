import { Promo, type IPromo } from './promo.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertCondition } from '../../utils/assertions.js';
import { runService } from '../../utils/runService.js';

function calculateDiscount(subtotal: number, promo: IPromo): number {
  if (subtotal < promo.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount for this promo is ${promo.minOrderAmount}`);
  }

  let discount =
    promo.discountType === 'percent'
      ? (subtotal * promo.discountValue) / 100
      : promo.discountValue;

  if (promo.maxDiscount !== undefined) {
    discount = Math.min(discount, promo.maxDiscount);
  }

  return Math.min(discount, subtotal);
}

export const promoService = {
  async listActive() {
    return runService('promo.listActive', async () => {
      const promos = await Promo.findActive();
      return promos.map((p) => ({
        id: p._id.toString(),
        code: p.code,
        description: p.description,
        discountType: p.discountType,
        discountValue: p.discountValue,
        minOrderAmount: p.minOrderAmount,
        validUntil: p.validUntil,
      }));
    });
  },

  async validate(code: string, subtotal: number) {
    return runService('promo.validate', async () => {
      const promo = await Promo.findByCode(code);
      assertCondition(Boolean(promo), 400, 'Invalid or expired promo code');

      const discount = calculateDiscount(subtotal, promo as IPromo);
      return {
        code: (promo as IPromo).code,
        discount,
        discountType: (promo as IPromo).discountType,
      };
    });
  },

  async create(data: {
    code: string;
    description: string;
    discountType: 'percent' | 'fixed';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    validFrom: Date;
    validUntil: Date;
    usageLimit?: number;
  }) {
    return runService('promo.create', async () => {
      const existing = await Promo.findOne({ code: data.code.toUpperCase() });
      assertCondition(!existing, 409, 'Promo code already exists');

      const promo = await Promo.create({
        ...data,
        code: data.code.toUpperCase(),
        minOrderAmount: data.minOrderAmount ?? 0,
        isActive: true,
      });

      return {
        id: promo._id.toString(),
        code: promo.code,
        description: promo.description,
      };
    });
  },
};
