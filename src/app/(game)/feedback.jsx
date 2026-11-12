import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameHeader, PrimaryButton } from '@/components/game-ui';
import { useAuth } from '@/store/auth-context';

const SUS_VERSION = 'v1.0';
const SUS_ITEMS = [
  { id: 1, statement: "I think that I would like to use GamiFrench frequently.", positive: true },
  { id: 2, statement: 'I found GamiFrench unnecessarily complex.', positive: false },
  { id: 3, statement: 'I thought GamiFrench was easy to use.', positive: true },
  { id: 4, statement: 'I think that I would need the support of a technical person to be able to use GamiFrench.', positive: false },
  { id: 5, statement: 'I found the various functions in GamiFrench were well integrated.', positive: true },
  { id: 6, statement: 'I thought there was too much inconsistency in GamiFrench.', positive: false },
  { id: 7, statement: 'I would imagine that most people would learn to use GamiFrench very quickly.', positive: true },
  { id: 8, statement: 'I found GamiFrench very cumbersome to use.', positive: false },
  { id: 9, statement: 'I felt very confident using GamiFrench.', positive: true },
  { id: 10, statement: 'I needed to learn a lot of things before I could get going with GamiFrench.', positive: false },
];

/* Optional open-ended answers, saved with the survey as `responses.comments`. */
const COMMENT_MAX_LENGTH = 1000;
const COMMENT_FIELDS = [
  {
    key: 'thoughts',
    icon: '💭',
    label: 'Your thoughts',
    placeholder: 'What do you think of GamiFrench so far?',
  },
  {
    key: 'suggestions',
    icon: '🛠️',
    label: 'Suggestions',
    placeholder: 'What could we improve or fix?',
  },
  {
    key: 'recommendations',
    icon: '💡',
    label: 'Recommendations',
    placeholder: 'What would you like us to add next?',
  },
];
const EMPTY_COMMENTS = { thoughts: '', suggestions: '', recommendations: '' };

