import { FootprintProfile } from "./firebase";
import { ACTION_CATALOG, CandidateAction } from "./actionCatalog";

export interface RankedInsight extends CandidateAction {
  score: number;
}

/**
 * Generates and ranks suggested carbon reduction habits for a user profile.
 * Formula: score = estAnnualSavingsKg / effortWeight (higher savings per effort = higher rank)
 */
export function generateInsights(profile: FootprintProfile): RankedInsight[] {
  if (!profile) return [];

  // Filter actions based on conditions
  const eligibleActions = ACTION_CATALOG.filter(action => {
    try {
      return action.condition(profile);
    } catch (e) {
      console.error(`Error filtering action ${action.id}:`, e);
      return false;
    }
  });

  // Calculate scores and map
  const scoredActions: RankedInsight[] = eligibleActions.map(action => {
    const score = Number((action.estAnnualSavingsKg / action.effortWeight).toFixed(2));
    return {
      ...action,
      score
    };
  });

  // Sort descending by score, return top 5
  return scoredActions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
