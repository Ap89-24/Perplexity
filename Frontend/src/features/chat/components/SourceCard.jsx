import React from 'react';

const SourceCard = ({ source }) => {
  const isWeb = source.sourceType === 'web';

  // Get domain name for web sources
  let domain = 'Document';
  if (isWeb && source.url) {
    try {
      domain = new URL(source.url).hostname.replace('www.', '');
    } catch {
      domain = 'Web';
    }
  }

  return (
    <a
      href={source.url || '#'}
      target={source.url ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs transition-all duration-200 hover:border-emerald-500/50 hover:bg-white/10 hover:shadow-lg hover:shadow-emerald-500/5 min-w-[180px] max-w-[240px] flex-shrink-0"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            {isWeb ? (
              <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                🌐
              </span>
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-500/20 text-[10px] text-blue-400 font-medium">
                📄
              </span>
            )}
            <span className="truncate text-[11px] font-medium text-gray-400 group-hover:text-gray-200">
              {domain}
            </span>
          </div>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
            {source.id}
          </span>
        </div>

        <h4 className="line-clamp-2 text-xs font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors leading-snug">
          {source.title}
        </h4>

        {source.snippet && (
          <p className="mt-1.5 line-clamp-2 text-[11px] text-gray-400 leading-relaxed opacity-80">
            {source.snippet}
          </p>
        )}
      </div>

      {source.url && (
        <div className="mt-2 flex items-center text-[10px] font-medium text-emerald-400/80 group-hover:text-emerald-400">
          <span>Visit source</span>
          <svg className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </a>
  );
};

export default SourceCard;
