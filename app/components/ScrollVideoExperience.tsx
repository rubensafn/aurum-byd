"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowRight, Armchair, Gauge, MonitorSmartphone, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CanvasScrollSequence, { type CanvasScrollSequenceHandle } from "./CanvasScrollSequence";

type Scene = {
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  copy: string;
  side: "left" | "right";
  kind?: "compact" | "annotation";
};

const scenes: Scene[] = [
  {
    start: 0,
    end: 0.12,
    eyebrow: "02 / Filme interativo",
    title: "Uma presença muda o enquadramento.",
    copy: "O scroll conduz a entrada da BYD em uma arquitetura de luz.",
    side: "right",
  },
  {
    start: 0.12,
    end: 0.34,
    eyebrow: "Exterior",
    title: "Forma, luz e proporção.",
    copy: "Cada ângulo revela o produto sem interromper a cena.",
    side: "left",
  },
  {
    start: 0.34,
    end: 0.48,
    eyebrow: "Duas leituras",
    title: "Design que evolui em movimento.",
    copy: "Diferentes expressões de uma mesma ambição tecnológica.",
    side: "right",
  },
  {
    start: 0.48,
    end: 0.55,
    eyebrow: "Acesso inteligente",
    title: "A cabine se abre.",
    copy: "Continue o movimento. A experiência muda de fora para dentro.",
    side: "left",
    kind: "compact",
  },
  {
    start: 0.55,
    end: 0.68,
    eyebrow: "Interior interativo",
    title: "",
    copy: "Selecione um ponto para aprofundar a experiência.",
    side: "right",
    kind: "annotation",
  },
  {
    start: 0.68,
    end: 0.88,
    eyebrow: "Detalhes",
    title: "Superfície. Assinatura. Proporção.",
    copy: "O desenho se aproxima para transformar produto em presença.",
    side: "left",
    kind: "compact",
  },
  {
    start: 0.88,
    end: 1.01,
    eyebrow: "Visão de parceria",
    title: "Produto vira experiência.",
    copy: "Mobilidade e cultura reunidas em uma plataforma de relacionamento.",
    side: "right",
  },
];

const hotspots = [
  {
    id: "interface",
    label: "Interface central",
    x: "55%",
    y: "28%",
    icon: MonitorSmartphone,
    title: "Tecnologia no campo de visão.",
    copy: "A interface central organiza informação e acesso sem quebrar a continuidade da cabine.",
  },
  {
    id: "console",
    label: "Ambiente da cabine",
    x: "58%",
    y: "53%",
    icon: Gauge,
    title: "Controle que permanece intuitivo.",
    copy: "Comandos e superfícies se encontram em uma leitura limpa, direta e integrada.",
  },
  {
    id: "comfort",
    label: "Conforto a bordo",
    x: "69%",
    y: "71%",
    icon: Armchair,
    title: "O interior como espaço de permanência.",
    copy: "Proporção, apoio e amplitude constroem uma experiência que vai além do deslocamento.",
  },
] as const;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const easeInOut = (value: number) => value * value * (3 - 2 * value);