export default function Feedback() {
  const { session, authenticatedRequest } = useAuth();
  const [selections, setSelections] = useState(new Array(SUS_ITEMS.length).fill(null));
  const [comments, setComments] = useState(EMPTY_COMMENTS);
  // Read by the focus effect without being one of its dependencies (see below).
  const submittedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState('');

  const allAnswered = selections.every((choice) => choice !== null);

  const onSelect = useCallback((itemIndex, choice) => {
    setError('');
    // Updater form: quick taps on several questions never overwrite each other.
    setSelections((current) => {
      const next = [...current];
      next[itemIndex] = choice;
      return next;
    });
  }, []);

  const onCommentChange = useCallback((key, text) => {
    setComments((current) => ({ ...current, [key]: text }));
  }, []);

  const resetForm = useCallback(() => {
    submittedRef.current = false;
    setSubmitted(false);
    setScore(null);
    setSelections(new Array(SUS_ITEMS.length).fill(null));
    setComments(EMPTY_COMMENTS);
  }, []);

  const submit = useCallback(async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    setError('');
    try {
      const json = await authenticatedRequest('/surveys', {
        method: 'POST',
        body: JSON.stringify({
          surveyType: 'sus',
          version: SUS_VERSION,
          responses: {
            items: selections,
            // Only the boxes the learner actually filled in are sent.
            comments: Object.fromEntries(
              Object.entries(comments)
                .map(([key, text]) => [key, text.trim()])
                .filter(([, text]) => text.length > 0),
            ),
          },
        }),
      });
      setScore(json.susScore ?? null);
      submittedRef.current = true;
      setSubmitted(true);
    } catch (err) {
      console.log('[Feedback] submission failed', err);
      setError(
        err?.message ?? 'Could not send your feedback. Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [authenticatedRequest, selections, comments, allAnswered]);

  useFocusEffect(
    useCallback(() => {
      // Coming back to a finished survey starts a fresh one. This must run
      // only on focus: depending on `submitted` re-ran it the moment the
      // survey was sent and hid the thank-you screen straight away.
      if (submittedRef.current) resetForm();
    }, [resetForm]),
  );

  const userName = session?.user?.displayName ?? 'there';

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GameHeader eyebrow="Feedback" title="Thank you!" back />
          <View style={styles.card}>
            <Text style={styles.bigScore}>{score == null ? '—' : score.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}>Your System Usability Scale (SUS) score</Text>
            <Text style={styles.scoreNote}>50 is the midpoint. Above 68 is considered above average.</Text>
            <Text style={styles.thankYou}>Thanks for helping us improve GamiFrench, {userName}.</Text>
          </View>
          <PrimaryButton onPress={resetForm}>Take the survey again</PrimaryButton>
          <TouchableOpacity accessibilityRole="button" activeOpacity={0.8} onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>‹ Back to profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Keeps the comment box being typed in above the keyboard. */}
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GameHeader eyebrow="Feedback" title="Share your feedback" back />
        <View style={styles.intro}>
          <Text style={styles.introTitle}>System Usability Scale</Text>
          <Text style={styles.introText}>Please rate how much you agree or disagree with each statement about GamiFrench. There are no right or wrong answers.</Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {SUS_ITEMS.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemNumber}>{index + 1}</Text>
              <Text style={styles.itemStatement}>{item.statement}</Text>
            </View>
            <View style={styles.scaleRow}>
              {[1, 2, 3, 4, 5].map((choice) => (
                <TouchableOpacity key={choice} accessibilityRole="radio" accessibilityChecked={selections[index] === choice} activeOpacity={0.8} onPress={() => onSelect(index, choice)} disabled={submitting} style={[styles.scaleButton, selections[index] === choice && styles.scaleButtonSelected]}>
                  <Text style={styles.scaleDot}>●</Text>
                  <Text style={styles.scaleLabel}>{choice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.commentsIntro}>
          <Text style={styles.introTitle}>Tell us more</Text>
          <Text style={styles.introText}>Optional — share anything in your own words. Every comment is read by the GamiFrench team.</Text>
        </View>

        {COMMENT_FIELDS.map((field) => {
          const value = comments[field.key];
          return (
            <View key={field.key} style={styles.commentCard}>
              <Text style={styles.commentLabel}>{field.icon} {field.label}</Text>
              <TextInput
                value={value}
                onChangeText={(text) => onCommentChange(field.key, text)}
                placeholder={field.placeholder}
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                maxLength={COMMENT_MAX_LENGTH}
                editable={!submitting}
                style={styles.commentInput}
                accessibilityLabel={field.label}
                accessibilityHint={field.placeholder}
              />
              <Text style={styles.commentCount}>{value.length}/{COMMENT_MAX_LENGTH}</Text>
            </View>
          );
        })}

        <View style={styles.actions}>
          <PrimaryButton disabled={!allAnswered || submitting} onPress={submit}>{submitting ? 'Sending…' : 'Submit feedback'}</PrimaryButton>
          {!allAnswered && <Text style={styles.hint}>Please answer all {SUS_ITEMS.length} questions before submitting.</Text>}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
  },
  bigScore: {
    fontSize: 56,
    fontWeight: '800',
    color: '#1577D4',
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#182133',
    textAlign: 'center',
  },
  scoreNote: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  thankYou: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#182133',
    textAlign: 'center',
    lineHeight: 22,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 6,
    paddingRight: 10,
  },
  backLinkText: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
  intro: {
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#182133',
  },
  introText: {
    marginTop: 6,
    fontSize: 14,
    color: '#58616E',
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#FEECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    color: '#B42318',
    lineHeight: 19,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1577D4',
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 14,
    marginRight: 10,
  },
  itemStatement: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonSelected: {
    borderColor: '#1577D4',
    backgroundColor: '#E8F2FB',
  },
  scaleDot: {
    fontSize: 20,
    color: '#94A3B8',
  },
  commentsIntro: {
    marginTop: 10,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#182133',
    marginBottom: 8,
  },
  commentInput: {
    minHeight: 96,
    maxHeight: 200,
    borderWidth: 1.5,
    borderColor: '#D8DEE9',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 21,
    color: '#182133',
  },
  commentCount: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontSize: 12,
    color: '#94A3B8',
  },
  actions: {
    marginTop: 6,
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
