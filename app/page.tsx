"use client";

import { useEffect, useRef, useState } from "react";

type Lockup = "endorsed" | "integrated" | "signature";
type Scenario = "launch" | "premiere" | "always" | "owners";
type Journey = "arrival" | "lobby" | "session" | "after";

const lockups: Record<Lockup, { label: string; note: string }> = {
  endorsed: { label: "Endorsed", note: "Recomendado — AURUM permanece como marca principal e BYD entra como chancela de futuro." },
  integrated: { label: "Integrated", note: "Relação institucional equilibrada para fachada, sinalização permanente e apresentações corporativas." },
  signature: { label: "AU Signature", note: "O eneagrama oficial AU cria uma assinatura compacta para aplicações digitais, brindes e experiências." },
};

const scenarios: Record<Scenario, { eyebrow: string; title: string; copy: string; items: string[] }> = {
  launch: { eyebrow: "01 — Lançamento", title: "O cinema vira palco de produto.", copy: "Uma noite proprietária para revelar veículos, tecnologia e visão de marca em ambiente imersivo.", items: ["Product stage no lobby", "Conteúdo na tela principal", "Test-drive e hospitalidade"] },
  premiere: { eyebrow: "02 — Première", title: "A BYD entra na cultura.", copy: "Estreias, talentos e convidados conectam a marca ao repertório cultural de Goiânia.", items: ["Naming da première", "Photo opportunity", "Conteúdo social e imprensa"] },
  always: { eyebrow: "03 — Always on", title: "Presença que não termina no evento.", copy: "Uma plataforma contínua de relacionamento, mídia, conteúdo e experiência premium.", items: ["Branding físico e digital", "Calendário editorial conjunto", "Agenda corporativa recorrente"] },
  owners: { eyebrow: "04 — Owners Club", title: "Ser cliente BYD passa a abrir portas.", copy: "Benefícios exclusivos transformam o cinema em extensão da experiência de propriedade.", items: ["Sessões e pré-estreias exclusivas", "Concierge e hospitality", "Vantagens no app AURUM"] },
};

const journeys: Record<Journey, { number: string; label: string; title: string; copy: string; points: string[] }> = {
  arrival: { number: "01", label: "Chegada", title: "O encontro começa antes do filme.", copy: "Fachada, acesso e desembarque constroem reconhecimento imediato da parceria.", points: ["Naming arquitetônico", "Wayfinding e luz", "Área de exposição"] },
  lobby: { number: "02", label: "Lobby", title: "O intervalo vira experiência.", copy: "O lobby funciona como galeria viva para produto, tecnologia e conteúdo.", points: ["BYD Lounge", "Product stage", "Conteúdo interativo"] },
  session: { number: "03", label: "Sessão", title: "A marca entra na narrativa.", copy: "Tela, som e ambientação criam presença sem interromper a experiência cinematográfica.", points: ["Abertura proprietária", "Conteúdo contextual", "Sessões especiais"] },
  after: { number: "04", label: "Depois", title: "A relação continua no digital.", copy: "App, CRM e conteúdo transformam cada visita em oportunidade de relacionamento.", points: ["Benefícios no app", "Conteúdo pós-sessão", "Convites e recorrência"] },
};

function OfficialLockup({ mode = "endorsed", compact = false }: { mode?: Lockup; compact?: boolean }) {
  return <div className={`official-lockup lockup-${mode} ${compact ? "is-compact" : ""}`} aria-label="AURUM Cinema by BYD">
    {mode === "signature" ? <img className="au-symbol" src="/brand/aurum-au.svg" alt="AURUM AU" /> : <img className="aurum-logo" src="/brand/aurum-logo.svg" alt="AURUM Cinema" />}
    <span className="brand-bridge">by</span>
    <img className="byd-logo" src="/brand/byd-logo.svg" alt="BYD" />
  </div>;
}

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add("revealed"); observer.disconnect(); } }, { threshold: .1 });
    observer.observe(el); return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

const SectionHead = ({ number, eyebrow, title, italic }: { number: string; eyebrow: string; title: string; italic?: string }) => <Reveal className="section-head">
  <p className="section-number">{number} / {eyebrow}</p><h2>{title}{italic && <><br/><em>{italic}</em></>}</h2>
