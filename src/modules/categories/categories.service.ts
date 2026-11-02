import categoriesRepository, { type categorieKind } from '../categories/categories.repository';
import { Result } from 'pg';
import transactionsRepository from '../transactions/transactions.repository';
import { prisma } from '../../prisma';
import { AppError } from '../../errors/AppError';

const VALIDATION_KIND = ['receita', 'despesa'];
class CategoriesService {
  softDelete = async (id: string, user_id: string) => {
    const existForDelet = await categoriesRepository.categorieUserExist({
      id: id,
      userId: user_id,
    });

    if (!existForDelet) throw new AppError('Category not found', 404);

    const transactionCategory = await prisma.transactions.findFirst({
      where: {
        category_id: id,
        user_id: user_id,
        deleted_at: null,
      },
    });
    if (transactionCategory)
      throw new AppError('Category is used by one or more transactions', 409);

    const result = await categoriesRepository.delete(id, user_id);
    return result;
  };
  getUniqueCategorie = async (data: { id: string; user_id: string }) => {
    const getUniqueCat = await categoriesRepository.findAllCategories({
      id: data.id,
      user_id: data.user_id,
    });
    if (getUniqueCat.length === 0) throw new AppError('Category not found', 404);

    return getUniqueCat;
  };

  getAllCategories = async (user_id: string) => {
    const returnGet = await categoriesRepository.findAllCategories({ user_id });
    if (returnGet.length === 0) throw new AppError('No categories found', 404);
    return returnGet;
  };

  updateCategorie = async (data: {
    userId: string;
    id: string;
    name?: string;
    color?: string;
    icon?: string;
  }) => {
    const existCategorie = await categoriesRepository.categorieUserExist({
      id: data.id,
      userId: data.userId,
    });
    if (!existCategorie) throw new AppError('Category not found', 404);

    let name: string | undefined;
    if (data.name !== undefined) {
      name = data.name.trim();
      const findCategory = await categoriesRepository.findCategorie({
        name,
        userId: data.userId,
        kind: existCategorie.kind,
      });
      if (findCategory) throw new AppError('Category already exists', 409);
    }

    const updateNewUnique = await categoriesRepository.update({
      userId: data.userId,
      id: data.id,
      color: data.color,
      icon: data.icon,
      name: data.name,
    });
    return updateNewUnique;
  };
  CreateCategorie = async (data: {
    userId: string;
    name: string;
    kind: categorieKind;
    color: string;
    icon: string;
  }) => {
    //Validação de banco de dados
    const name = data.name.trim();

    if (!name) {
      throw new AppError('Name is required', 400);
    }

    if (!VALIDATION_KIND.includes(data.kind as categorieKind)) {
      throw new AppError('Invalid category kind', 400);
    }
    const findCategory = await categoriesRepository.findCategorie({
      kind: data.kind as categorieKind,
      userId: data.userId,
      name: name,
    });
    if (findCategory) throw new AppError('Category already exists', 409);

    const createNewCategory = await categoriesRepository.create({
      userId: data.userId,
      name: name,
      kind: data.kind,
      color: data.color,
      icon: data.icon,
    });
    return createNewCategory;
  };
}
const categoriesService = new CategoriesService();
export default categoriesService;
