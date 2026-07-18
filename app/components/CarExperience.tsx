"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type LoadedCar = {
  root: THREE.Group;
  materials: Array<{ material: THREE.Material & { opacity: number }; opacity: number }>;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function prepareCar(root: THREE.Group): LoadedCar {
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 5.7 / Math.max(size.x, size.y, size.z);
  root.position.sub(center.multiplyScalar(scale));
  root.scale.setScalar(scale);
  const wrapper = new THREE.Group();
  wrapper.rotation.set(0.02, Math.PI * 0.72, 0);
  wrapper.add(root);

  const materials: LoadedCar["materials"] = [];
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.castShadow = false;
    object.receiveShadow = false;
    const source = Array.isArray(object.material) ? object.material : [object.material];
    const cloned = source.map((material) => material.clone());
    object.material = Array.isArray(object.material) ? cloned : cloned[0];
    cloned.forEach((material) => {
      material.transparent = true;
      material.depthWrite = true;
      materials.push({ material: material as THREE.Material & { opacity: number }, opacity: material.opacity });
    });
  });
  return { root: wrapper, materials };
}

function setCarOpacity(car: LoadedCar | null, opacity: number) {
  if (!car) return;
  car.root.visible = opacity > 0.002;
  car.materials.forEach(({ material, opacity: sourceOpacity }) => {
    material.opacity = sourceOpacity * opacity;
    material.depthWrite = opacity > 0.92;
  });
}

export default function CarExperience() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const label = host.querySelector<HTMLElement>("span");
    const activateFallback = () => {
      host.classList.add("is-fallback");
      if (label) label.textContent = "BYD SEAL + SEAL U";
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 1.05, 9.8);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { alpha: true, antialias: true }) || canvas.getContext("webgl", { alpha: true, antialias: true });
    if (!context) {
      activateFallback();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      activateFallback();
      return;
    }

    const isMobile = matchMedia("(max-width: 900px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.15 : 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff8e9, 0x3a3028, 3.2));
    const key = new THREE.DirectionalLight(0xffffff, 4.8);
    key.position.set(4.5, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe3bd65, 3.1);
    rim.position.set(-4, 2, -4);
    scene.add(rim);
    const bydRed = new THREE.PointLight(0xe1251d, 10, 10);
    bydRed.position.set(-3.8, 0.4, 3.2);
    scene.add(bydRed);

    const stage = new THREE.Group();
    stage.position.set(isMobile ? 0 : 1.25, isMobile ? -0.7 : -0.42, 0);
    scene.add(stage);

    const loader = new GLTFLoader();
    let seal: LoadedCar | null = null;
    let sealU: LoadedCar | null = null;
    let firstRequested = false;
    let secondRequested = false;
    let vehicleProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let active = false;
    let raf = 0;
    let disposed = false;

    const renderFrame = () => {
      if (disposed) return;
      const swap = clamp((vehicleProgress - 0.52) / 0.16);
      setCarOpacity(seal, 1 - THREE.MathUtils.smoothstep(swap, 0, 1));
      setCarOpacity(sealU, THREE.MathUtils.smoothstep(swap, 0, 1));
      if (seal) {
        seal.root.rotation.y += ((Math.PI * (0.72 + vehicleProgress * 0.88) + pointerX * 0.16) - seal.root.rotation.y) * 0.055;
        seal.root.rotation.x += ((pointerY * 0.055) - seal.root.rotation.x) * 0.05;
        seal.root.scale.setScalar((isMobile ? 0.78 : 0.92) * (1 + Math.sin(vehicleProgress * Math.PI) * 0.06) * (1 - swap * 0.1));
      }
      if (sealU) {
        sealU.root.rotation.y += ((Math.PI * (0.3 + vehicleProgress * 0.7) + pointerX * 0.14) - sealU.root.rotation.y) * 0.055;
        sealU.root.rotation.x += ((pointerY * 0.05) - sealU.root.rotation.x) * 0.05;
        sealU.root.scale.setScalar((isMobile ? 0.75 : 0.9) * (0.88 + swap * 0.12));
      }
      stage.position.x += (((isMobile ? 0 : 1.25) + Math.sin(vehicleProgress * Math.PI * 2) * (isMobile ? 0.12 : 0.4)) - stage.position.x) * 0.05;
      stage.rotation.z = Math.sin(vehicleProgress * Math.PI * 2) * 0.018;
      if (label) label.textContent = swap > 0.55 ? "BYD SEAL U DM-i" : "BYD SEAL";
      renderer.render(scene, camera);
      if (active) raf = requestAnimationFrame(renderFrame);
    };

    const loadSecond = () => {
      if (secondRequested || disposed) return;
      secondRequested = true;
      loader.load("/models/byd-seal-u-dmi.glb", (gltf) => {
        if (disposed) return;
        sealU = prepareCar(gltf.scene);
        stage.add(sealU.root);
        setCarOpacity(sealU, 0);
      }, undefined, () => { secondRequested = false; });
    };

    const loadFirst = () => {
      if (firstRequested || disposed) return;
      firstRequested = true;
      loader.load("/models/byd-seal.glb", (gltf) => {
        if (disposed) return;
        seal = prepareCar(gltf.scene);
        stage.add(seal.root);
        host.classList.add("is-ready");
        if (label) label.textContent = "BYD SEAL";
        renderFrame();
      }, undefined, activateFallback);
    };

    const preloadTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top 150%",
      once: true,
      onEnter: loadFirst,
    });

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX / innerWidth - 0.5;
      pointerY = event.clientY / innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const vehicleTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        vehicleProgress = self.progress;
        if (self.progress > 0.36) loadSecond();
      },
      onToggle: (self) => {
        active = self.isActive;
        gsap.to(host, { opacity: active ? 1 : 0, duration: 0.65, ease: "power2.out" });
        cancelAnimationFrame(raf);
        if (active) renderFrame();
      },
    });

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
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      preloadTrigger.kill();
      vehicleTrigger.kill();
      renderer.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      host.replaceChildren();
    };
  }, []);

  return <div className="car-experience" ref={hostRef} aria-hidden="true"><span>CARREGANDO BYD SEAL</span></div>;
}


