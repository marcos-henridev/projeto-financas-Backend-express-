import { type Request, type Response } from 'express';
import transactionService from './transactions.service';

class TransactionController {
  create = async (req: Request, res: Response) => {
    try {
      const {
        account_id,
        destination_account_id,
        category_id,
        kind,
        status,
        description,
        amount,
        due_date,
      } = req.body;

      const transaction = await transactionService.create({
        user_id: req.userId,
        account_id,
        destination_account_id,
        category_id,
        kind,
        status,
        description,
        amount,
        due_date,
      });
      res.status(201).json({ data: transaction });
    } catch (erro) {
      return res.status(400).json({
        erro: erro instanceof Error ? erro.message : 'Erro ao criar transação',
      });
    }
  };
}
const transactionController = new TransactionController();
export default transactionController;
