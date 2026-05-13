import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnimatedValue = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const nodeRef = useRef();
  const rafRef = useRef();
  const startRef = useRef(null);
  const duration = 1400;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = eased * value;

      node.textContent = `${prefix}${current.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    startRef.current = null;
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, prefix, suffix, decimals]);

  return (
    <span
      ref={nodeRef}
      className="tabular-nums"
    />
  );
};

const KPICard = ({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendValue,
  icon: Icon,
  decimals = 0,
}) => {
  const isPositive = trend === 'up';
  const hasTrend = trend !== undefined && trendValue !== undefined;

  return (
    <div className="kpi-card group relative overflow-hidden rounded-2xl bg-fintech-slate-900 border border-fintech-slate-800 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl hover:shadow-brand-primary/10 cursor-default">
      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 70%)' }}
      />

      {/* Top row: icon + trend badge */}
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl bg-fintech-slate-800 text-brand-primary ring-1 ring-fintech-slate-700 group-hover:ring-brand-primary/30 transition-all duration-300">
          {Icon && <Icon size={20} />}
        </div>

        {hasTrend && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20'
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{isPositive ? '+' : '-'}{Math.abs(trendValue)}%</span>
          </div>
        )}
      </div>

      {/* Bottom row: label + value */}
      <div className="flex flex-col gap-1">
        <p className="text-fintech-slate-500 text-xs font-medium uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-white tracking-tight leading-none">
          <AnimatedValue
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
          />
        </h3>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default KPICard;