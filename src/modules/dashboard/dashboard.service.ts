import { AppError } from '../../errors/AppError';
import dashboardRepository from './dashboard.repository';

class TotolService {
  allAccounts = async (data: { user_id: string }) => {
    const total = await dashboardRepository.accountTotal({
      user_id: data.user_id,
    });
    return { total_balance: Number(total) ?? 0 };
  };
  GetQueryFilter = async (data: { user_id: string; from: string; to: string }) => {
    //data origem com  fuso ajustado
    const from = new Date(`${data.from}T00:00:00.000-03:00`);
    if (Number.isNaN(from.getTime())) throw new AppError('invalidate date origin', 400);

    //data destino com fuso ajustado
    const to = new Date(`${data.to}T23:59:59.999-03:00`);
    if (Number.isNaN(to.getTime())) throw new AppError('invalidate date destine', 400);

    if (from > to) throw new AppError('Date origin has to be major the destiny');

    return await dashboardRepository.filterRDSfromTo({ user_id: data.user_id, from: from, to: to });
  };
  filterPendentes = async (data: { user_id: string }) => {
    return await dashboardRepository.filterPendentes({ user_id: data.user_id });
  };

  gastosPorCategoria = async (data: { user_id: string; from?: string; to?: string }) => {
    const formato = /^\d{4}-\d{2}-\d{2}$/;
    if (!data.from || !data.to) throw new AppError('from and to are required (YYYY-MM-DD)', 400);
    if (!formato.test(data.from) || !formato.test(data.to)) {
      throw new AppError('invalid date format, use YYYY-MM-DD', 400);
    }

    // início e fim do dia no fuso de São Paulo
    const from = new Date(`${data.from}T00:00:00.000-03:00`);
    if (Number.isNaN(from.getTime())) throw new AppError('invalidate date origin', 400);

    const to = new Date(`${data.to}T23:59:59.999-03:00`);
    if (Number.isNaN(to.getTime())) throw new AppError('invalidate date destine', 400);

    if (from > to) throw new AppError('from must be before or equal to to', 400);

    const { grupos, categorias } = await dashboardRepository.getGastosPorCategoria({
      user_id: data.user_id,
      from,
      to,
    });

    const mapaCategorias = new Map(categorias.map((c) => [c.id, c]));
    const total = grupos.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0);

    const itens = grupos.map((g) => {
      const categoria = g.category_id ? mapaCategorias.get(g.category_id) : undefined;
      const valor = Number(g._sum.amount ?? 0);
      return {
        category_id: g.category_id,
        name: categoria?.name ?? 'Sem categoria',
        color: categoria?.color ?? null,
        icon: categoria?.icon ?? null,
        total: valor,
        quantidade: g._count._all,
        percentual: total > 0 ? Number(((valor / total) * 100).toFixed(2)) : 0,
      };
    });

    return { from: data.from, to: data.to, total, categorias: itens };
  };
}
const dashbordService = new TotolService();
export default dashbordService;
