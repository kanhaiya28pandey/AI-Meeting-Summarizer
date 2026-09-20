import { useState, useMemo, type FC, type ReactNode } from 'react';
import { Sparkles, Copy, Check, Lightbulb, Compass, Layers } from 'lucide-react';
import { Card } from '../ui/Card';

import { Button } from '../ui/Button';
import { useToast } from '../ui';

interface MeetingSummaryProps {
  summary: string | null | undefined;
}

interface ParsedSection {
  title: string;
  items: Array<{ type: 'paragraph' | 'bullet'; text: string }>;
}

function getSectionIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('topic') || lower.includes('discussion') || lower.includes('breakdown')) {
    return <Layers size={16} color="#4f46e5" />;
  }
  if (lower.includes('insight') || lower.includes('observation') || lower.includes('technical')) {
    return <Lightbulb size={16} color="#d97706" />;
  }
  if (lower.includes('next') || lower.includes('step') || lower.includes('recommendation') || lower.includes('action')) {
    return <Compass size={16} color="#059669" />;
  }
  return <Sparkles size={16} color="var(--primary)" />;
}

function renderFormattedText(text: string): ReactNode {
  // Simple inline markdown parser for **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function parseSummarySections(summary: string): ParsedSection[] {
  if (!summary || !summary.trim()) return [];

  // Check if summary contains markdown headings "### "
  if (!summary.includes('###')) {
    const paragraphs = summary.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    return [{
      title: 'Executive Summary',
      items: paragraphs.map(p => ({
        type: p.startsWith('- ') || p.startsWith('* ') ? 'bullet' : 'paragraph',
        text: p.replace(/^[-*]\s+/, ''),
      })),
    }];
  }

  const sections: ParsedSection[] = [];
  const rawSections = summary.split(/(?=###\s+)/);

  for (const rawSec of rawSections) {
    const trimmed = rawSec.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    let title = 'Summary';
    let contentStartIndex = 0;

    if (lines[0].startsWith('###')) {
      title = lines[0].replace(/^###\s+/, '').trim();
      contentStartIndex = 1;
    }

    const items: Array<{ type: 'paragraph' | 'bullet'; text: string }> = [];
    for (let i = contentStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('- ') || line.startsWith('* ')) {
        items.push({ type: 'bullet', text: line.replace(/^[-*]\s+/, '') });
      } else {
        items.push({ type: 'paragraph', text: line });
      }
    }

    if (items.length > 0) {
      sections.push({ title, items });
    }
  }

  return sections;
}

export const MeetingSummary: FC<MeetingSummaryProps> = ({ summary }) => {
  const [copied, setCopied] = useState(false);
  const { success: toastSuccess } = useToast();

  const sections = useMemo(() => parseSummarySections(summary || ''), [summary]);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toastSuccess('Summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const hasSummary = summary && summary.trim().length > 0;

  return (
    <Card
      padding="lg"
      style={{
        marginBottom: '1.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={17} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Comprehensive Meeting Intelligence
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              AI-generated synthesis, structured breakdown & takeaways
            </span>
          </div>
        </div>

        {hasSummary && (
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
            onClick={handleCopy}
            title="Copy summary to clipboard"
            aria-label="Copy summary to clipboard"
          >
            {copied ? 'Copied' : 'Copy Summary'}
          </Button>
        )}
      </div>

      {/* Structured Content */}
      {hasSummary ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sections.map((section, sIdx) => {
            const icon = getSectionIcon(section.title);
            return (
              <div
                key={sIdx}
                style={{
                  padding: '1.1rem 1.25rem',
                  backgroundColor: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Section Title */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {icon}
                  <span>{section.title}</span>
                </div>

                {/* Section Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {section.items.map((item, iIdx) => {
                    if (item.type === 'bullet') {
                      return (
                        <div
                          key={iIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            fontSize: '0.92rem',
                            lineHeight: 1.6,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--primary)',
                              fontWeight: 700,
                              lineHeight: 1.4,
                              flexShrink: 0,
                            }}
                          >
                            •
                          </span>
                          <span style={{ flex: 1 }}>{renderFormattedText(item.text)}</span>
                        </div>
                      );
                    }
                    return (
                      <p
                        key={iIdx}
                        style={{
                          margin: 0,
                          fontSize: '0.92rem',
                          lineHeight: 1.65,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {renderFormattedText(item.text)}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
          }}
        >
          No summary available for this meeting.
        </div>
      )}
    </Card>
  );
};
