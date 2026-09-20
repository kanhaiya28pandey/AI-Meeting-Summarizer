import { useState, useMemo, type FC } from 'react';
import { FileText, Copy, Check, MessageSquare, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../ui';

interface TranscriptProps {
  transcript: string | null | undefined;
}

interface DialogueTurn {
  id: number;
  speaker: string;
  text: string;
}

const SPEAKER_PALETTES = [
  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', badgeBg: '#dbeafe' }, // Indigo/Blue
  { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', badgeBg: '#d1fae5' }, // Emerald/Green
  { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', badgeBg: '#ede9fe' }, // Purple
  { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', badgeBg: '#ffedd5' }, // Amber/Orange
  { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8', badgeBg: '#fce7f3' }, // Rose/Pink
  { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4', badgeBg: '#ccfbf1' }, // Teal
];

function getSpeakerStyle(speaker: string) {
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) {
    hash = (hash * 31 + speaker.charCodeAt(i)) >>> 0;
  }
  return SPEAKER_PALETTES[hash % SPEAKER_PALETTES.length];
}

function getSpeakerInitials(speaker: string): string {
  const numMatch = speaker.match(/\d+/);
  if (numMatch) return `S${numMatch[0]}`;
  const words = speaker.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return speaker.slice(0, 2).toUpperCase();
}

function formatSpeakerLabel(speaker: string): string {
  const match = speaker.match(/^(?:spk|speaker)[\s_:-]*(\d+)$/i);
  if (match) {
    return `Speaker ${parseInt(match[1], 10) + 1}`;
  }
  return speaker;
}

function parseTranscriptTurns(transcript: string): DialogueTurn[] {
  if (!transcript || !transcript.trim()) return [];

  // Split on double newlines or single newline before "Speaker X:" or "[Name]:"
  const rawBlocks = transcript.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const turns: DialogueTurn[] = [];

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    const match = block.match(/^([^:\n]{1,35}):\s*([\s\S]+)$/);
    if (match) {
      turns.push({
        id: i,
        speaker: formatSpeakerLabel(match[1].trim()),
        text: match[2].trim(),
      });
    } else {
      const prevSpeaker = turns.length > 0 ? turns[turns.length - 1].speaker : 'Speaker 1';
      turns.push({
        id: i,
        speaker: formatSpeakerLabel(prevSpeaker),
        text: block,
      });
    }
  }

  return turns;
}


export const Transcript: FC<TranscriptProps> = ({ transcript }) => {
  const [copied, setCopied] = useState(false);
  const [copiedTurnId, setCopiedTurnId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'conversation' | 'raw'>('conversation');
  const { success: toastSuccess } = useToast();

  const turns = useMemo(() => parseTranscriptTurns(transcript || ''), [transcript]);

  const uniqueSpeakers = useMemo(() => {
    const set = new Set<string>();
    turns.forEach(t => set.add(t.speaker));
    return Array.from(set);
  }, [turns]);

  const handleCopyAll = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      toastSuccess('Transcript copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleCopyTurn = async (turn: DialogueTurn) => {
    try {
      await navigator.clipboard.writeText(`${turn.speaker}: ${turn.text}`);
      setCopiedTurnId(turn.id);
      toastSuccess(`Copied ${turn.speaker}'s turn`);
      setTimeout(() => setCopiedTurnId(null), 1800);
    } catch {
      setCopiedTurnId(null);
    }
  };

  const hasTranscript = transcript && transcript.trim().length > 0;

  return (
    <Card
      padding="lg"
      style={{
        marginTop: '1.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f1f5f9',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={17} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Conversation Transcript
            </h2>
            {hasTranscript && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {turns.length} dialogue {turns.length === 1 ? 'turn' : 'turns'}
                </span>
                {uniqueSpeakers.length > 0 && (
                  <>
                    <span style={{ color: 'var(--border)' }}>•</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={12} />
                      {uniqueSpeakers.length} {uniqueSpeakers.length === 1 ? 'person' : 'people'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* View Mode Switcher and Actions */}
        {hasTranscript && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: 'var(--bg-canvas)',
                padding: '2px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('conversation')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'conversation' ? 600 : 500,
                  color: viewMode === 'conversation' ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: viewMode === 'conversation' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'conversation' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Person-by-Person
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  fontWeight: viewMode === 'raw' ? 600 : 500,
                  color: viewMode === 'raw' ? 'var(--primary)' : 'var(--text-secondary)',
                  backgroundColor: viewMode === 'raw' ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'raw' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                Raw Text
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={copied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
              onClick={handleCopyAll}
              title="Copy entire transcript to clipboard"
              aria-label="Copy entire transcript to clipboard"
            >
              {copied ? 'Copied' : 'Copy All'}
            </Button>
          </div>
        )}
      </div>

      {/* Transcript Body */}
      {hasTranscript ? (
        viewMode === 'conversation' && turns.length > 0 ? (
          <div
            style={{
              maxHeight: '560px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              padding: '0.5rem 0.25rem',
            }}
          >
            {turns.map(turn => {
              const style = getSpeakerStyle(turn.speaker);
              const initials = getSpeakerInitials(turn.speaker);
              const isCopied = copiedTurnId === turn.id;

              return (
                <div
                  key={turn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: style.bg,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${style.border}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Speaker Avatar */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: style.badgeBg,
                      color: style.text,
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: `1px solid ${style.border}`,
                    }}
                    title={turn.speaker}
                  >
                    {initials}
                  </div>

                  {/* Speaker Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.35rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: style.text,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {turn.speaker}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopyTurn(turn)}
                        title={`Copy ${turn.speaker}'s message`}
                        aria-label={`Copy ${turn.speaker}'s message`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isCopied ? 'var(--status-success)' : 'var(--text-muted)',
                          padding: '2px 4px',
                          borderRadius: 'var(--radius-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {turn.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              maxHeight: '520px',
              overflowY: 'auto',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {transcript}
          </div>
        )
      ) : (
        <div
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
          }}
        >
          <FileText size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>No transcript is available.</div>
        </div>
      )}
    </Card>
  );
};