export default function ScrollVideoExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const contourARef = useRef<HTMLSpanElement>(null);
  const contourBRef = useRef<HTMLSpanElement>(null);
  const sequenceRef = useRef<CanvasScrollSequenceHandle>(null);
  const sceneRef = useRef(0);
  const [activeScene, setActiveScene] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<"loading" | "ready" | "error">("loading");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      sequenceRef.current?.seek(0);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.65,
      onToggle: ({ isActive }) => {
        section.classList.toggle("is-active", isActive);
        document.body.classList.toggle("video-active", isActive);
      },
      onUpdate: ({ progress }) => {
        const inVideo = progress > 0 && progress < 1;
        const desktop = innerWidth > 900;
        const expansion = desktop ? easeInOut(clamp01(progress / 0.16)) : 1;
        const filmProgress = clamp01((progress - 0.06) / 0.88);
        const stageScale = desktop ? gsap.utils.interpolate(0.62, 1, expansion) : 1;

        gsap.set(stage, {
          scale: stageScale,
          x: desktop ? gsap.utils.interpolate(innerWidth * 0.17, 0, expansion) : 0,
          y: desktop ? gsap.utils.interpolate(innerHeight * 0.055, 0, expansion) : 0,
          borderRadius: desktop ? gsap.utils.interpolate(28, 0, expansion) : 0,
        });

        if (introRef.current) {
          const introOpacity = desktop ? 1 - easeInOut(clamp01((progress - 0.035) / 0.105)) : 0;
          gsap.set(introRef.current, { autoAlpha: introOpacity, x: -32 * (1 - introOpacity) });
        }
        if (storyRef.current) {
          const storyIn = easeInOut(clamp01((progress - (desktop ? 0.12 : 0.02)) / 0.045));
          const storyOut = 1 - easeInOut(clamp01((progress - 0.965) / 0.03));
          gsap.set(storyRef.current, { autoAlpha: Math.min(storyIn, storyOut) });
        }
        if (hudRef.current) {
          gsap.set(hudRef.current, { autoAlpha: easeInOut(clamp01((progress - 0.105) / 0.05)) });
        }
        if (contourARef.current) {
          gsap.set(contourARef.current, { xPercent: -22 + filmProgress * 38 });
        }
        if (contourBRef.current) {
          gsap.set(contourBRef.current, { xPercent: 20 - filmProgress * 42 });
        }

        sequenceRef.current?.seek(filmProgress);
        const nextScene = scenes.findIndex(({ start, end }) => filmProgress >= start && filmProgress < end);
        const safeScene = nextScene === -1 ? scenes.length - 1 : nextScene;
        if (safeScene !== sceneRef.current) {
          sceneRef.current = safeScene;
          setActiveScene(safeScene);
          setSelectedHotspot(null);
        }

        section.classList.toggle("is-active", inVideo);
        document.body.classList.toggle("video-active", inVideo);
        section.style.setProperty("--video-progress", `${progress * 100}%`);
        section.style.setProperty("--film-progress", `${filmProgress * 100}%`);
      },
    });

    return () => {
      trigger.kill();
      section.classList.remove("is-active");
      document.body.classList.remove("video-active");
    };
  }, []);

  const scene = scenes[activeScene];
  const selected = hotspots.find((hotspot) => hotspot.id === selectedHotspot);
  const SelectedIcon = selected?.icon;
  const showHotspots = activeScene === 4;

  return (
    <section className={`scroll-video is-${videoStatus}`} ref={sectionRef} aria-label="Filme interativo BYD controlado pelo scroll">
      <div className="scroll-video-sticky">
        <div className="film-intro-copy" ref={introRef}>
          <p>02 / Objeto em movimento</p>
          <h2>O filme não começa.<br /><em>Ele se aproxima.</em></h2>
          <span>Continue descendo para ocupar o quadro e conduzir cada mudança de perspectiva.</span>
          <i aria-hidden="true"><b /></i>
        </div>

        <div className="sequence-stage" ref={stageRef}>
          <CanvasScrollSequence
            ref={sequenceRef}
            className="scroll-video-media"
            frameCount={160}
            desktopPath="/frames/byd/desktop"
            mobilePath="/frames/byd/mobile"
            onReady={() => setVideoStatus("ready")}
            onError={() => setVideoStatus("error")}
          />
          <div className="video-loading" role="status" aria-live="polite" aria-hidden={videoStatus === "ready"}>
            <i aria-hidden="true" />
            <span>{videoStatus === "error" ? "Não foi possível carregar o filme" : "Preparando o filme"}</span>
          </div>
          <div className="scroll-video-shade" aria-hidden="true" />
          <div className="contour-typography" aria-hidden="true">
            <span ref={contourARef}>ELECTRIFIED</span>
            <span ref={contourBRef}>INTELLIGENCE</span>
          </div>

          <div className={`hotspot-layer ${showHotspots ? "is-visible" : ""}`}>
            {hotspots.map(({ id, label, x, y }) => (
              <button
                className={`car-hotspot ${selectedHotspot === id ? "is-selected" : ""}`}
                type="button"
                key={id}
                style={{ left: x, top: y }}
                onClick={() => setSelectedHotspot(id)}
                aria-label={`Explorar ${label}`}
                tabIndex={showHotspots ? 0 : -1}
              >
                <i aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="film-hud" ref={hudRef} aria-hidden="true">
          <span className="film-hud-code">AURUM / BYD<br />KINETIC OBJECT 01</span>
          <span className="film-hud-axis">X 036.7&nbsp;&nbsp;Y 012.4</span>
          <i className="film-hud-corner film-hud-corner-a" />
          <i className="film-hud-corner film-hud-corner-b" />
        </div>

        <LazyMotion features={domAnimation}>
          <div className="video-story" ref={storyRef}>
            <AnimatePresence mode="wait">
              {!selected && (
                <m.article
                  className={`video-story-card is-${scene.side} is-${scene.kind ?? "standard"}`}
                  key={activeScene}
                  initial={{ opacity: 0, x: scene.side === "left" ? -48 : 48, y: 14 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: scene.side === "left" ? -24 : 24, y: -8 }}
                  transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p>{scene.eyebrow}</p>
                  {scene.title && <h2>{scene.title}</h2>}
                  <span>{scene.copy}</span>
                </m.article>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selected && (
                <m.aside
                  className="interior-popover"
                  key={selected.id}
                  initial={{ opacity: 0, x: 24, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.98 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  aria-label={`Detalhes: ${selected.label}`}
                >
                  <button type="button" onClick={() => setSelectedHotspot(null)} aria-label="Fechar detalhe">
                    <X aria-hidden="true" />
                  </button>
                  {SelectedIcon && <SelectedIcon aria-hidden="true" />}
                  <small>{selected.label}</small>
                  <h3>{selected.title}</h3>
                  <p>{selected.copy}</p>
                  <button className="popover-continue" type="button" onClick={() => setSelectedHotspot(null)}>
                    Continuar <ArrowRight aria-hidden="true" />
                  </button>
                </m.aside>
              )}
            </AnimatePresence>
          </div>
        </LazyMotion>

        <div className="video-timeline" aria-hidden="true">
          <span>CONDUZA A EXPERIÊNCIA</span>
          <i><b /></i>
          <strong>{String(activeScene + 1).padStart(2, "0")} / 07</strong>
        </div>
      </div>
      <div className="sr-only">
        Filme interativo com sete capítulos: entrada, exterior, transformação, abertura da cabine, interior, detalhes e visão de parceria.
      </div>
    </section>
  );
}
