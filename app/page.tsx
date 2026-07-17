"use client";

import { useEffect, useRef, useState } from "react";

type Lockup = "endorsed" | "integrated" | "signature";
type Scenario = "launch" | "premiere" | "always";

const lockups: Record<Lockup, { label: string; note: string }> = {
  endorsed: { label: "Endorsed", note: "Recomendado — preserva o equity AURUM e posiciona BYD como chancela de futuro." },
  integrated: { label: "Integrated", note: "Mais institucional. Ideal para fachada, sinalização permanente e materiais corporativos." },
  signature: { label: "Signature", note: "Mais expressivo. Funciona melhor em campanhas, estreias e ativações de alto impacto." },
};

const scenarios: Record<Scenario, { eyebrow: string; title: string; copy: string; items: string[] }> = {
  launch: { eyebrow: "01 — Lançamento", title: "O cinema vira palco de produto.", copy: "Uma noite proprietária para revelar veículos, tecnologia e visão de marca em ambiente imersivo.", items: ["Product stage no lobby", "Conteúdo na tela principal", "Test-drive e hospitalidade"] },
  premiere: { eyebrow: "02 — Première", title: "A BYD entra na cultura.", copy: "Estreias, talentos e convidados conectam a marca ao repertório cultural de Goiânia.", items: ["Naming da première", "Photo opportunity", "Conteúdo social e imprensa"] },
  always: { eyebrow: "03 — Always on", title: "Presença que não termina no evento.", copy: "Uma plataforma contínua de relacionamento, mídia, conteúdo e experiência premium.", items: ["Branding físico e digital", "Benefícios para clientes BYD", "Agenda corporativa recorrente"] },
};

function BrandLockup({ mode = "endorsed", light = false }: { mode?: Lockup; light?: boolean }) {
  return <div className={`brand-lockup brand-${mode} ${light ? "is-light" : ""}`} aria-label="Conceito de assinatura AURUM Cinema by BYD">
    <div className="aurum-mark"><span>AURUM</span><small>CINEMA</small></div><i aria-hidden="true" /><div className="byd-mark"><small>by</small><b>BYD</b></div>
  </div>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); observer.disconnect(); } }, { threshold: .12 });
    observer.observe(el); return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

