"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ModelId = "seal" | "sealU";
type HotspotId = "battery" | "platform" | "cockpit" | "aero";

type LoadedCar = {
  root: THREE.Group;
};

const HOTSPOTS: Array<{
  id: HotspotId;
  label: string;
  title: string;
  copy: string;
  xRight: string;
  xLeft: string;
  y: string;
  angle: number;
  light: [number, number, number];
}> = [
  { id: "battery", label: "Bateria", title: "Arquitetura de bateria", copy: "O conjunto de energia integra o assoalho e participa da eficiência estrutural do veículo.", xRight: "67%", xLeft: "33%", y: "66%", angle: .5, light: [.4, -.55, 1.4] },
  { id: "platform", label: "Plataforma", title: "Base eletrificada", copy: "A plataforma organiza propulsão, espaço interno e dinâmica como um único sistema técnico.", xRight: "74%", xLeft: "26%", y: "56%", angle: -.45, light: [1.45, -.25, .6] },
  { id: "cockpit", label: "Cockpit", title: "Cabine conectada", copy: "Interface, ergonomia e conforto transformam tecnologia em uma experiência cotidiana legível.", xRight: "61%", xLeft: "39%", y: "43%", angle: -.18, light: [-.25, .7, .7] },
  { id: "aero", label: "Aerodinâmica", title: "Forma em movimento", copy: "Superfícies contínuas e proporções controladas reduzem ruído visual e reforçam presença de produto.", xRight: "79%", xLeft: "21%", y: "47%", angle: .22, light: [2.1, .25, .15] },
];

function prepareCar(model: THREE.Group, isMobile: boolean): LoadedCar {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = (isMobile ? 2.85 : 4.75) / Math.max(size.x, size.y, size.z);
  model.position.sub(center.multiplyScalar(scale));
  model.scale.setScalar(scale);

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = !isMobile;
    object.receiveShadow = !isMobile;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.envMapIntensity = 1.35;
        material.needsUpdate = true;
      }
    });
  });

  const wrapper = new THREE.Group();
  wrapper.add(model);
  wrapper.visible = false;
  return { root: wrapper };
}

