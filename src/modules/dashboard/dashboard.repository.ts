import { count } from 'node:console';
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
}
const totalRepository = new TotalRepository();
export default totalRepository;
