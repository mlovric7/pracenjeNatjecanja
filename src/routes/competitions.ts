import express, {NextFunction, Request, Response} from 'express';
import {setUsername} from "../utils/oidc-username";
import createError from "http-errors";
import {requiresAuth} from "express-openid-connect";
import {
    calculatePoints,
    getCompetition,
    getCompetitors,
    getMatches,
    updateMatches,
    updatePoints
} from "../service/competitions-service";

const router = express.Router();


// view the tournament
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const competitionId = req.params.id
    const competition = await getCompetition(competitionId)

    if (competition) {
        const competitors = await getCompetitors(competitionId);
        const matches = await getMatches(competitionId);
        const username = setUsername(req)
        res.render('competition', {competitionName: competition.name, competitionId: competition.id, canEdit: req.oidc.user?.sub === competition.user, competitors: competitors, matches: matches, username: username});
        return
    }
    // throw error from here
    next(createError(404, 'To natjecanje ne postoji'));
});

// edit the tournament
router.get('/results/:id', requiresAuth(), async (req: Request, res: Response, next: NextFunction) => {
    const competitionId = req.params.id
    const competition = await getCompetition(competitionId)

    if (competition) {
        if(req.oidc.user?.sub !== competition.user) {
            next(createError(403, 'Niste vlasnik natjecanja, ne mozete ga uredivati'))
            return
        }
        const competitors = await getCompetitors(competitionId);
        const matches = await getMatches(competitionId);

        const username = setUsername(req)
        res.render('competition-results', {competitionName: competition.name, competitionId: competition.id, competitors: competitors, matches: matches, username: username});
        return
    }
    // throw error from here
    next(createError(404, 'To natjecanje ne postoji'));
});


router.post('/results/:id', async (req: Request, res: Response, next: NextFunction) => {
    const competitionId = req.params.id
    const competition = await getCompetition(competitionId)

    if (competition) {
        if(req.oidc.user?.sub !== competition.user) {
            next(createError(403, 'Niste vlasnik natjecanje, ne mozete ga uredivati'))
            return
        }

        const matchesNew = req.body.matches.map((str: string) => JSON.parse(str))
        await updateMatches(matchesNew);

        const competitors = await getCompetitors(competitionId)
        calculatePoints(matchesNew, competitors, competition);
        await updatePoints(competitors);

        res.redirect("/competitions/" + competitionId)
        return
    }
    // throw error from here
    next(createError(404, 'To natjecanje ne postoji'));
});


export default router;