export default function Home() {
  const [lockup, setLockup] = useState<Lockup>("endorsed");
  const [scenario, setScenario] = useState<Scenario>("launch");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "ArrowDown" || e.key === "PageDown") window.scrollBy({ top: innerHeight * .82, behavior: "smooth" });
      if (e.key === "ArrowUp" || e.key === "PageUp") window.scrollBy({ top: -innerHeight * .82, behavior: "smooth" });
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, []);

  return <main>
    <div className="grain" aria-hidden="true" />
    <header className="nav-shell">
      <a href="#top" className="nav-brand"><BrandLockup /></a>
      <nav aria-label="Navegação principal"><a href="#visao">Visão</a><a href="#marca">Marca</a><a href="#experiencia">Experiência</a><a href="#oportunidade">Oportunidade</a></nav>
      <button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}><span /><span /></button>
    </header>

    <div className={`menu-overlay ${menuOpen ? "open" : ""}`}>
      {[["#visao","Visão"],["#marca","Marca"],["#experiencia","Experiência"],["#oportunidade","Oportunidade"]].map(([href,label],i) => <a key={href} href={href} style={{transitionDelay:`${100+i*70}ms`}} onClick={() => setMenuOpen(false)}>{label}</a>)}
    </div>

    <section className="hero" id="top">
      <div className="hero-image" aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /><div className="red-orbit" aria-hidden="true" />
      <div className="hero-content"><p className="kicker">Apresentação confidencial · 2026</p><h1><span>O futuro da</span><span>experiência</span><span className="gold">cinematográfica</span><span>começa aqui.</span></h1><p className="hero-copy">Uma aliança entre cultura, mobilidade e tecnologia para redefinir o cinema premium em Goiânia.</p><a className="magnetic-cta" href="#visao"><span>Explorar a visão</span><i>↘</i></a></div>
      <div className="hero-index"><span>01</span><i /><small>06</small></div><a href="#visao" className="scroll-cue" aria-label="Continuar"><i /><span>SCROLL</span></a>
    </section>

    <section className="statement" id="visao"><Reveal><p className="section-number">01 / A tese</p><h2>Não é apenas naming.<br/><em>É um ativo cultural vivo.</em></h2><div className="statement-grid"><p>O AURUM entrega contexto, frequência e experiência. A BYD adiciona inovação, escala e uma visão de futuro reconhecível.</p><p>Juntas, as marcas criam um território proprietário onde entretenimento e mobilidade se encontram — com valor para público, parceiros e investidores.</p></div></Reveal></section>

    <section className="brand-lab" id="marca">
      <Reveal className="brand-lab-head"><div><p className="section-number">02 / Arquitetura de marca</p><h2>Uma nova assinatura.<br/><em>O mesmo patrimônio.</em></h2></div><p>O AURUM continua sendo o destino. BYD se torna a chancela que acelera o próximo capítulo.</p></Reveal>
      <div className="lockup-stage"><div className="stage-meta"><span>CO-BRAND SYSTEM</span><span>PROPOSTA 01 — RECOMENDADA</span></div><BrandLockup mode={lockup} light /><p>{lockups[lockup].note}</p><div className="lockup-tabs" role="tablist" aria-label="Opções de assinatura">{(Object.keys(lockups) as Lockup[]).map((key,i) => <button role="tab" aria-selected={lockup === key} className={lockup === key ? "active" : ""} onClick={() => setLockup(key)} key={key}><small>0{i+1}</small>{lockups[key].label}</button>)}</div></div>
      <p className="concept-note">Estudo conceitual de co-branding. A versão final deverá passar pela aprovação das duas marcas.</p>
    </section>

    <section className="experience" id="experiencia"><Reveal className="experience-intro"><p className="section-number">03 / O cinema transformado</p><h2>Da fachada à última cena,<br/><em>uma presença integrada.</em></h2></Reveal><div className="spatial-grid"><Reveal className="space-card space-card-large facade"><div className="space-label"><small>01</small><h3>Chegada</h3><p>Uma assinatura arquitetônica que transforma entrada e fachada em ícone.</p></div></Reveal><Reveal className="space-card lobby"><div className="space-label"><small>02</small><h3>Galeria</h3><p>Lobby como palco de produto, encontros e lançamentos.</p></div></Reveal><Reveal className="space-card auditorium"><div className="space-label"><small>03</small><h3>Imersão</h3><p>Sala e tela conectadas à narrativa da parceria.</p></div></Reveal></div><p className="concept-note light-note">Visualizações conceituais; não representam projeto arquitetônico executivo.</p></section>

    <section className="activation"><div className="activation-media"><div className={`scenario-visual visual-${scenario}`}><span>{scenarios[scenario].eyebrow}</span></div></div><div className="activation-content"><p className="section-number">04 / Plataforma de ativação</p><div className="scenario-tabs" role="tablist">{(Object.keys(scenarios) as Scenario[]).map(key => <button key={key} role="tab" aria-selected={scenario === key} className={scenario === key ? "active" : ""} onClick={() => setScenario(key)}>{scenarios[key].eyebrow.split(" — ")[1]}</button>)}</div><div className="scenario-copy" key={scenario}><h2>{scenarios[scenario].title}</h2><p>{scenarios[scenario].copy}</p><ul>{scenarios[scenario].items.map(item => <li key={item}><i>↗</i>{item}</li>)}</ul></div></div></section>

    <section className="value" id="oportunidade"><Reveal><p className="section-number">05 / A oportunidade</p><h2>O que a BYD passa<br/>a <em>possuir</em> na conversa.</h2></Reveal><div className="value-grid">{[["01","Território cultural","Presença proprietária em um dos endereços culturais mais reconhecíveis de Goiânia."],["02","Audiência premium","Contato recorrente com um público predisposto a tecnologia, conforto e experiência."],["03","Conteúdo contínuo","Uma agenda real de filmes, estreias, eventos e narrativas para alimentar a marca."],["04","Hospitalidade","Um espaço pronto para relacionamento, lançamentos, imprensa e comunidade."]].map(([n,title,copy]) => <Reveal className="value-card" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><i>↗</i></Reveal>)}</div></section>

    <section className="proof"><div className="proof-word">AURUM</div><Reveal><p className="section-number">06 / Por que agora</p><blockquote>“O futuro não precisa de mais uma tela.<br/>Precisa de um lugar onde possa ser vivido.”</blockquote><div className="proof-facts"><div><strong>Oscar Niemeyer</strong><span>Endereço cultural e arquitetura que inspira.</span></div><div><strong>Experiência premium</strong><span>Conforto, tecnologia e curadoria em um só destino.</span></div><div><strong>Presença recorrente</strong><span>Uma marca ativa todos os dias, não apenas em campanhas.</span></div></div></Reveal></section>

    <footer><p className="section-number">Próximo capítulo</p><h2>Vamos construir o cinema<br/>do <em>futuro.</em></h2><a className="magnetic-cta light-cta" href="mailto:contato@aurumcinema.com.br"><span>Iniciar a conversa</span><i>↗</i></a><div className="footer-row"><BrandLockup light /><span>Centro Cultural Oscar Niemeyer · Goiânia, GO</span><span>Apresentação confidencial · 2026</span></div></footer>
  </main>;
}
