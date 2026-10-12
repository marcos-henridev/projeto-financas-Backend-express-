import { prisma } from '../../prisma';

export type categorieKind = 'receita' | 'despesa';
class CategoiesRepository {
  delete = async (id: string, user_id: string) => {
    return prisma.categories.update({
      where: { id, user_id, is_active: true },
      data: {
        is_active: false,
        updated_at: new Date(),
      },
    });
  };
  update = async (data: {
    userId: string;
    id: string;
    name?: string;
    color?: string;
    icon?: string;
  }) => {
    return await prisma.categories.update({
      where: { id: data.id, user_id: data.userId },
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        updated_at: new Date(),
      },
    });
  };
  categorieUserExist = async (data: { id: string; userId: string }) => {
    return await prisma.categories.findFirst({
      where: { id: data.id, user_id: data.userId, is_active: true },
    });
  };
  //chacagem de existencia dessa categoria com esse mesmo nome e kind
  findCategorie = async (data: { id?: string; kind?: string; name?: string; userId: string }) => {
    return prisma.categories.findFirst({
      where: {
        name: { equals: data.name, mode: 'insensitive' },
        user_id: data.userId,
        kind: data.kind as categorieKind,
        is_active: true,
      },
    });
  };

  findAllCategories = async (data: { user_id: string; id?: string }) => {
    return prisma.categories.findMany({
      where: { id: data.id, user_id: data.user_id, is_active: true },
    });
  };

  create = async (data: {
    userId: string;
    name: string;
    kind: string;
    color: string;
    icon: string;
  }) => {
    return prisma.categories.create({
      data: {
        user_id: data.userId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        kind: data.kind as categorieKind,
      },
    });
  };
}
const categoriesRepository = new CategoiesRepository();
export default categoriesRepository;
