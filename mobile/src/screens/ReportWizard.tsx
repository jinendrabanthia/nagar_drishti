import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Camera, MapPin, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import { theme } from '../theme';

export default function ReportWizard({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [photoTaken, setPhotoTaken] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Report</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
          <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
        </View>
        <Text style={styles.headerSubtitle}>
          {step === 1 ? 'Step 1: Photo Evidence' : step === 2 ? 'Step 2: Location' : 'Step 3: Details'}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <>
            <TouchableOpacity 
              style={[styles.uploadBox, photoTaken && styles.uploadBoxSuccess]}
              onPress={() => setPhotoTaken(true)}
              activeOpacity={0.8}
            >
              {photoTaken ? (
                <>
                  <CheckCircle2 size={48} color={theme.colors.success} />
                  <Text style={[styles.uploadText, { color: theme.colors.success, marginTop: 12 }]}>Photo Attached</Text>
                </>
              ) : (
                <>
                  <Camera size={48} color={theme.colors.primary} opacity={0.6} />
                  <Text style={styles.uploadText}>Tap to Take a Photo</Text>
                  <Text style={styles.uploadSubtext}>or upload from gallery</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.tipsBox}>
              <ImageIcon size={20} color={theme.colors.info} />
              <Text style={styles.tipsText}>Ensure the issue is clearly visible. Our AI will automatically analyze the image for severity and category.</Text>
            </View>
          </>
        )}

        {step === 2 && (
          <View style={styles.mapMock}>
            <MapPin size={40} color={theme.colors.primary} />
            <Text style={styles.mapMockText}>Fetching precise location...</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationTitle}>Current Location</Text>
              <Text style={styles.locationDesc}>AG Square, Bhubaneswar, Odisha</Text>
              <Text style={styles.locationCoords}>20.266° N, 85.836° E</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.aiAnalyzing}>
            <View style={styles.spinnerMock} />
            <Text style={styles.aiAnalyzingTitle}>AI is analyzing your report</Text>
            <Text style={styles.aiAnalyzingDesc}>Categorizing and scoring severity...</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextButton, !photoTaken && step === 1 && styles.nextButtonDisabled, step === 1 && { flex: 1 }]}
          disabled={!photoTaken && step === 1}
          onPress={() => {
            if (step < 3) setStep(step + 1);
            else navigation.navigate('Home');
          }}
        >
          <Text style={styles.nextButtonText}>
            {step === 1 ? 'Next: Location' : step === 2 ? 'Next: Review' : 'Submit Report'}
          </Text>
          {step < 3 && <ChevronRight size={20} color={theme.colors.surface} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.lg + 10 : 10,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  uploadBox: {
    height: 240,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  uploadBoxSuccess: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.success + '05',
    borderStyle: 'solid',
  },
  uploadText: {
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.lg,
    marginTop: 16,
  },
  uploadSubtext: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginTop: 4,
  },
  tipsBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.info + '15',
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'flex-start',
    gap: 12,
  },
  tipsText: {
    flex: 1,
    color: theme.colors.info,
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    fontWeight: '500',
  },
  mapMock: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapMockText: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 12,
  },
  locationCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    ...theme.shadows.md,
  },
  locationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  locationDesc: {
    fontSize: theme.typography.sizes.base,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  aiAnalyzing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerMock: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: theme.colors.primary + '30',
    borderTopColor: theme.colors.primary,
    marginBottom: 24,
  },
  aiAnalyzingTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  aiAnalyzingDesc: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 16,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.base,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  nextButtonText: {
    color: theme.colors.surface,
    fontWeight: '700',
    fontSize: theme.typography.sizes.base,
  }
});
