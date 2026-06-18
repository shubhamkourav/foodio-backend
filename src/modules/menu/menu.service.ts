import { Restaurant } from '../restaurants/restaurant.model.js';
import { MenuCategory } from './menuCategory.model.js';
import { MenuItem, type IMenuItem } from './menuItem.model.js';
import { assertAuthorized, assertCondition, assertFound, ensureFound } from '../../utils/assertions.js';
import { buildPagination, parsePageLimit } from '../../utils/pagination.js';
import { runService } from '../../utils/runService.js';
import { UPLOAD_FOLDERS, uploadImageToCloudinary } from '../../utils/cloudinaryUpload.js';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatMenuItem(item: IMenuItem, restaurantId: string) {
  return {
    id: item._id.toString(),
    restaurantId,
    categoryId: item.category.toString(),
    name: item.name,
    description: item.description,
    image: item.image,
    price: item.price,
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
    isVeg: item.isVeg,
    customizations: item.customizations,
    tags: item.tags,
  };
}

async function assertOwner(restaurantId: string, userId: string, role: string) {
  const restaurant = ensureFound(await Restaurant.findById(restaurantId), 'Restaurant not found');
  assertAuthorized(role === 'admin' || restaurant.owner.toString() === userId);
  return restaurant;
}

async function assertActiveRestaurant(restaurantId: string) {
  return ensureFound(
    await Restaurant.findOne({ _id: restaurantId, isActive: true }),
    'Restaurant not found',
  );
}

export const menuService = {
  async listCategories(restaurantId: string) {
    return runService('menu.listCategories', async () => {
      await assertActiveRestaurant(restaurantId);

      const categories = await MenuCategory.find({ restaurant: restaurantId }).sort({ sortOrder: 1 });
      return categories.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        sortOrder: c.sortOrder,
      }));
    });
  },

  async listItems(restaurantId: string, query: Record<string, unknown>) {
    return runService('menu.listItems', async () => {
      await assertActiveRestaurant(restaurantId);

      const { page, limit, skip } = parsePageLimit(query);
      const filter: Record<string, unknown> = {
        restaurant: restaurantId,
        isAvailable: true,
      };

      if (query.categoryId) {
        filter.category = query.categoryId;
      }

      if (query.isVeg === true) {
        filter.isVeg = true;
      }

      if (query.q) {
        const pattern = escapeRegex(String(query.q));
        filter.name = { $regex: pattern, $options: 'i' };
      }

      if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        const priceFilter: Record<string, number> = {};
        if (query.minPrice !== undefined) {
          priceFilter.$gte = Number(query.minPrice);
        }
        if (query.maxPrice !== undefined) {
          priceFilter.$lte = Number(query.maxPrice);
        }
        filter.price = priceFilter;
      }

      const [items, total] = await Promise.all([
        MenuItem.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
        MenuItem.countDocuments(filter),
      ]);

      return {
        items: items.map((item) => formatMenuItem(item, restaurantId)),
        pagination: buildPagination(page, limit, total),
      };
    });
  },

  async getItem(restaurantId: string, itemId: string) {
    return runService('menu.getItem', async () => {
      await assertActiveRestaurant(restaurantId);

      const item = ensureFound(
        await MenuItem.findOne({ _id: itemId, restaurant: restaurantId, isAvailable: true }),
        'Menu item not found',
      );

      return formatMenuItem(item, restaurantId);
    });
  },

  async createCategory(
    restaurantId: string,
    userId: string,
    role: string,
    data: { name: string; sortOrder?: number },
  ) {
    return runService('menu.createCategory', async () => {
      await assertOwner(restaurantId, userId, role);
      const category = await MenuCategory.create({
        restaurant: restaurantId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
      });
      return { id: category._id.toString(), name: category.name, sortOrder: category.sortOrder };
    });
  },

  async createItem(
    restaurantId: string,
    userId: string,
    role: string,
    data: {
      categoryId: string;
      name: string;
      description?: string;
      image?: string;
      price: number;
      isAvailable?: boolean;
      isPopular?: boolean;
      isVeg?: boolean;
      customizations?: unknown[];
      tags?: string[];
    },
  ) {
    return runService('menu.createItem', async () => {
      await assertOwner(restaurantId, userId, role);

      const category = await MenuCategory.findOne({ _id: data.categoryId, restaurant: restaurantId });
      assertFound(category, 'Category not found');

      assertCondition(data.price >= 0, 400, 'Price must be zero or greater');

      const item = await MenuItem.create({
        restaurant: restaurantId,
        category: data.categoryId,
        name: data.name,
        description: data.description,
        image: data.image,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
        isPopular: data.isPopular ?? false,
        isVeg: data.isVeg ?? false,
        customizations: (data.customizations ?? []) as never,
        tags: data.tags ?? [],
      });
      return { id: item._id.toString(), name: item.name, price: item.price };
    });
  },

  async updateItem(
    restaurantId: string,
    itemId: string,
    userId: string,
    role: string,
    data: Record<string, unknown>,
  ) {
    return runService('menu.updateItem', async () => {
      await assertOwner(restaurantId, userId, role);
      const item = ensureFound(
        await MenuItem.findOne({ _id: itemId, restaurant: restaurantId }),
        'Menu item not found',
      );

      if (data.categoryId) {
        const category = await MenuCategory.findOne({
          _id: data.categoryId,
          restaurant: restaurantId,
        });
        assertFound(category, 'Category not found');
        item.category = data.categoryId as never;
        delete data.categoryId;
      }

      if (data.price !== undefined && Number(data.price) < 0) {
        assertCondition(false, 400, 'Price must be zero or greater');
      }

      Object.assign(item, data);
      await item.save();
      return { id: item._id.toString(), name: item.name, price: item.price };
    });
  },

  async deleteItem(restaurantId: string, itemId: string, userId: string, role: string) {
    return runService('menu.deleteItem', async () => {
      await assertOwner(restaurantId, userId, role);
      const result = await MenuItem.deleteOne({ _id: itemId, restaurant: restaurantId });
      assertCondition(result.deletedCount > 0, 404, 'Menu item not found');
      return { deleted: true };
    });
  },

  async uploadItemImage(
    restaurantId: string,
    itemId: string,
    userId: string,
    role: string,
    file: Express.Multer.File,
  ) {
    return runService('menu.uploadItemImage', async () => {
      await assertOwner(restaurantId, userId, role);
      const item = ensureFound(
        await MenuItem.findOne({ _id: itemId, restaurant: restaurantId }),
        'Menu item not found',
      );

      const { url } = await uploadImageToCloudinary(file, UPLOAD_FOLDERS.menuItems);
      item.image = url;
      await item.save();

      return { id: item._id.toString(), name: item.name, image: item.image, price: item.price };
    });
  },
};
