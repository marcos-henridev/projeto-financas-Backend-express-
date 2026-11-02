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
}
const dashbordService = new TotolService();
export default dashbordService;
