import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import './ProfileCard.css';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180
};

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const ProfileCardComponent = ({
  avatarUrl = '',
  iconUrl = '',
  grainUrl = '',
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Player',
  title = 'Role',
  handle = 'player',
  status = 'Online',
  showUserInfo = true,
  socials = [],
  discordStatus,
  discordActivity,
}) => {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const enterTimerRef = useRef(null);
  const leaveRafRef = useRef(null);

  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;
    let rafId = null, running = false, lastTs = 0;
    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    const DEFAULT_TAU = 0.14, INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x, y) => {
      const shell = shellRef.current, wrap = wrapRef.current;
      if (!shell || !wrap) return;
      const width = shell.clientWidth || 1, height = shell.clientHeight || 1;
      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50, centerY = percentY - 50;
      const props = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`,
      };
      for (const [k, v] of Object.entries(props)) wrap.style.setProperty(k, v);
    };

    const step = ts => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05 || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false; lastTs = 0;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    };

    const start = () => { if (running) return; running = true; lastTs = 0; rafId = requestAnimationFrame(step); };

    return {
      setImmediate(x, y) { currentX = x; currentY = y; setVarsFromXY(x, y); },
      setTarget(x, y) { targetX = x; targetY = y; start(); },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs) { initialUntil = performance.now() + durationMs; start(); },
      getCurrent() { return { x: currentX, y: currentY, tx: targetX, ty: targetY }; },
      cancel() { if (rafId) cancelAnimationFrame(rafId); rafId = null; running = false; lastTs = 0; },
    };
  }, [enableTilt]);

  const getOffsets = (evt, el) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(event => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    const { x, y } = getOffsets(event, shell);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine]);

  const handlePointerEnter = useCallback(event => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    shell.classList.add('active', 'entering');
    if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    enterTimerRef.current = setTimeout(() => shell.classList.remove('entering'), ANIMATION_CONFIG.ENTER_TRANSITION_MS);
    const { x, y } = getOffsets(event, shell);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine]);

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;
    tiltEngine.toCenter();
    const checkSettle = () => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      if (Math.hypot(tx - x, ty - y) < 0.6) {
        shell.classList.remove('active');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return;
    const shell = shellRef.current;
    if (!shell) return;
    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);
    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);
    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }, [enableTilt, tiltEngine, handlePointerMove, handlePointerEnter, handlePointerLeave]);

  const cardStyle = useMemo(() => ({
    '--icon': iconUrl ? `url(${iconUrl})` : 'none',
    '--grain': grainUrl ? `url(${grainUrl})` : 'none',
    '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
    '--behind-glow-color': behindGlowColor ?? 'rgba(125,190,255,0.67)',
    '--behind-glow-size': behindGlowSize ?? '50%',
  }), [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()} style={cardStyle}>
      {behindGlowEnabled && <div className="pc-behind" />}
      <div ref={shellRef} className="pc-card-shell">
        <section className="pc-card">
          <div className="pc-inside">
            <div className="pc-shine" />
            <div className="pc-glare" />

            {/* Top: avatar area with gradient + icon pattern */}
            <div className="pc-content pc-avatar-content">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="pc-avatar-circle">
                  {avatarUrl ? (
                    <img
                      className="avatar"
                      src={avatarUrl}
                      alt={`${name} avatar`}
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="pc-avatar-initial">{name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                {discordStatus && (
                  <div className={`roster-discord-status status-${discordStatus}`}>
                    {discordStatus === 'dnd' && <div className="discord-status-dnd-icon"></div>}
                    {discordStatus === 'idle' && <div className="discord-status-idle-icon"></div>}
                  </div>
                )}
              </div>

              {showUserInfo && (
                <div className="pc-user-info">
                  <div className="pc-user-details">
                    <div className="pc-mini-avatar">
                      {avatarUrl
                        ? <img src={miniAvatarUrl || avatarUrl} alt="mini" loading="lazy" />
                        : <span className="pc-mini-initial">{name.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="pc-user-text">
                      <div className="pc-handle">@{handle}</div>
                      <div className="pc-status">{status}</div>
                    </div>
                  </div>

                  {/* Social icon links */}
                  {socials.length > 0 && (
                    <div className="pc-socials">
                      {socials.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pc-social-icon-btn"
                          title={s.type}
                          onClick={e => e.stopPropagation()}
                        >
                          {s.Icon && <s.Icon />}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom: name + title */}
            <div className="pc-content">
              <div className="pc-details">
                <h3>{name}</h3>
                <p>{title}</p>
              </div>
            </div>
            
            {discordActivity && (
              <div className="roster-activity-tooltip">{discordActivity}</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
