/**
 * Bring quiz results graded on the server back to this device.
 *
 * A placement check or final quiz taken offline is queued and graded when it
 * syncs. `GET /progress` then reports each quiz's best percentage
 * (`assessments`), and this module saves it where the app looks for it:
 *
 *   - finals (`module-N`)  -> the module quiz results that unlock the next stop;
 *   - placement checks     -> the startup assessment that personalises lessons
 *     (only when this device has none, or only the provisional one saved
 *     while offline: a result graded on this device is more detailed).
 */
import { getCountryForModule, getCountryTopics } from '@/data/lessons/catalog';
import { REMEDIATION_THRESHOLD } from '@/services/recommendations';
import { starsForScore } from '@/services/scoring';
import { saveModuleQuizResult } from '@/store/lesson-progress';
import { getStartupAssessment, saveStartupAssessment } from '@/store/profile-cache';

const PLACEMENT_PREFIX = 'placement-';

export async function applyServerAssessments(assessments) {
  if (!assessments || typeof assessments !== 'object') return;

  for (const [key, value] of Object.entries(assessments)) {
    const percentage = Math.round(Number(value));
    if (!Number.isFinite(percentage)) continue;

    try {
      if (key.startsWith(PLACEMENT_PREFIX)) {
        const moduleKey = key.slice(PLACEMENT_PREFIX.length);
        const existing = await getStartupAssessment(moduleKey);
        if (existing && !existing.pending) continue;

        const topics = getCountryTopics(getCountryForModule(moduleKey), moduleKey) ?? [];
        const topicMastery = {};
        for (const topic of topics) {
          topicMastery[topic.id] = {
            score: percentage,
            weakness: percentage < REMEDIATION_THRESHOLD,
            stars: starsForScore(percentage),
          };
        }
        await saveStartupAssessment({
          moduleKey,
          takenAt: existing?.takenAt ?? new Date().toISOString(),
          percentage,
          topicMastery,
        });
      } else if (key.startsWith('module-')) {
        // The store keeps the best result, so replaying this is harmless.
        await saveModuleQuizResult(key, percentage);
      }
    } catch (error) {
      console.log(`[AssessmentSync] Could not apply ${key}:`, error);
    }
  }
}
