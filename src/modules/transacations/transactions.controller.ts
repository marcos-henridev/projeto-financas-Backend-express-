import { type Request, type Response } from 'express';
import transactionService from './transactions.service';
import debug from 'debug';
import { Result } from 'pg';

// Cria a instância com a etiqueta
const log = debug('app:router:transactions');

class TransactionController {
  transctionPaid_at = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await transactionService.addPaid_at({
        user_id: req.userId,
        id_transaction: id,
      });
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({
        erro: err instanceof Error ? err.message : 'Falha no servidor',
      });
    }
  };
  NewUpdate = async (req: Request<{ id: string }>, res: Response) => {
    try {
      log('entrou no controller de transactions update');

      // id da transação
      const { id } = req.params;
      const { category_id, description, due_date } = req.body;

      log('Body recebido %o', req.body);
      const result = await transactionService.editPatch({
        id,
        user_id: req.userId,
        description,
        category_id,
        due_date,
      });
      res.status(200).json(result);
    } catch (erro) {
      log('Deu erro no catch: %s', erro);
      res.status(400).json({ erro: erro instanceof Error ? erro.message : 'Erro na requisição' });
    }
  };

  DeleteTransaction = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await transactionService.DeletedTransaction({
        id,
        user_id: req.userId,
      });
      res.status(204).send();
    } catch (erro) {
      res.status(500).json({
        erro: erro instanceof Error ? erro.message : 'Erro no servidor',
      });
    }
  };

  Get = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await transactionService.GetUnique(req.userId, id);
      res.status(200).json(result);
    } catch (erro) {
      res.status(400).json(erro);
    }
  };

  GetAll = async (req: Request, res: Response) => {
    try {
      const { id, account_id, kind, status, from, to } = req.query;
      const result = await transactionService.GetAll({
        user_id: req.userId,
        id: typeof id === 'string' ? id : undefined,
        account_id: typeof account_id === 'string' ? account_id : undefined,
        kind: typeof kind === 'string' ? kind : undefined,
        status: typeof status === 'string' ? status : undefined,
        from: typeof from === 'string' ? from : undefined,
        to: typeof to === 'string' ? to : undefined,
      });
      res.status(200).json(result);
    } catch (erro) {
      res.status(400).json(erro);
    }
  };
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
