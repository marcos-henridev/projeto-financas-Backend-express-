import { type Response, type Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function validation(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não informado' });
  }

  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer' || !token)
    return res.status(401).json({ erro: 'Formato de token inválido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { signId: string };
    req.userId = decoded.signId;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}
