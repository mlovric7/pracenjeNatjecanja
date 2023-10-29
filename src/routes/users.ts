import express, {Request, Response} from 'express';
import {requiresAuth} from "express-openid-connect";
import {setUsername} from "../utils/oidc-username";
import pool from "../database/db";
import format from 'pg-format'
import {generateMatches} from "../utils/generate-matches";
import {match} from "assert";

const router = express.Router();

type CompetitionBody = {
  competitionName: string,
  scoringSystem: string,
  competitors: string
}

type Competition = {
  name: string;
  pointsOnWin: number;
  pointsOnDraw: number;
  pointsOnLose: number;
  competitors: Competitor[]
};

export type Competitor = {
  id?: number,
  name: string,
  competitionId?: number,
  currentPoints: number
}


router.use(requiresAuth())

/* GET users listing. */
router.get('/competition/new', (req: Request, res: Response) => {
  res.render('create-competition', { title: 'Kreiraj Najecanje', currentPage: 'create competition', username: setUsername(req)});
});

router.post('/competition/new', async (req: Request, res: Response) => {
  const user_uid = req.oidc.user?.sub
  console.log(req.body)
  let error: string | undefined = checkCompetitionData(req.body);
  if (error) {
    console.log(error)
    res.render('create-competition', {title: 'Kreiraj Najecanje', currentPage: 'create competition', username: setUsername(req), error: error});
    return
  }

  const competition = requestToCompetition(req)

  const competition_query = 'INSERT INTO competition(competitionName, user_uid, pointsOnWin, pointsOnLose, pointsOnDraw) VALUES($1, $2, $3, $4, $5) RETURNING id'
  const competition_data = [competition.name, user_uid, competition.pointsOnWin, competition.pointsOnLose, competition.pointsOnDraw]
  const query_result = await pool.query(competition_query, competition_data)
  const competition_id = query_result.rows[0].id

  const competitor_query = 'INSERT INTO competitors(competitor_name, competition_id, current_points) VALUES($1, $2, 0) RETURNING id'
  const competitors = competition.competitors
  for (const competitor of competition.competitors) {
    const competitor_data = [competitor.name, competition_id]
    competitor.id = (await pool.query(competitor_query, competitor_data)).rows[0].id
  }

  const matches = generateMatches(competitors, competition_id)
  console.log(matches)

  const matches_query = format('INSERT INTO competition_match(competition_id, competitor1_id, competitor2_id, match_day_number) VALUES %L', matches)

  await pool.query(matches_query)

  res.redirect(`/competitions/${competition_id}`) // redirect to the newly created competition
});

function areAllNumbers(strings: string[]): boolean {
  return strings.every((str) => str !== '' && !isNaN(Number(str)));
}

function checkCompetitionData(competition: CompetitionBody): string | undefined {
  if(!competition.competitionName.trim()) return 'Niste zadali ime natjecanja!'
  if(!competition.scoringSystem.trim()) return 'Niste unijeli sustav bodovanja!'
  if(!competition.competitors.trim()) return 'Niste unijeli natjecatelje!'

  const scoringSystem = competition.scoringSystem.split('/')
  if(scoringSystem.length != 3 || !areAllNumbers(scoringSystem)) return 'Niste koristili dobar format za sustav bodovanja!'

  const competitors = competition.competitors.split(/[\n;]/).filter(str => str.trim() !== '') // /;|\s*[\r\n]+\s*/
  if(competitors.length > 8 || competitors.length < 4) return 'Unijeli ste premalo ili previse natjecatelja, dozvoljeno je 4-8'
  return undefined;
}

function createCompetitorsList(competitorsData: string): Competitor[]{
  let competitors: Competitor[] = []
  const competitor_names = competitorsData.split(/[\n\r;]/).filter(str => str.trim() !== '')
  for(const competitor of competitor_names){
    competitors.push({currentPoints: 0, name: competitor.trim()})
  }
  if(competitors.length % 2 !== 0) competitors.push({currentPoints: 0, name: "BYE"})
  return competitors
}

function requestToCompetition(request: Request): Competition {
  const body = request.body
  const scoringSystem = body.scoringSystem.trim().split('/')
  const competitors = createCompetitorsList(body.competitors.trim())
  return {
    name: body.competitionName.trim(),
    pointsOnWin: scoringSystem[0].trim(),
    pointsOnDraw: scoringSystem[1].trim(),
    pointsOnLose: scoringSystem[2].trim(),
    competitors: competitors
  }
}

export default router;
