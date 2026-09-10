import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Fontes do vídeo do cliente (Google Drive)                           */
/* ------------------------------------------------------------------ */
const DRIVE_DIRECT =
  "https://drive.usercontent.google.com/download?id=1qcR0RD5SAtPywZr62rBCifZ56cLmlalP&export=download&confirm=t";
const DRIVE_ALT = "https://drive.google.com/uc?export=download&id=1qcR0RD5SAtPywZr62rBCifZ56cLmlalP";

/* ------------------------------------------------------------------ */
/* Vídeos de segurança (CDN leve e rápido) — tocam imediatamente       */
/* enquanto o arquivo grande do Drive ainda está em buffer             */
/* ------------------------------------------------------------------ */
const FALLBACK_LIGHT = "https://videos.pexels.com/video-files/3939628/3939628-hd_1920_1080_30fps.mp4";
const FALLBACK_OVEN = "https://videos.pexels.com/video-files/10802555/10802555-hd_3840_2160_24fps.mp4";

/** Opacidade do vídeo (55–70% para ficar bem visível) */
const VIDEO_OPACITY = 0.6;
/** Overlay preto (30–35% para não escurecer demais o vídeo) */
const OVERLAY_COLOR = "rgba(0, 0, 0, 0.35)";

/**
 * Vídeo de fundo fixo — cobre a tela inteira, não rola com a página
 * e fica atrás de todo o conteúdo (z-0), do topo ao rodapé.
 *
 * Estratégia anti-falha em 2 camadas:
 *  1. Vídeo de segurança (Pexels, CDN rápido) toca em ~1s — o fundo
 *     NUNCA fica vazio.
 *  2. O vídeo do cliente (Google Drive, arquivo grande) entra com
 *     fade quando o primeiro frame carrega, assumindo o fundo.
 *     Se falhar nas duas URLs do Drive, o vídeo de segurança permanece.
 */
export default function BackgroundVideo() {
  const driveRef = useRef<HTMLVideoElement>(null);
  const fallbackRef = useRef<HTMLVideoElement>(null);

  const [driveSrc, setDriveSrc] = useState(DRIVE_DIRECT);
  const [driveReady, setDriveReady] = useState(false);
  const [driveDead, setDriveDead] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState(FALLBACK_LIGHT);
  const [fallbackReady, setFallbackReady] = useState(false);

  const driveReadyRef = useRef(false);
  const timerRef = useRef(0);

  useEffect(() => {
    driveReadyRef.current = driveReady;
  }, [driveReady]);

  /** Avança a cadeia do Drive: DIRECT → ALT → desiste (o fallback segue tocando) */
  const advanceDrive = () => {
    if (driveSrc === DRIVE_DIRECT) {
      setDriveSrc(DRIVE_ALT);
    } else {
      setDriveDead(true);
    }
  };

  /* Camada 2 — vídeo do cliente (Drive) */
  useEffect(() => {
    if (driveDead) return;
    const v = driveRef.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p) p.catch(() => {});
    };
    const onCanPlay = () => {
      window.clearTimeout(timerRef.current);
      setDriveReady(true);
      tryPlay();
    };
    v.addEventListener("canplay", onCanPlay);
    if (v.readyState >= 3) onCanPlay();

    // Se a primeira URL do Drive não entregar em 15s, tenta a segunda
    timerRef.current = window.setTimeout(() => {
      if (!driveReadyRef.current && driveSrc === DRIVE_DIRECT) advanceDrive();
    }, 15000);

    return () => {
      window.clearTimeout(timerRef.current);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, [driveSrc, driveDead]);

  /* Camada 1 — vídeo de segurança (CDN): toca imediatamente */
  useEffect(() => {
    const v = fallbackRef.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    const tryPlay = () => {
      const p = v.play();
      if (p) p.catch(() => {});
    };
    const onCanPlay = () => {
      setFallbackReady(true);
      tryPlay();
    };
    v.addEventListener("canplay", onCanPlay);
    if (v.readyState >= 3) onCanPlay();
    tryPlay();

    return () => v.removeEventListener("canplay", onCanPlay);
  }, [fallbackSrc]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-forest-950" aria-hidden="true">
      {/* Camada 1 — vídeo de segurança: visível imediatamente */}
      <video
        ref={fallbackRef}
        key={`f-${fallbackSrc}`}
        src={fallbackSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
        onError={() => setFallbackSrc((p) => (p === FALLBACK_LIGHT ? FALLBACK_OVEN : p))}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: fallbackReady && !driveReady ? VIDEO_OPACITY : 0, transition: "opacity 1200ms ease" }}
      />

      {/* Camada 2 — vídeo do cliente (Drive): assume o fundo quando carregar */}
      {!driveDead && (
        <video
          ref={driveRef}
          key={`d-${driveSrc}`}
          src={driveSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          disablePictureInPicture
          disableRemotePlayback
          onError={advanceDrive}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: driveReady ? VIDEO_OPACITY : 0, transition: "opacity 1200ms ease" }}
        />
      )}

      {/* Overlay escuro semitransparente para manter o texto legível */}
      <div className="absolute inset-0" style={{ backgroundColor: OVERLAY_COLOR }} />
    </div>
  );
}
