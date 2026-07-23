"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowUpRight, BatteryCharging, Gauge, MonitorSmartphone, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const scenes = [
  {
    eyebrow: "02 / Filme interativo",
    title: "Presença em movimento.",
    copy: "O BYD Seal U DM-i entra em cena. O seu scroll conduz cada enquadramento.",
    interactive: false,
  },
  {
    eyebrow: "Design em movimento",
    title: "Forma, luz e proporção.",
    copy: "A carroceria se revela por ângulos precisos, sem interromper a narrativa.",
    interactive: false,
  },
  {
    eyebrow: "Interior interativo",
    title: "A cabine se abre.",
    copy: "Neste momento, o interior pode ser explorado sem tirar o carro de cena.",
    interactive: true,
  },
  {
    eyebrow: "Visão de parceria",
    title: "Produto vira experiência.",
    copy: "Cinema, mobilidade e tecnologia reunidos em uma plataforma de relacionamento.",
    interactive: false,
  },
] as const;

const features = [
  { icon: MonitorSmartphone, title: "Cabine conectada", copy: "Interface e ergonomia transformam tecnologia em uma experiência cotidiana legível." },
  { icon: BatteryCharging, title: "Arquitetura elétrica", copy: "Eficiência, integração e inteligência organizadas como um único sistema." },
  { icon: Gauge, title: "Conforto em movimento", copy: "Silêncio, amplitude e resposta suave para uma jornada premium." },
] as const;

export default function ScrollVideoExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef(0);
  const targetTimeRef = useRef(0);
  const sceneRef = useRef(0);
  const lastSeekRef = useRef(0);
  const primedRef = useRef(false);
  const [activeScene, setActiveScene] = useState(0);
  const [interiorOpen, setInteriorOpen] = useState(false);
  const [videoStatus, setVideoStatus] = useState<"loading" | "ready" | "error">("loading");

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;

    const loadTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 220%",
      once: true,
      onEnter: () => {
        video.preload = "auto";
        video.load();
      },
    });

    if (reduceMotion) {
      video.preload = "metadata";
      return () => loadTrigger.kill();
    }

    const seek = (timestamp: number) => {
      frameRef.current = 0;
      if (disposed || video.readyState < 2 || !Number.isFinite(video.duration)) return;
      const delta = Math.abs(video.currentTime - targetTimeRef.current);
      if (!video.seeking && delta > 0.025 && timestamp - lastSeekRef.current > 48) {
        lastSeekRef.current = timestamp;
        const fastSeek = (video as HTMLVideoElement & { fastSeek?: (time: number) => void }).fastSeek;
        if (delta > 0.25 && fastSeek) fastSeek.call(video, targetTimeRef.current);
        else video.currentTime = targetTimeRef.current;
      }
      if (video.seeking || delta > 0.025) frameRef.current = requestAnimationFrame(seek);
    };

    const queueSeek = () => {
      if (!frameRef.current) frameRef.current = requestAnimationFrame(seek);
    };
    const onSeeked = () => queueSeek();
    const onReady = () => {
      setVideoStatus("ready");
      if (!primedRef.current) {
        primedRef.current = true;
        const playAttempt = video.play();
        playAttempt?.then(() => video.pause()).catch(() => undefined);
      }
      queueSeek();
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("canplay", onReady, { once: true });

    const progressTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onToggle: ({ isActive }) => {
        section.classList.toggle("is-active", isActive);
        document.body.classList.toggle("video-active", isActive);
      },
      onUpdate: ({ progress }) => {
        const inVideo = progress > 0 && progress < 1;
        section.classList.toggle("is-active", inVideo);
        document.body.classList.toggle("video-active", inVideo);
        const duration = Number.isFinite(video.duration) ? video.duration : 32;
        targetTimeRef.current = Math.min(duration - 0.08, progress * duration);
        queueSeek();

        const nextScene = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
        if (nextScene !== sceneRef.current) {
          sceneRef.current = nextScene;
          setActiveScene(nextScene);
          if (nextScene !== 2) setInteriorOpen(false);
        }
        section.style.setProperty("--video-progress", `${progress * 100}%`);
      },
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("canplay", onReady);
      loadTrigger.kill();
      progressTrigger.kill();
      section.classList.remove("is-active");
      document.body.classList.remove("video-active");
    };
  }, []);

  const scene = scenes[activeScene];

  return (
    <section className={`scroll-video is-${videoStatus}`} ref={sectionRef} aria-label="BYD Seal U DM-i em experiência controlada pelo scroll">
      <div className="scroll-video-sticky">
        <video
          ref={videoRef}
          className="scroll-video-media"
          muted
          playsInline
          preload="metadata"
          poster="/video/byd-scroll-poster.webp"
          onLoadedMetadata={() => {
            if (targetTimeRef.current > 0 && videoRef.current) videoRef.current.currentTime = targetTimeRef.current;
          }}
          onCanPlay={() => setVideoStatus("ready")}
          onStalled={() => setVideoStatus("loading")}
          onError={() => setVideoStatus("error")}
          aria-hidden="true"
        >
          <source src="/video/byd-scroll-mobile.mp4" media="(max-width: 700px)" type="video/mp4" />
          <source src="/video/byd-scroll-desktop.mp4" type="video/mp4" />
        </video>
        <div className="video-loading" role="status" aria-live="polite" aria-hidden={videoStatus === "ready"}>
          <i aria-hidden="true" />
          <span>{videoStatus === "error" ? "Não foi possível carregar o filme" : "Preparando o filme"}</span>
        </div>
        <div className="scroll-video-shade" aria-hidden="true" />

        <LazyMotion features={domAnimation}>
          <div className="video-story" aria-live="polite">
            <AnimatePresence>
              {!interiorOpen && <m.article
                className={`video-story-card scene-${activeScene + 1}`}
                key={activeScene}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                <p>{scene.eyebrow}</p>
                <h2>{scene.title}</h2>
                <span>{scene.copy}</span>
                {scene.interactive && (
                  <button type="button" className="interior-trigger" onClick={() => setInteriorOpen(true)}>
                    <span>Explorar o interior</span>
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                )}
              </m.article>}
            </AnimatePresence>

            <AnimatePresence>
              {interiorOpen && (
                <m.aside
                  className="interior-panel"
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 12 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  aria-label="Detalhes do interior"
                >
                  <button className="interior-close" type="button" onClick={() => setInteriorOpen(false)} aria-label="Fechar detalhes do interior">
                    <X aria-hidden="true" />
                  </button>
                  <small>INTERIOR BYD</small>
                  <h3>O futuro visto por dentro.</h3>
                  <div className="interior-features">
                    {features.map(({ icon: Icon, title, copy }) => (
                      <div key={title}>
                        <Icon aria-hidden="true" />
                        <strong>{title}</strong>
                        <p>{copy}</p>
                      </div>
                    ))}
                  </div>
                </m.aside>
              )}
            </AnimatePresence>
          </div>
        </LazyMotion>

        <div className="video-timeline" aria-hidden="true">
          <span>SCROLL TO PLAY</span>
          <i><b /></i>
          <strong>{String(activeScene + 1).padStart(2, "0")} / 04</strong>
        </div>
      </div>
    </section>
  );
}
