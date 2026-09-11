import type { FC } from 'react';
import type { Meeting } from '../../types/meeting';
import { MeetingSummary } from './MeetingSummary';
import { KeyDecisions } from './KeyDecisions';
import { ActionItems } from './ActionItems';
import { Transcript } from './Transcript';

interface MeetingResultsProps {
  meeting: Meeting;
}

export const MeetingResults: FC<MeetingResultsProps> = ({ meeting }) => {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 1. Executive Summary */}
      <MeetingSummary summary={meeting.summary} />

      {/* 2. Key Decisions & Action Items Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',
        }}
      >
        <KeyDecisions decisions={meeting.keyDecisions} />
        <ActionItems actionItems={meeting.actionItems} />
      </div>

      {/* 3. Full Transcript */}
      <Transcript transcript={meeting.transcript} />
    </div>
  );
};
