import totalRepository from './dashboard.repository';

class TotolService {
  allAccounts = async (data: { user_id: string }) => {
    const total = await totalRepository.accountTotal({
      user_id: data.user_id,
    });
    return { total_balance: Number(total) ?? 0 };
  };
}
const totalService = new TotolService();
export default totalService;
