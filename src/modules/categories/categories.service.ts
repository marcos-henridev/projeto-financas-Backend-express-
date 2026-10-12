import categoriesRepository, { type categorieKind } from '../categories/categories.repository';
import { Result } from 'pg';

const VALIDATION_KIND = ['receita', 'despesa'];
class CategoriesService {
  softDelete = async (id: string, user_id: string) => {
    const existForDelet = await categoriesRepository.categorieUserExist({
      id: id,
      userId: user_id,
    });

    if (!existForDelet) throw new Error('categorie notfound');

    const result = await categoriesRepository.delete(id, user_id);
    return result;
  };
  getUniqueCategorie = async (data: { id: string; user_id: string }) => {
    const getUniqueCat = await categoriesRepository.findAllCategories({
      id: data.id,
      user_id: data.user_id,
    });
    if (getUniqueCat.length === 0) throw new Error('Categoria inexistente');

    return getUniqueCat;
  };

  getAllCategories = async (user_id: string) => {
    const returnGet = await categoriesRepository.findAllCategories({ user_id });
    if (returnGet.length === 0) throw new Error('Categorias inexistentes');
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
    if (!existCategorie) throw new Error('categorie notfound');

    let name: string | undefined;
    if (data.name !== undefined) {
      name = data.name.trim();
      const findCategory = await categoriesRepository.findCategorie({
        name,
        userId: data.userId,
        kind: existCategorie.kind,
      });
      if (findCategory) throw new Error('Categorie exist');
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
      throw new Error('Proprieda nome é obrigatoria');
    }

    if (!VALIDATION_KIND.includes(data.kind as categorieKind)) {
      throw new Error('tipo de categoria não aceito');
    }
    const findCategory = await categoriesRepository.findCategorie({
      kind: data.kind as categorieKind,
      userId: data.userId,
      name: name,
    });
    if (findCategory) throw new Error('categoria com esse tipo já existe');

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
