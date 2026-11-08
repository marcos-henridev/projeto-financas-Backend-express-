import { prisma } from '../../prisma';

class TotalRepository {
  accountTotal = async (data: { user_id: string }) => {
    const result = await prisma.accounts.aggregate({
      where: {
        user_id: data.user_id,
        is_active: true,
      },
      _sum: { current_balance: true },
    });
    return result._sum.current_balance;
  };

  filterRDSfromTo = async (data: { user_id: string; from: Date; to: Date }) => {
    return prisma.transactions.groupBy({
      by: ['kind'],
      where: {
        user_id: data.user_id,
        deleted_at: null,
        paid_at: { gte: data.from, lte: data.to },
        status: 'pago',
        kind: { in: ['receita', 'despesa'] },
      },
      _sum: { amount: true },
    });
  };
  filterPendentes = async (data: { user_id: string }) => {
    // DD/MM/YYYY
    const dia = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    //DIA DE HOJE
    const hoje = new Date(`${dia}T00:00:00.000Z`);

    const pendentes = await prisma.transactions.findMany({
      where: {
        user_id: data.user_id,
        status: 'pendente',
        deleted_at: null,
      },
      orderBy: { due_date: 'asc' },
    });

    const formartar = (lista: typeof pendentes) => ({
      total: lista.reduce((acc, t) => acc + Number(t.amount), 0),
      itens: lista.map((i) => ({
        id: i.id,
        kind: i.kind,
        status: i.status,
        description: i.description,
        amount: i.amount,
        due_date: i.due_date,
        atrasada: i.due_date ? (i.due_date < hoje ? 'VENCIDO' : 'EM DIA') : 'SEM VENCIMENTO',
      })),
    });
    return {
      receitas: formartar(pendentes.filter((e) => e.kind === 'receita')),
      despesas: formartar(pendentes.filter((e) => e.kind === 'despesa')),
    };
  };

  getGastosPorCategoria = async (data: { user_id: string; from: Date; to: Date }) => {
    const grupos = await prisma.transactions.groupBy({
      by: ['category_id'],
      where: {
        user_id: data.user_id,
        kind: 'despesa',
        status: 'pago',
        deleted_at: null,
        paid_at: { gte: data.from, lte: data.to },
      },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    const ids = grupos
      .map((g) => g.category_id)
      .filter((id): id is string => id !== null && id !== undefined);

    // sem filtro de is_active: gastos antigos de categoria desativada continuam com nome
    const categorias = await prisma.categories.findMany({
      where: {
        user_id: data.user_id,
        id: { in: ids },
      },
      select: { id: true, name: true, color: true, icon: true },
    });

    return { grupos, categorias };
  };
}
const dashboardRepository = new TotalRepository();
export default dashboardRepository;