export default function CarExperience() {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeModelRef = useRef<ModelId | null>(null);
  const requestedModelRef = useRef<ModelId>("seal");
  const selectedRef = useRef<HotspotId>("battery");
  const switchModelRef = useRef<(model: ModelId) => void>(() => undefined);
  const focusPulseRef = useRef(0);
  const [activeModel, setActiveModel] = useState<ModelId>("seal");
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotId>("battery");
  const [isReady, setIsReady] = useState(false);
  const selected = HOTSPOTS.find((item) => item.id === selectedHotspot) ?? HOTSPOTS[0];

  useEffect(() => {
    selectedRef.current = selectedHotspot;
    focusPulseRef.current = 1;
  }, [selectedHotspot]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = matchMedia("(max-width: 900px)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(isMobile ? 33 : 27, 1, .1, 100);
    camera.position.set(0, .9, isMobile ? 10.4 : 9.6);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    const context = canvas.getContext("webgl2", { alpha: true, antialias: true }) || canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!context) {
      host.classList.add("is-fallback");
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      host.classList.add("is-fallback");
      return;
    }

    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.15 : 1.55));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    host.prepend(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), .04);
    scene.environment = environment.texture;
    scene.add(new THREE.HemisphereLight(0xfff8ec, 0x251e18, 2.1));

    const key = new THREE.SpotLight(0xffffff, 115, 24, Math.PI * .22, .58, 1.2);
    key.position.set(4.5, 7, 6);
    key.target.position.set(0, 0, 0);
    key.castShadow = !isMobile;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key, key.target);

    const rim = new THREE.DirectionalLight(0xe8c77a, 3.6);
    rim.position.set(-4, 2.5, -5);
    scene.add(rim);
    const redLight = new THREE.PointLight(0xe1251d, 13, 8);
    redLight.position.set(2, .2, 2.2);
    scene.add(redLight);
    const focusLight = new THREE.PointLight(0xff5a4f, 0, 3.8);
    scene.add(focusLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 8),
      new THREE.ShadowMaterial({ color: 0x3c2c20, opacity: isMobile ? 0 : .22 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.38;
    floor.receiveShadow = !isMobile;
    scene.add(floor);

    const stage = new THREE.Group();
    stage.position.y = isMobile ? .25 : -.35;
    scene.add(stage);

    const loader = new GLTFLoader();
    let seal: LoadedCar | null = null;
    let sealU: LoadedCar | null = null;
    let sealPromise: Promise<LoadedCar> | null = null;
    let sealUPromise: Promise<LoadedCar> | null = null;
    let vehicleProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let active = false;
    let disposed = false;
    let raf = 0;
    let transitionTimeline: gsap.core.Timeline | null = null;

    const load = (url: string) => new Promise<LoadedCar>((resolve, reject) => {
      loader.load(url, (gltf) => {
        if (disposed) return;
        const car = prepareCar(gltf.scene, isMobile);
        stage.add(car.root);
        resolve(car);
      }, undefined, reject);
    });
    const loadSeal = () => sealPromise ??= load("/models/byd-seal.glb").then((car) => (seal = car));
    const loadSealU = () => sealUPromise ??= load("/models/byd-seal-u-dmi.glb").then((car) => (sealU = car));

    const setVisibleModel = (model: ModelId) => {
      if (seal) seal.root.visible = model === "seal";
      if (sealU) sealU.root.visible = model === "sealU";
      activeModelRef.current = model;
      setActiveModel(model);
    };

    const requestModel = async (model: ModelId, immediate = false) => {
      requestedModelRef.current = model;
      try {
        if (model === "seal") await loadSeal(); else await loadSealU();
      } catch {
        host.classList.add("is-fallback");
        return;
      }
      if (disposed || requestedModelRef.current !== model || activeModelRef.current === model) return;
      const wipe = host.querySelector<HTMLElement>(".car-model-wipe");
      transitionTimeline?.kill();
      if (immediate || !wipe) {
        setVisibleModel(model);
        return;
      }
      transitionTimeline = gsap.timeline({ defaults: { ease: "power4.inOut" } })
        .set(wipe, { transformOrigin: "left center" })
        .to(wipe, { scaleX: 1, duration: .42 })
        .call(() => setVisibleModel(model))
        .set(wipe, { transformOrigin: "right center" })
        .to(wipe, { scaleX: 0, duration: .56 });
    };
    switchModelRef.current = (model) => void requestModel(model);

    const renderFrame = () => {
      if (disposed) return;
      const middleChapter = vehicleProgress > .28 && vehicleProgress < .72;
      const side = middleChapter ? "left" : "right";
      if (host.dataset.side !== side) host.dataset.side = side;
      const targetX = isMobile ? 0 : middleChapter ? -1.55 : 1.55;
      stage.position.x += (targetX - stage.position.x) * .055;

      const activeCar = activeModelRef.current === "sealU" ? sealU : seal;
      const hotspot = HOTSPOTS.find((item) => item.id === selectedRef.current) ?? HOTSPOTS[0];
      focusPulseRef.current *= .93;
      focusLight.intensity += ((7 + focusPulseRef.current * 16) - focusLight.intensity) * .08;
      focusLight.position.lerp(new THREE.Vector3(...hotspot.light), .08);
      camera.position.z += (((isMobile ? 10.4 : 9.6) - focusPulseRef.current * .75) - camera.position.z) * .07;

      if (activeCar) {
        const baseRotation = activeModelRef.current === "sealU" ? Math.PI * .32 : Math.PI * .72;
        const targetRotation = baseRotation + hotspot.angle + vehicleProgress * .36 + pointerX * .12;
        activeCar.root.rotation.y += (targetRotation - activeCar.root.rotation.y) * .055;
        activeCar.root.rotation.x += ((pointerY * .045) - activeCar.root.rotation.x) * .05;
        const scale = 1 + Math.sin(vehicleProgress * Math.PI) * .025 + focusPulseRef.current * .025;
        activeCar.root.scale.lerp(new THREE.Vector3(scale, scale, scale), .08);
      }
      renderer.render(scene, camera);
      if (active) raf = requestAnimationFrame(renderFrame);
    };

    const preloadTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top 160%",
      once: true,
      onEnter: () => {
        loadSeal().then(() => {
          if (disposed) return;
          setIsReady(true);
          host.classList.add("is-ready");
          void requestModel("seal", true);
          renderFrame();
          void loadSealU();
        }).catch(() => host.classList.add("is-fallback"));
      },
    });

    const progressTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        vehicleProgress = self.progress;
        const desired: ModelId = self.progress < .63 ? "seal" : "sealU";
        if (desired !== requestedModelRef.current) void requestModel(desired);
      },
    });

    const visibilityTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        active = self.isActive;
        gsap.to(host, { opacity: active ? 1 : 0, duration: .55, ease: "power2.out" });
        cancelAnimationFrame(raf);
        if (active) renderFrame();
      },
    });

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX / innerWidth - .5;
      pointerY = event.clientY / innerHeight - .5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      if (!active) renderer.render(scene, camera);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      disposed = true;
      active = false;
      switchModelRef.current = () => undefined;
      transitionTimeline?.kill();
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      preloadTrigger.kill();
      progressTrigger.kill();
      visibilityTrigger.kill();
      renderer.dispose();
      environment.dispose();
      pmrem.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.domElement.remove();
    };
  }, []);

  return <div className="car-experience" ref={hostRef} data-side="right">
    <span className="car-stage-status">{isReady ? (activeModel === "seal" ? "BYD SEAL" : "BYD SEAL U DM-i") : "CARREGANDO MODELO"}</span>
    <div className="car-model-switch" role="group" aria-label="Escolher modelo BYD">
      <button className={activeModel === "seal" ? "active" : ""} aria-pressed={activeModel === "seal"} onClick={() => switchModelRef.current("seal")} type="button">Seal</button>
      <button className={activeModel === "sealU" ? "active" : ""} aria-pressed={activeModel === "sealU"} onClick={() => switchModelRef.current("sealU")} type="button">Seal U DM-i</button>
    </div>
    <div className="car-hotspot-layer" aria-label="Componentes do veículo">
      {HOTSPOTS.map((item) => <button
        key={item.id}
        type="button"
        className={`car-hotspot ${selectedHotspot === item.id ? "active" : ""}`}
        style={{ "--x-right": item.xRight, "--x-left": item.xLeft, "--hotspot-y": item.y } as React.CSSProperties}
        onClick={() => setSelectedHotspot(item.id)}
        aria-label={`Explorar ${item.label}`}
        aria-pressed={selectedHotspot === item.id}
      ><i/><span>{item.label}</span></button>)}
    </div>
    <aside className="car-inspector" aria-live="polite">
      <div><small>EXPLORE O VEÍCULO</small><strong>{selected.title}</strong><p>{selected.copy}</p></div>
      <div className="car-component-tabs">{HOTSPOTS.map((item) => <button key={item.id} type="button" className={selectedHotspot === item.id ? "active" : ""} onClick={() => setSelectedHotspot(item.id)}>{item.label}</button>)}</div>
    </aside>
    <div className="car-model-wipe" aria-hidden="true"/>
  </div>;
}
