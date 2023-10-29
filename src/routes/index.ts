import express, {Request, Response} from 'express';
import {setUsername} from "../utils/oidc-username";
const router = express.Router();

/* GET home page. */
router.get('/', (req: Request, res: Response) => {
  console.log(req.oidc.user)
  res.render('index', { title: 'Express', currentPage: 'home', competitions: [], username: setUsername(req)});
});

export default router;