import pool from "../database/db";

export async function updatePoints(competitors: any[]) {
    const updatePointsQuery = 'UPDATE competitors SET current_points = $1 WHERE id = $2'
    for (const competitor of competitors) {
        await pool.query(updatePointsQuery, [competitor.points, competitor.id])
    }
}

export function calculatePoints(matchesNew: any, competitors: any[], competition: any) {
    for(const competitor of competitors){
        competitor.points = 0
    }

    for (const match of matchesNew) {
        const competitor1 = competitors.find((c) => c.id === match.competitor1);
        const competitor2 = competitors.find((c) => c.id === match.competitor2);

        if (competitor1 && competitor2) {
            if (match.outcome === 'competitor1') {
                competitor1.points += competition.pointsonwin;
                competitor2.points += competition.pointsonlose;
            } else if (match.outcome === 'competitor2') {
                competitor2.points += competition.pointsonwin;
                competitor1.points += competition.pointsonlose;
            } else if (match.outcome === 'draw') {
                competitor1.points += competition.pointsondraw;
                competitor2.points += competition.pointsondraw;
            }
        }
    }
}

export async function getCompetitors(competitionId: string) {
    return (await pool.query('SELECT competitor_name AS name, current_points AS points, id FROM competitors WHERE competition_id = $1 AND competitor_name <> \'BYE\'', [competitionId])).rows.sort((a, b) => b.points - a.points);
}

export async function getCompetition(competitionId: string) {
    return (await pool.query('SELECT id, competitionName AS name, user_uid AS user, pointsOnWin, pointsOnLose, pointsOnDraw FROM competition WHERE id = $1', [competitionId])).rows[0];
}

export async function getMatches(competitionId: string) {
    return (await pool.query(`
  SELECT
    cm.match_day_number AS round, cm.outcome AS outcome, cm.id AS id, cm.competitor1_id AS competitor1, cm.competitor2_id AS competitor2,
    c1.competitor_name AS competitor1_name,
    c2.competitor_name AS competitor2_name
  FROM competition_match AS cm
  JOIN competitors AS c1 ON cm.competitor1_id = c1.id
  JOIN competitors AS c2 ON cm.competitor2_id = c2.id
  WHERE cm.competition_id = $1
`, [competitionId])).rows.sort((a, b) => a.round - b.round);
}

export async function updateMatches(matchesNew: any) {
    const updateMatchesQuery = 'UPDATE competition_match SET outcome = $1 WHERE id = $2'
    for (const match of matchesNew) {
        await pool.query(updateMatchesQuery, [match.outcome, match.id])
    }
}