</Reveal>;

export default function Home() {
  const [lockup, setLockup] = useState<Lockup>("endorsed");
  const [scenario, setScenario] = useState<Scenario>("launch");
  const [journey, setJourney] = useState<Journey>("arrival");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "ArrowDown" || e.key === "PageDown") window.scrollBy({ top: innerHeight * .82, behavior: "smooth" });
      if (e.key === "ArrowUp" || e.key === "PageUp") window.scrollBy({ top: -innerHeight * .82, behavior: "smooth" });
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, []);

  const menu = [["#visao","Visão"],["#marca","Marca"],["#experiencia","Experiência"],["#negocio","Negócio"],["#roadmap","Roadmap"]];

  return <main>
    <div className="grain" aria-hidden="true" />
    <header className="nav-shell"><a href="#top" className="nav-brand"><OfficialLockup compact /></a><nav aria-label="Navegação principal">{menu.map(([href,label]) => <a key={href} href={href}>{label}</a>)}</nav><button className={`menu-button ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}><span/><span/></button></header>
    <div className={`menu-overlay ${menuOpen ? "open" : ""}`}>{menu.map(([href,label],i) => <a key={href} href={href} style={{transitionDelay:`${100+i*70}ms`}} onClick={() => setMenuOpen(false)}>{label}</a>)}</div>

    <section className="hero" id="top"><div className="hero-image" aria-hidden="true"/><div className="hero-shade" aria-hidden="true"/><div className="red-orbit" aria-hidden="true"/><div className="hero-content"><p className="kicker">Apresentação confidencial · Visão de sociedade</p><h1><span>O futuro da</span><span>experiência</span><span className="gold">cinematográfica</span><span>começa aqui.</span></h1><p className="hero-copy">Uma aliança entre cultura, mobilidade e tecnologia para construir o cinema premium mais desejado da região.</p><a className="magnetic-cta" href="#visao"><span>Entrar na visão</span><i>↘</i></a></div><div className="hero-index"><span>01</span><i/><small>16</small></div><a href="#visao" className="scroll-cue" aria-label="Continuar"><i/><span>SCROLL</span></a></section>

    <section className="statement" id="visao"><Reveal><p className="section-number">01 / A tese</p><h2>Não é apenas naming.<br/><em>É um ativo cultural vivo.</em></h2><div className="statement-grid"><p>O AURUM entrega contexto, frequência, repertório e experiência. A BYD adiciona inovação, escala e uma visão de futuro reconhecível.</p><p>Juntas, as marcas criam um território proprietário onde entretenimento e mobilidade se encontram — com valor para público, parceiros e investidores.</p></div></Reveal></section>

    <section className="convergence"><SectionHead number="02" eyebrow="Por que faz sentido" title="Duas marcas que falam" italic="sobre o amanhã."/><div className="convergence-grid">{[["Cultura","O AURUM transforma lançamentos em histórias e encontros memoráveis."],["Tecnologia","A BYD materializa inovação em produtos que já apontam para o futuro."],["Experiência","Ambas competem pelo encantamento, não apenas pela função."],["Cidade","O Oscar Niemeyer oferece um endereço com força arquitetônica e simbólica."]].map(([title,copy],i) => <Reveal className={`convergence-card convergence-${i+1}`} key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div><div className="ticker" aria-label="Pilares da parceria"><div>AURUM × BYD · CULTURA × MOBILIDADE · CINEMA × TECNOLOGIA · EXPERIÊNCIA × FUTURO · </div></div></section>

    <section className="brand-lab" id="marca"><Reveal className="brand-lab-head"><div><p className="section-number">03 / Arquitetura de marca</p><h2>Logos oficiais.<br/><em>Uma nova assinatura.</em></h2></div><p>O sistema respeita integralmente os desenhos oficiais. O trabalho está na relação, proporção, hierarquia e contexto de aplicação.</p></Reveal><div className={`lockup-stage stage-${lockup}`}><div className="stage-meta"><span>CO-BRAND SYSTEM · LOGOS OFICIAIS</span><span>{lockup === "endorsed" ? "PROPOSTA RECOMENDADA" : "APLICAÇÃO COMPLEMENTAR"}</span></div><OfficialLockup mode={lockup}/><p>{lockups[lockup].note}</p><div className="lockup-tabs" role="tablist" aria-label="Opções de assinatura">{(Object.keys(lockups) as Lockup[]).map((key,i) => <button role="tab" aria-selected={lockup === key} className={lockup === key ? "active" : ""} onClick={() => setLockup(key)} key={key}><small>0{i+1}</small>{lockups[key].label}</button>)}</div></div><p className="concept-note">Estudo conceitual de co-branding. Aplicações finais sujeitas às aprovações formais de ambas as marcas.</p></section>

    <section className="palette-shift"><SectionHead number="04" eyebrow="Evolução cromática" title="O vinho sai de cena." italic="O vermelho BYD entra em movimento."/><div className="palette-story"><Reveal className="palette-before"><div className="palette-label"><span>ANTES</span><b>Identidade AURUM</b></div><img src="/brand/aurum-palette-original.png" alt="Paleta original AURUM com preto, dourados, creme, vinho e verde escuro"/><p>O vinho cumpria o papel de calor e dramaticidade.</p></Reveal><div className="palette-arrow" aria-hidden="true">→</div><Reveal className="palette-after"><div className="palette-label"><span>AGORA</span><b>AURUM by BYD</b></div><div className="new-palette"><i className="swatch graphite"/><i className="swatch gold-one"/><i className="swatch gold-two"/><i className="swatch ivory"/><i className="swatch byd-red"/><i className="swatch deep-teal"/></div><p>O vermelho BYD assume tensão, energia, movimento e ação.</p></Reveal></div><div className="color-rules"><Reveal><b>Dourado</b><span>Prestígio, permanência e assinatura AURUM.</span></Reveal><Reveal><b>Vermelho BYD</b><span>Movimento, tecnologia, CTA e momentos de impacto.</span></Reveal><Reveal><b>Preto + creme</b><span>O palco neutro que mantém a experiência premium.</span></Reveal><Reveal><b>Princípio</b><span>Vermelho pontual. Luxo primeiro, energia na medida certa.</span></Reveal></div></section>

    <section className="identity-system"><SectionHead number="05" eyebrow="Sistema vivo" title="Uma identidade preparada" italic="para ocupar espaços."/><div className="identity-grid"><Reveal className="identity-monogram"><img src="/brand/aurum-au.svg" alt="Eneagrama oficial AU"/><span>AU</span><p>O eneagrama vira selo de pertencimento para detalhes arquitetônicos, interface e hospitalidade.</p></Reveal><div className="identity-list">{[["01","Motion","A linha vermelha funciona como assinatura cinética entre capítulos e telas."],["02","Editorial","Cormorant sustenta sofisticação; a linguagem técnica organiza dados e argumentos."],["03","Digital","App, site, ingressos e CRM recebem um sistema conjunto — sem perder clareza."],["04","Physical","Fachada, lobby, sala, uniformes e materiais constroem a mesma percepção."]].map(([n,title,copy]) => <Reveal className="identity-row" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><i>↗</i></Reveal>)}</div></div></section>

    <section className="experience" id="experiencia"><SectionHead number="06" eyebrow="O cinema transformado" title="Da fachada à última cena," italic="uma presença integrada."/><div className="spatial-grid"><Reveal className="space-card space-card-large facade"><div className="space-label"><small>01</small><h3>Chegada</h3><p>Uma assinatura arquitetônica que transforma entrada e fachada em ícone.</p></div></Reveal><Reveal className="space-card lobby"><div className="space-label"><small>02</small><h3>Galeria</h3><p>Lobby como palco de produto, encontros e lançamentos.</p></div></Reveal><Reveal className="space-card auditorium"><div className="space-label"><small>03</small><h3>Imersão</h3><p>Sala e tela conectadas à narrativa da parceria.</p></div></Reveal></div><p className="concept-note light-note">Visualizações conceituais; não representam projeto arquitetônico executivo.</p></section>

    <section className="journey"><SectionHead number="07" eyebrow="Jornada completa" title="Cada momento pode" italic="construir valor."/><div className="journey-shell"><div className="journey-tabs" role="tablist" aria-label="Etapas da jornada">{(Object.keys(journeys) as Journey[]).map(key => <button role="tab" aria-selected={journey === key} className={journey === key ? "active" : ""} onClick={() => setJourney(key)} key={key}><small>{journeys[key].number}</small><span>{journeys[key].label}</span></button>)}</div><div className={`journey-visual journey-${journey}`}><div className="journey-copy" key={journey}><p>{journeys[journey].number} / {journeys[journey].label}</p><h3>{journeys[journey].title}</h3><span>{journeys[journey].copy}</span><ul>{journeys[journey].points.map(point => <li key={point}>↗ {point}</li>)}</ul></div></div></div></section>

    <section className="activation"><div className="activation-media"><div className={`scenario-visual visual-${scenario}`}><span>{scenarios[scenario].eyebrow}</span></div></div><div className="activation-content"><p className="section-number">08 / Plataforma de ativação</p><div className="scenario-tabs" role="tablist">{(Object.keys(scenarios) as Scenario[]).map(key => <button key={key} role="tab" aria-selected={scenario === key} className={scenario === key ? "active" : ""} onClick={() => setScenario(key)}>{scenarios[key].eyebrow.split(" — ")[1]}</button>)}</div><div className="scenario-copy" key={scenario}><h2>{scenarios[scenario].title}</h2><p>{scenarios[scenario].copy}</p><ul>{scenarios[scenario].items.map(item => <li key={item}><i>↗</i>{item}</li>)}</ul></div></div></section>

    <section className="media-ecosystem"><SectionHead number="09" eyebrow="Ecossistema de mídia" title="Uma marca presente" italic="antes, durante e depois."/><div className="media-orbit"><div className="orbit-center"><img src="/brand/aurum-au.svg" alt="AU"/><span>EXPERIÊNCIA</span></div>{[["01","Fachada"],["02","Lobby"],["03","Tela"],["04","App"],["05","Social"],["06","CRM"]].map(([n,label],i) => <Reveal className={`orbit-item orbit-${i+1}`} key={n}><small>{n}</small><b>{label}</b></Reveal>)}</div><div className="media-copy-grid"><p>Não é uma campanha isolada. É um inventário proprietário conectado por linguagem, dados e calendário.</p><p>A mesma narrativa acompanha o público da descoberta ao retorno — ampliando frequência e valor de cada contato.</p></div></section>

    <section className="audience"><SectionHead number="10" eyebrow="Comunidades" title="Múltiplos públicos." italic="Uma plataforma de relacionamento."/><div className="audience-grid">{[["Cinéfilos","Estreias, curadoria, pré-vendas e experiências especiais."],["Clientes BYD","Benefícios, sessões exclusivas e hospitality de marca."],["Empresas","Lançamentos, convenções, treinamentos e relacionamento B2B."],["Imprensa & creators","Conteúdo, premieres, acesso e amplificação."],["Famílias & escolas","Programação, projetos educativos e conexão comunitária."],["Cidade","Agenda cultural capaz de movimentar Goiânia e o entorno."]].map(([title,copy],i) => <Reveal className="audience-card" key={title}><span>0{i+1}</span><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></section>

    <section className="hospitality"><div className="hospitality-image"/><Reveal className="hospitality-copy"><p className="section-number">11 / B2B & hospitality</p><h2>Um cinema que também funciona como <em>casa de marca.</em></h2><p>O AURUM by BYD pode receber lançamentos, encontros de concessionários, imprensa, clientes estratégicos, treinamentos e celebrações.</p><ul><li>Auditório com narrativa imersiva</li><li>Lobby como product stage</li><li>Hospitalidade e bomboniere premium</li><li>Conteúdo e captação social</li><li>Experiência integrada ao Oscar Niemeyer</li></ul></Reveal></section>

    <section className="value" id="negocio"><SectionHead number="12" eyebrow="Motores de valor" title="O ativo cresce por" italic="mais de uma avenida."/><div className="value-grid value-grid-six">{[["01","Bilheteria & frequência","A experiência melhora preferência, retorno e percepção de valor."],["02","Naming & mídia","Presença proprietária transforma espaço físico em plataforma permanente."],["03","Eventos","Agenda B2B gera novas ocasiões de uso e relacionamento."],["04","Conteúdo","Estreias, bastidores e ativações alimentam um motor editorial contínuo."],["05","Benefícios","Programas para clientes fortalecem lealdade e aquisição cruzada."],["06","Expansão","O modelo cria uma tese replicável para futuras unidades e formatos."]].map(([n,title,copy]) => <Reveal className="value-card" key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><i>↗</i></Reveal>)}</div></section>

    <section className="deal"><SectionHead number="13" eyebrow="Estrutura da parceria" title="Sociedade, marca e operação" italic="trabalhando juntas."/><div className="deal-columns"><Reveal className="deal-card deal-primary"><span>CAMADA 01</span><h3>Participação societária</h3><p>Alinhamento de longo prazo, governança, metas e criação de valor do ativo.</p></Reveal><Reveal className="deal-card"><span>CAMADA 02</span><h3>Naming rights</h3><p>Direitos de marca, território, exclusividade e regras de aplicação.</p></Reveal><Reveal className="deal-card"><span>CAMADA 03</span><h3>Fundo de ativação</h3><p>Calendário anual de experiências, mídia, conteúdo e lançamentos.</p></Reveal><Reveal className="deal-card"><span>CAMADA 04</span><h3>Tecnologia & benefícios</h3><p>Integração de jornadas, vantagens, dados consentidos e relacionamento.</p></Reveal></div><p className="deal-disclaimer">Estrutura conceitual para discussão. Percentual, valuation, aporte, prazo, exclusividade e responsabilidades entram na etapa financeira e jurídica.</p></section>

    <section className="roadmap" id="roadmap"><SectionHead number="14" eyebrow="Roadmap" title="Uma transformação em" italic="quatro movimentos."/><div className="roadmap-line">{[["01","Alinhar","Estratégia, escopo societário, direitos e governança."],["02","Desenhar","Brand system, arquitetura, mídia e experiência digital."],["03","Lançar","Evento fundador, campanha, imprensa e primeira agenda."],["04","Escalar","Calendário always on, métricas e expansão do modelo."]].map(([n,title,copy]) => <Reveal className="roadmap-step" key={n}><span>{n}</span><i/><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></section>

    <section className="governance"><SectionHead number="15" eyebrow="Governança da marca" title="Grande impacto exige" italic="clareza de decisão."/><div className="governance-grid"><Reveal className="governance-main"><img src="/brand/aurum-logo.svg" alt="AURUM Cinema"/><i/><img src="/brand/byd-logo.svg" alt="BYD"/></Reveal><div className="governance-list">{[["Brand council","Aprovação conjunta de identidade, campanhas e aplicações permanentes."],["Experience calendar","Planejamento trimestral de estreias, eventos e oportunidades BYD."],["Performance review","KPIs de audiência, mídia, conteúdo, relacionamento e eventos."],["Protection","Regras de uso, exclusividade, território e integridade das marcas."]].map(([title,copy]) => <Reveal key={title}><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></div></section>

    <section className="proof"><div className="proof-word">AURUM</div><Reveal><p className="section-number">16 / Por que agora</p><blockquote>“O futuro não precisa de mais uma tela.<br/>Precisa de um lugar onde possa ser vivido.”</blockquote><div className="proof-facts"><div><strong>Oscar Niemeyer</strong><span>Endereço cultural e arquitetura que inspira.</span></div><div><strong>Experiência premium</strong><span>Conforto, tecnologia e curadoria em um só destino.</span></div><div><strong>Plataforma recorrente</strong><span>Uma marca ativa todos os dias, não apenas em campanhas.</span></div></div></Reveal></section>

    <footer><img className="footer-au" src="/brand/aurum-au.svg" alt="AU"/><p className="section-number">Próximo capítulo</p><h2>Vamos construir o cinema<br/>do <em>futuro.</em></h2><a className="magnetic-cta light-cta" href="mailto:contato@aurumcinema.com.br"><span>Iniciar a conversa</span><i>↗</i></a><div className="footer-row"><OfficialLockup compact/><span>Centro Cultural Oscar Niemeyer · Goiânia, GO</span><span>Apresentação confidencial · 2026</span></div></footer>
  </main>;
}
