import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isProcessingStatus,
  PROCESSING_POLL_INTERVAL,
  PROCESSING_STAGES,
  STAGE_ORDER,
} from '../utils/processingStages.ts';
import type { MeetingStatus } from '../types/meeting.ts';

describe('useMeetingProcessing helpers', () => {
  it('identifies in-progress statuses correctly', () => {
    const inProgress: MeetingStatus[] = ['UPLOADED', 'TRANSCRIBING', 'ANALYZING', 'SAVING'];
    for (const s of inProgress) {
      assert.equal(isProcessingStatus(s), true, `Expected ${s} to be in-progress`);
    }
  });

  it('identifies terminal and undefined statuses as non-processing', () => {
    assert.equal(isProcessingStatus('COMPLETED'), false);
    assert.equal(isProcessingStatus('FAILED'), false);
    assert.equal(isProcessingStatus(undefined), false);
    assert.equal(isProcessingStatus(null), false);
  });

  it('has a default poll interval between 1500ms and 3000ms', () => {
    assert.ok(PROCESSING_POLL_INTERVAL >= 1500 && PROCESSING_POLL_INTERVAL <= 3000);
  });
});

describe('ProcessingStatus stages definition', () => {
  it('defines the 5 core stages in correct architectural order', () => {
    const expectedOrder: MeetingStatus[] = [
      'UPLOADED',
      'TRANSCRIBING',
      'ANALYZING',
      'SAVING',
      'COMPLETED',
    ];

    assert.equal(PROCESSING_STAGES.length, 5);
    assert.deepEqual(STAGE_ORDER, expectedOrder);

    PROCESSING_STAGES.forEach((stage, i) => {
      assert.equal(stage.status, expectedOrder[i]);
      assert.ok(stage.label.length > 0);
      assert.ok(stage.description.length > 0);
    });
  });
});
