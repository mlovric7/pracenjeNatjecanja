import { Competitor } from '../routes/users'

export function generateMatches(competitors: Competitor[], competitionId: number): number[][] {
    let matches: (number)[][] = [];

    const numParticipants = competitors.length;
    const rounds = numParticipants - 1;

    // Round-robin alg
    for (let round = 1; round <= rounds; round++){
        for (let i = 0; i < numParticipants / 2; i++) {
            const participant1 = competitors[i];
            const participant2 = competitors[numParticipants - 1 - i];
            matches.push([competitionId, participant1.id!, participant2.id!, round]);
        }

        // Rotate the participants to create the next round
        competitors.splice(1, 0, competitors.pop()!);
    }

    return matches
}