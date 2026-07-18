"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MovingPart = {
  object: THREE.Object3D;
  origin: THREE.Vector3;
  explode: THREE.Vector3;
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function CarExperience() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const activateFallback = () => {
      host.classList.add("is-fallback");
      const trigger = ScrollTrigger.create({
        trigger: ".vehicle-motion",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => gsap.to(host, { opacity: self.isActive ? .64 : .08, duration: .7, ease: "power2.out" }),
      });
      return () => {
        trigger.kill();
        host.classList.remove("is-fallback");
      };
    };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 1.1, 9.6);

    const renderCanvas = document.createElement("canvas");
    const context = renderCanvas.getContext("webgl2", { alpha: true, antialias: true }) || renderCanvas.getContext("webgl", { alpha: true, antialias: true });
    if (!context) return activateFallback();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: renderCanvas, context, alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return activateFallback();
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff5df, 0x1d1711, 2.7));
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(4, 6, 5);
    scene.add(key);
    const redLight = new THREE.PointLight(0xe1251d, 18, 10);
    redLight.position.set(-3.5, 0.2, 2.8);
    scene.add(redLight);
    const goldLight = new THREE.PointLight(0xd1aa4f, 10, 9);
    goldLight.position.set(3.6, 1.8, -2.4);
    scene.add(goldLight);

    const car = new THREE.Group();
    scene.add(car);
    const moving: MovingPart[] = [];
    const graphite = new THREE.MeshPhysicalMaterial({ color: 0x241f1b, metalness: 0.82, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });
    const darkGlass = new THREE.MeshPhysicalMaterial({ color: 0x28383a, metalness: 0.35, roughness: 0.08, transmission: 0.2, transparent: true, opacity: 0.84 });
    const red = new THREE.MeshPhysicalMaterial({ color: 0xe1251d, metalness: 0.55, roughness: 0.25, emissive: 0x380300, emissiveIntensity: 0.5 });
    const tire = new THREE.MeshStandardMaterial({ color: 0x090909, metalness: 0.15, roughness: 0.72 });
    const rim = new THREE.MeshStandardMaterial({ color: 0xbba66f, metalness: 0.9, roughness: 0.18 });
    const lamp = new THREE.MeshStandardMaterial({ color: 0xfff7dd, emissive: 0xffe7a2, emissiveIntensity: 4 });

    const addPart = (object: THREE.Object3D, explode: [number, number, number]) => {
      car.add(object);
      moving.push({ object, origin: object.position.clone(), explode: new THREE.Vector3(...explode) });
      return object;
    };

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.72, 1.78, 8, 3, 4), graphite);
    chassis.position.y = 0.06;
    chassis.scale.set(1, 0.7, 1);
    addPart(chassis, [0, -1.25, 0]);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.32, 1.72, 4, 2, 4), graphite);
    hood.position.set(1.46, 0.48, 0);
    hood.rotation.z = -0.07;
    addPart(hood, [2.3, 0.9, 0.15]);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.82, 1.48, 5, 3, 4), darkGlass);
    cabin.position.set(-0.34, 0.87, 0);
    cabin.rotation.z = -0.025;
    cabin.scale.set(1, 0.82, 0.95);
    addPart(cabin, [-0.3, 2.2, 0]);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.13, 1.5), graphite);
    roof.position.set(-0.42, 1.31, 0);
    addPart(roof, [-0.8, 2.8, -0.15]);

    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 1.5), red);
    lightBar.position.set(-2.29, 0.46, 0);
    addPart(lightBar, [-2.4, 0.45, 0]);

    [1, -1].forEach((side) => {
      const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.48), lamp);
      headlight.position.set(2.29, 0.42, side * 0.55);
      addPart(headlight, [2.1, 0.35, side * 1.25]);
    });

    [[1.4, 0.88], [1.4, -0.88], [-1.42, 0.88], [-1.42, -0.88]].forEach(([x, z], index) => {
      const wheel = new THREE.Group();
      const rubber = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.25, 28), tire);
      rubber.rotation.x = Math.PI / 2;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.27, 10), rim);
      hub.rotation.x = Math.PI / 2;
      wheel.add(rubber, hub);
      wheel.position.set(x, -0.2, z);
      addPart(wheel, [x > 0 ? 1.6 : -1.6, -0.55, z > 0 ? 1.8 : -1.8]);
      wheel.userData.index = index;
    });

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 64),
      new THREE.MeshBasicMaterial({ color: 0xd5b260, transparent: true, opacity: 0.09, side: THREE.DoubleSide }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.66;
    scene.add(floor);

    let pageProgress = 0;
    let vehicleProgress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let raf = 0;

    const explosionAt = (p: number) => {
      if (p < 0.11) return 1 - clamp(p / 0.11);
      if (p < 0.3) return 0;
      if (p < 0.39) return clamp((p - 0.3) / 0.09);
      if (p < 0.52) return 1 - clamp((p - 0.39) / 0.13);
      if (p < 0.72) return 0;
      if (p < 0.81) return clamp((p - 0.72) / 0.09);
      if (p < 0.93) return 1 - clamp((p - 0.81) / 0.12);
      return 0;
    };

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX / innerWidth - 0.5;
      pointerY = event.clientY / innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const pageTrigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "max",
      onUpdate: (self) => { pageProgress = self.progress; },
    });
    const vehicleTrigger = ScrollTrigger.create({
      trigger: ".vehicle-motion",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => { vehicleProgress = self.progress; },
      onEnter: () => gsap.to(host, { opacity: 1, duration: 0.8, ease: "power2.out" }),
      onEnterBack: () => gsap.to(host, { opacity: 1, duration: 0.8, ease: "power2.out" }),
      onLeave: () => gsap.to(host, { opacity: 0.16, duration: 0.8 }),
      onLeaveBack: () => gsap.to(host, { opacity: 0.16, duration: 0.8 }),
    });

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const render = () => {
      const explode = explosionAt(vehicleProgress);
      moving.forEach((part) => {
        const eased = THREE.MathUtils.smoothstep(explode, 0, 1);
        part.object.position.copy(part.origin).addScaledVector(part.explode, eased);
        if (part.object.userData.index !== undefined) part.object.rotation.z = pageProgress * Math.PI * 8;
      });
      car.rotation.y += ((pageProgress * Math.PI * 5.4 + pointerX * 0.24) - car.rotation.y) * 0.055;
      car.rotation.x += ((pointerY * 0.09 + Math.sin(pageProgress * Math.PI * 3) * 0.035) - car.rotation.x) * 0.05;
      car.position.x += (((innerWidth < 900 ? 0 : 1.35) + Math.sin(pageProgress * Math.PI * 4) * 0.32) - car.position.x) * 0.05;
      car.position.y = Math.sin(pageProgress * Math.PI * 5) * 0.08;
      const targetScale = innerWidth < 900 ? 0.58 : 0.9 + Math.sin(vehicleProgress * Math.PI) * 0.08;
      car.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
      floor.rotation.z = -pageProgress * Math.PI * 1.8;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      pageTrigger.kill();
      vehicleTrigger.kill();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      host.replaceChildren();
    };
  }, []);

  return <div className="car-experience" ref={hostRef} aria-hidden="true"><span>3D CONCEITUAL · SCROLL TO DRIVE</span></div>;
}
