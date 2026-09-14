import { useEffect, useState } from 'react';
import { getCodeColor } from '../games/BreachProtocol/breachLogic';
import type { SequenceStatus } from '../games/BreachProtocol/types';

interface Props {
  codes: string[];
  status: SequenceStatus;
  seqIndex: number;
}

function useMobileLayout() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 480px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 480px)');
    const update = (event: MediaQueryListEvent) => setMobile(event.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return mobile;
}

export function BreachSequenceFlow({ codes, status, seqIndex }: Props) {
  const mobile = useMobileLayout();
  const stepPx = mobile ? 54 : 76;
  const scannerPx = mobile ? 38 : 52;
  const slideOffset = status.progress * stepPx;

  return (
    <div
      className={`breach-flow ${status.completed ? 'breach-flow--done' : ''}`}
      style={{ '--flow-delay': `${seqIndex * 0.15}s` } as React.CSSProperties}
    >
      <div className="breach-flow-viewport">
        <div className="breach-flow-scanner" aria-hidden="true">
          <span className="breach-flow-scanner-label">BUF</span>
        </div>

        <div
          className="breach-flow-cover"
          style={{ width: `${Math.min(100, (status.progress / status.total) * 100)}%` }}
          aria-hidden="true"
        />

        <div
          className="breach-flow-track breach-flow-track--sliding"
          style={{ transform: `translateX(calc(${scannerPx}px - ${slideOffset}px))` }}
        >
          {codes.map((code, i) => {
            const matched = i < status.progress;
            const isNext = i === status.progress && !status.completed;
            const isLast = i === codes.length - 1;

            return (
              <div key={i} className="breach-flow-step">
                <div
                  className={[
                    'breach-flow-node',
                    matched ? 'breach-flow-node--matched' : '',
                    isNext ? 'breach-flow-node--next' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    {
                      '--node-color': getCodeColor(code),
                      '--step-delay': `${i * 0.12}s`,
                    } as React.CSSProperties
                  }
                >
                  <span className="breach-flow-code">{code}</span>
                  {matched && <span className="breach-flow-check">✓</span>}
                </div>
                {!isLast && (
                  <div
                    className={`breach-flow-connector ${matched ? 'breach-flow-connector--active' : ''}`}
                  >
                    <span className="breach-flow-connector-line" />
                    <span className="breach-flow-connector-arrow">▸</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="breach-flow-segments" aria-hidden="true">
        {codes.map((_, i) => (
          <div
            key={i}
            className={`breach-flow-segment ${i < status.progress ? 'breach-flow-segment--filled' : ''}`}
          />
        ))}
      </div>

      <div className="breach-flow-status">
        {status.completed ? (
          <span className="breach-flow-done">
            ✓ Secuencia activa desde buffer[{status.matchedAt}]
          </span>
        ) : (
          <div className="breach-flow-progress-bar">
            <div
              className="breach-flow-progress-fill"
              style={{ width: `${(status.progress / status.total) * 100}%` }}
            />
            <span>
              {status.progress}/{status.total}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
