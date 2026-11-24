'use client';
import {useState,useEffect} from 'react';
import {Progress} from '@/components/ui/progress';
import * as I from 'lucide-react';
import {SidebarProvider,Sidebar,SidebarContent,SidebarMenu,SidebarMenuItem,SidebarMenuButton,useSidebar} from '@/components/ui/sidebar';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {PortfolioProvider,usePortfolio,imageUrl} from './portfolio-context';
const pages=['Home','Education','Courses & Workshops','Skills','Work Experience','Research Projects','Gallery','Contact','Admin'];
const navIcons=[I.House,I.GraduationCap,I.BookOpen,I.Settings,I.BriefcaseBusiness,I.Leaf,I.Image,I.Mail,I.LockKeyhole];
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z]+/g,'-');
function FacebookIcon(props:React.SVGProps<SVGSVGElement>){return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z"/></svg>}
function Contours(){return <svg className="contours" viewBox="0 0 800 350" preserveAspectRatio="none" aria-hidden="true">{Array.from({length:20},(_,i)=><path key={i} d={'M-90 '+(40+i*13)+' C100 '+(-30+i*9)+',100 '+(320+i*8)+',290 '+(175+i*11)+' S400 '+(-80+i*15)+',550 '+(70+i*12)+' S700 '+(330+i*8)+',880 '+(100+i*12)}/>)}</svg>}
function Tags({items}:{items:string[]}){return <div className="tags">{items.map(t=><span key={t}>{t}</span>)}</div>}
function Cv(){
 const {personal:p}=usePortfolio();
 async function downloadCv(e:React.MouseEvent<HTMLAnchorElement>){
  if(!p.cvUrl||p.cvUrl.startsWith('data:'))return;
  e.preventDefault();
  try{
   const r=await fetch(p.cvUrl,{cache:'no-store'});
   if(!r.ok)throw Error('CV download failed');
   const blob=await r.blob();
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');
   a.href=url;
   a.download=decodeURIComponent(p.cvUrl.split('/').pop()||'Md-Khalid-Hasan-CV.pdf');
   document.body.appendChild(a);
   a.click();
   a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch{
   window.open(p.cvUrl,'_blank','noopener,noreferrer');
  }
 }
 return p.cvUrl?<a className="cv" href={p.cvUrl} download="Md-Khalid-Hasan-CV.pdf" onClick={downloadCv}><I.Download/>Download CV</a>:<button className="cv" disabled title="CV file has not been provided"><I.Download/>Download CV<small>Not added yet</small></button>
}
function SideNav({active,navigate}:{active:string,navigate:(s:string)=>void}){const {setOpenMobile,isMobile}=useSidebar();const {personal:p}=usePortfolio();return <Sidebar className="portfolio-sidebar"><SidebarContent><div className="sidebar-body">{isMobile&&<button className="nav-close" aria-label="Close navigation" onClick={()=>setOpenMobile(false)}><I.X/></button>}<div className="brand">{p.profileImage?<img className="profile-photo" src={imageUrl(p.profileImage)} alt={p.name}/>:<img src="/images/logo.webp" alt="KH monogram"/>}<h2>{p.name}</h2><p>Geospatial Portfolio</p><div className="brand-motto">MAPS FOR A BRIGHTER<br/>TOMORROW</div></div><nav aria-label="Main navigation"><SidebarMenu>{pages.map((name,i)=>{const Icon=navIcons[i];return <SidebarMenuItem key={name}><SidebarMenuButton className="nav-button" isActive={active===name} aria-current={active===name?'page':undefined} onClick={()=>{navigate(name);setOpenMobile(false)}}><Icon/><span>{name}</span>{active===name&&<I.ChevronRight className="nav-chevron"/>}</SidebarMenuButton></SidebarMenuItem>})}</SidebarMenu></nav><div className="sidebar-bottom"><Cv/><div className="location"><I.MapPin/>{p.location}</div><img className="skyline" src="/images/skyline.webp" alt=""/><small>PEOPLE | PLACES | A SUSTAINABLE TOMORROW</small></div></div></SidebarContent></Sidebar>}
function MobileNav(){const {personal:p}=usePortfolio();const {toggleSidebar}=useSidebar();return <div className="mobile-header"><b>{p.profileImage?<img className="mobile-portrait" src={imageUrl(p.profileImage)} alt=""/>:"KH"} <span>{p.name}</span></b><button aria-label="Open navigation" onClick={toggleSidebar}><I.Menu/></button></div>}
function Hero({navigate}:{navigate:(s:string)=>void}){const {personal:p}=usePortfolio();return <section className="hero"><Contours/><img className="hero-art" src={imageUrl(p.heroImage)} alt="Mountain terrain, turquoise river and satellite mapping illustration"/><div className="hero-copy"><div className="eyebrow">GEOSPATIAL PORTFOLIO<span/></div><h1><span className="hero-name">{p.heroFirst}</span><br/><em>{p.heroLast}</em></h1><h2>{p.role}</h2><div className="accent"/><p>{p.intro}</p><div className="hero-actions"><button className="primary" onClick={()=>navigate(p.primaryTarget||'Research Projects')}><I.Compass/>{p.primaryLabel||'Explore My Work'}<I.ChevronRight/></button><button className="cv" onClick={()=>navigate(p.secondaryTarget||'Courses & Workshops')}><I.BookOpen/>{p.secondaryLabel||'Courses'}</button></div></div></section>}
function HomePage({navigate}:{navigate:(s:string)=>void}){const {personal:p}=usePortfolio();const services=[[p.expertise1,p.expertise1Text,I.MapPin],[p.expertise2,p.expertise2Text,I.Drone],[p.expertise3,p.expertise3Text,I.CodeXml]] as const;return <><Hero navigate={navigate}/><section className="employment"><Contours/><I.Layers/><strong>Currently at <b>{p.company}</b></strong><i/><I.CalendarDays/><span>Since {p.since}</span></section><div className="home-services">{services.map(([title,text,Icon],i)=><button className={'home-service service-'+i} key={title} onClick={()=>navigate('Skills')}><Contours/>{i===1&&<img className="service-art" src={'/images/'+(i===1?'home-wireframe':'home-earth')+'.webp'} alt=""/>}<span className="round-icon">{i===2?<Icon/>:<img src={'/images/home-icon-'+i+'.webp'} alt=""/>}</span><span><strong>{title}</strong><p>{text}</p></span><I.ChevronRight className="arrow"/></button>)}</div>{p.about&&<section className="home-about" aria-labelledby="about-heading"><div className="about-heading"><div className="eyebrow">BEHIND THE MAPS<span/></div><h2 id="about-heading">About <em>Me</em></h2><div className="accent"/></div><div className="about-copy">{p.about.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></section>}<footer className="home-footer"><span/>MAP · ANALYZE · COMMUNICATE<span/></footer></>}

function Heading({eyebrow,title,subtitle,editorial=false}:{eyebrow:string,title:React.ReactNode,subtitle:string,editorial?:boolean}){return <header className={'page-heading '+(editorial?'editorial':'')}><div className="eyebrow">{eyebrow}<span/></div><h1>{title}</h1><p>{subtitle}</p>{!editorial&&<><img className="mountains" src="/images/mountains.webp" alt=""/><div className="corner-note">Geospatial Insights<br/>for a Better Tomorrow</div></>}</header>}
function FocusPanel({researchMode=false}:{researchMode?:boolean}){const {personal:p}=usePortfolio();const rows=researchMode?[['River & Flood Risk','Transboundary rivers and flood assessment',I.Waves],['GeoAI & Land Cover','Automated mapping from satellite imagery',I.Satellite],['Urban Environment','Heat, green space and urban change',I.Sprout]] as const:(p.academicFocus||[]).map(title=>[title,'',I.BookOpen] as const);return <section className="focus-panel"><div className="eyebrow">{researchMode?'RESEARCH INTERESTS':'ACADEMIC FOCUS'}<span/></div><h2>{researchMode?'Research Interests':'Academic Focus'}</h2><div className="focus-items">{rows.map(([title,text,Icon])=><article key={title}><span className="round-icon"><Icon/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>}
function Education(){const {personal:p,education}=usePortfolio();return <><Heading eyebrow="MY ACADEMIC JOURNEY" title={<>Educa<em>tion</em></>} subtitle={p.educationSubtitle}/><div className="education-timeline">{education.map((e,i)=><article className={'education-card '+(e.cgpa?'bachelor':'')} key={i}><span className="timeline-icon round-icon"><I.GraduationCap/></span>{e.image&&<img src={imageUrl(e.image)} alt={e.college+' illustration'}/>}<div className="education-copy"><h2>{e.title}</h2>{e.subject&&<p className="degree-subject">{e.subject}</p>}<h3>{e.college}</h3><p>{e.affiliation&&<>{e.affiliation}<br/></>}Session: {e.session}</p>{e.status&&<span className={'status '+(e.status==='Completed'?'completed':'ongoing')}>● {e.status}</span>}{e.cgpa&&<div className="cgpa"><span>CGPA</span><strong>{e.cgpa}</strong></div>}<p className="education-note">{e.note}</p>{e.academicFocus&&<section className="education-extra"><h3>Academic Focus</h3><p>{e.academicFocus}</p></section>}{!!e.coursework?.length&&<section className="education-extra"><h3>Related Coursework</h3><Tags items={e.coursework}/></section>}</div></article>)}</div><FocusPanel/></>}
function SimpleFooter(){const {personal:p}=usePortfolio();return <footer className="simple-footer">{p.name} · Geospatial Portfolio</footer>}
function Courses(){
  const {personal:p,courses}=usePortfolio();
  const [selected,setSelected]=useState<any>(null);

  return (
    <>
      <section className="courses-heading-wrap">
        <Heading
          eyebrow="LEARNING & PROFESSIONAL DEVELOPMENT"
          title={<>Courses & <em>Workshops</em></>}
          subtitle={p.coursesSubtitle}
          editorial
        />
        <img className="courses-heading-art" src="/images/mountains.webp" alt=""/>
        <div className="courses-corner-note" aria-hidden="true">
          <span>LEARN</span>
          <span>APPLY</span>
          <span>EXPLORE</span>
          <span>GROW</span>
          <i/>
        </div>
      </section>

      <div className="course-uniform-grid">
        {courses.map((c,i)=>(
          <article className="course-uniform-card" key={i}>
            <div className="course-uniform-copy">
              <div className="eyebrow course-uniform-category">
                {c.eyebrow}
                <span/>
              </div>

              <h2>{c.title}</h2>

              {c.provider && (
                <p className="course-provider">
                  <I.Landmark />
                  {c.provider}
                </p>
              )}

              <div className="course-uniform-meta">
                {c.date && (
                  <p className="icon-line">
                    <I.CalendarDays />
                    {c.date}
                  </p>
                )}
              </div>

              {c.text&&(
                <p className="training-text">
                  {c.text}
                </p>
              )}

              {!!c.tags?.length&&<Tags items={c.tags}/>}
            </div>

            <button
              className="course-certificate"
              type="button"
              onClick={()=>c.image&&setSelected(c)}
              aria-label={c.image?`View ${c.title} certificate`:`${c.title} certificate not available`}
              disabled={!c.image}
            >
              {c.image?(
                <img
                  src={imageUrl(c.image)}
                  alt={`${c.title} certificate`}
                />
              ):(
                <div className="certificate-placeholder">
                  <I.Award/>
                  <span>Certificate</span>
                </div>
              )}
            </button>
          </article>
        ))}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open)=>!open&&setSelected(null)}
      >
        <DialogContent className="portfolio-dialog course-dialog">
          {selected&&(
            <>
              <DialogTitle>{selected.title}</DialogTitle>
              <DialogDescription>{selected.eyebrow}</DialogDescription>
              {selected.image&&(
                <img
                  src={imageUrl(selected.image)}
                  alt={`${selected.title} certificate`}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <SimpleFooter/>
    </>
  );
}

function SkillCard({skill:s,index,soft=false}:{skill:{title:string;text:string;image:string;icon:string;percentage:string};index:number;soft?:boolean}){
const icons:Record<string,I.LucideIcon>={CodeXml:I.CodeXml,Files:I.Files,ChartNoAxesColumnIncreasing:I.ChartNoAxesColumnIncreasing,PenTool:I.PenTool,Footprints:I.Footprints,FilePenLine:I.FilePenLine,Globe:I.Globe,Mountain:I.Mountain,Satellite:I.Satellite,MessagesSquare:I.MessagesSquare,Puzzle:I.Puzzle,Gauge:I.Gauge,Waypoints:I.Waypoints,Users:I.Users,Clock3:I.Clock3};const Icon=icons[s.icon]||(soft?I.Users:I.Globe);const level=Math.min(100,Math.max(0,Number(s.percentage)||0));
return <article className={'skill-card rated-skill '+(soft?'soft-skill':'')}><span className="skill-number">{String(index+1).padStart(2,'0')}</span><span className="round-icon">{s.image?<img src={imageUrl(s.image)} alt=""/>:<Icon/>}</span><div className="skill-content"><h3>{s.title}</h3><p>{s.text}</p><div className="skill-rating"><div className="skill-rating-label"><span>Proficiency</span><strong>{level}%</strong></div><Progress className="skill-progress" value={level} aria-label={s.title+' proficiency'}/></div></div></article>
}

function SkillsPage(){
  const {personal:p,skills,softSkills}=usePortfolio();

  return (
    <>
      <Heading
        eyebrow="MY TOOLKIT"
        title={
          <>
            Professional <em>Skills</em>
          </>
        }
        subtitle={p.skillsSubtitle}
      />

      <div className="skills-grid">
        {skills.map((s,i)=>
          <SkillCard
            skill={s}
            index={i}
            key={i}
          />
        )}
      </div>

      <section
        className="soft-skills-section"
        aria-labelledby="soft-skills-heading"
      >
        <h2 id="soft-skills-heading">
          Soft Skills
        </h2>

        <div className="accent"/>

        <div className="skills-grid soft-skills-grid">
          {softSkills.map((s,i)=>
            <SkillCard
              skill={s}
              index={i}
              soft
              key={i}
            />
          )}
        </div>
      </section>
    </>
  );
}


function WorkPage() {
  const { personal: p, experience } = usePortfolio();

  const companyLinks: Record<string, string> = {
    'The Decode Ltd.': 'https://www.decodemap.com/',

    'Center for Environmental and Geographic Information Services (CEGIS)':
      'https://web.cegisbd.com/',

    'Geomatics and Geoinformatics Solutions Ltd. (GMGI)':
      'https://gmgisolutionsltd.com/',

    'Geo Planning for Advanced Development (GPAD)':
      'https://gpad.com.bd/',
  };

  return (
    <>
      <section className="work-main">
        <Contours />

        <Heading
          eyebrow="PROFESSIONAL JOURNEY"
          title={
            <>
              Work <em>Experience</em>
            </>
          }
          subtitle={p.workSubtitle}
          editorial
        />

        <div className="work-timeline">
          {experience.map((e, i) => {
            const companyUrl = companyLinks[e.company];

            return (
              <article
                key={e.title}
                className={'work-entry ' + (i === 0 ? 'current' : '')}
              >
                <div className="work-date">{e.date}</div>

                <div className="work-card">
                  <div className="work-copy">

                    {i === 0 && (
                      <div className="eyebrow">
                        CURRENT ROLE
                      </div>
                    )}

                    {/* COMPANY NAME FIRST */}
                    <h3>
                      {companyUrl ? (
                        <a
                          className="company-link"
                          href={companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Visit ${e.company} website`}
                        >
                          {e.company}
                          <I.ExternalLink className="company-link-icon" />
                        </a>
                      ) : (
                        e.company
                      )}
                    </h3>

                    {/* DESIGNATION SECOND */}
                    <h2>{e.title}</h2>

                    {/* DESCRIPTION */}
                    <p>{e.text}</p>

                    {/* SKILL TAGS */}
                    <Tags items={e.tags} />
                  </div>

                  {/* IMAGE */}
                  {e.image && (
                    <img
                      src={imageUrl(e.image)}
                      alt={e.imageCaption || e.title}
                    />
                  )}

                  {/* HIDDEN THROUGH CSS */}
                  <div className="work-image-caption">
                    {e.imageCaption}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="work-footer">
          <span>
            {p.location} · GIS · Photogrammetry
          </span>

          <span>
            © 2026 {p.name}
          </span>
        </footer>
      </section>
    </>
  );
}

function ResearchPage(){
  const {personal:p,research}=usePortfolio();

  const [filter,setFilter]=useState('All Work');
  const [selected,setSelected]=useState<typeof research[number]|null>(null);

  return (
    <>
      <Heading
        eyebrow="EXPLORING THROUGH RESEARCH"
        title={
          <>
            Research <em>Projects</em>
          </>
        }
        subtitle={p.researchSubtitle}
      />

      <div
        className="filter-row"
        role="group"
        aria-label="Filter research"
      >
        {[
          'All Work',
          ...new Set(
            research
              .flatMap(r=>r.categories)
              .filter(
                c =>
                  c !== 'All Work' &&
                  c !== 'Research Interests'
              )
          ),
          'Research Interests'
        ].map(f=>
          <button
            aria-pressed={filter===f}
            className={filter===f?'selected':''}
            onClick={()=>setFilter(f)}
            key={f}
          >
            {f}
          </button>
        )}
      </div>

      {filter!=='Research Interests' && (
        <div className="research-grid">
          {research
            .filter(
              r =>
                filter==='All Work' ||
                r.categories.includes(filter)
            )
            .map(r=>
              <article
                className="research-card"
                key={r.title}
              >
                <div className="research-image">
                  <img
                    src={imageUrl(r.image)}
                    alt={r.title}
                  />

                  {r.caption && (
                    <span>{r.caption}</span>
                  )}
                </div>

                <div className="research-copy">
                  <h2>{r.title}</h2>

                  <p>{r.description}</p>

                  <Tags items={r.tags}/>

                  <button
                    className="text-link"
                    onClick={()=>setSelected(r)}
                  >
                    Project overview
                    <I.ArrowRight/>
                  </button>

                  <Contours/>
                </div>
              </article>
            )}
        </div>
      )}

      <FocusPanel researchMode/>

      <Dialog
        open={!!selected}
        onOpenChange={v=>!v&&setSelected(null)}
      >
        <DialogContent className="portfolio-dialog">

          <DialogTitle>
            {selected?.title}
          </DialogTitle>

          <DialogDescription>
            {selected?.description}
          </DialogDescription>

          {selected && (
            <>
              <img
                src={imageUrl(selected.image)}
                alt="Illustrative project preview"
              />

              <Tags items={selected.tags}/>

              <p>{selected.details}</p>

              {[
                ['Objective',selected.objective],
                ['Data used',selected.dataUsed],
                ['Tools and technologies',selected.toolsUsed],
                ['Methodology',selected.methodology],
                ['Result / output',selected.result]
              ]
                .filter(([,value])=>value)
                .map(([label,value])=>
                  <section
                    className="project-detail"
                    key={label}
                  >
                    <h3>{label}</h3>
                    <p>{value}</p>
                  </section>
                )
              }

              {!!selected.skills?.length && (
                <section className="project-detail">
                  <h3>Relevant skills</h3>
                  <Tags items={selected.skills}/>
                </section>
              )}

              {selected.githubUrl && (
                <a
                  className="text-link"
                  href={selected.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <I.CodeXml/>
                  GitHub repository
                </a>
              )}

              {selected.link && (
                <a
                  className="text-link"
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit project
                  <I.ExternalLink/>
                </a>
              )}
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}


function GalleryPage(){
  const {personal:p,gallery}=usePortfolio();

  const [filter,setFilter]=useState('All');
  const [selected,setSelected]=useState<typeof gallery[number]|null>(null);

  return (
    <>
      <Heading
        eyebrow="VISUAL JOURNAL"
        title="Gallery"
        subtitle={p.gallerySubtitle}
        editorial
      />

      <p className="gallery-intro">
        {gallery.every(g=>g.caption==='Sample image')
          ? 'Concept preview · Sample images'
          : 'Field notes and project imagery'}
      </p>

      <div
        className="filter-row"
        role="group"
        aria-label="Filter gallery"
      >
        {[
          'All',
          ...new Set(
            gallery
              .map(g=>g.category)
              .filter(Boolean)
          )
        ].map(f=>
          <button
            key={f}
            aria-pressed={filter===f}
            className={filter===f?'selected':''}
            onClick={()=>setFilter(f)}
          >
            {f}
          </button>
        )}
      </div>

      <div
        className={
          'gallery-grid ' +
          (filter!=='All'?'filtered':'')
        }
      >
        {gallery
          .filter(
            g =>
              filter==='All' ||
              g.category===filter
          )
          .map(g=>
            <button
              className="gallery-card"
              key={g.title}
              onClick={()=>setSelected(g)}
            >
              <img
                src={imageUrl(g.image)}
                alt={g.title}
              />

              <span className="gallery-caption">
                <span>
                  <strong>{g.title}</strong>
                  <small>{g.caption}</small>
                </span>

                <span className="tag">
                  {g.category}
                </span>
              </span>
            </button>
          )}
      </div>

      <SimpleFooter/>

      <Dialog
        open={!!selected}
        onOpenChange={v=>!v&&setSelected(null)}
      >
        <DialogContent className="portfolio-dialog">

          <DialogTitle>
            {selected?.title}
          </DialogTitle>

          <DialogDescription>
            {selected?.caption} · {selected?.category}
          </DialogDescription>

          {selected && (
            <img
              src={imageUrl(selected.image)}
              alt={selected.title}
            />
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}

function Contact(){
  const {personal:p}=usePortfolio();

  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [failed,setFailed]=useState(false);

  async function submit(
    e:React.FormEvent<HTMLFormElement>
  ){
    e.preventDefault();

    setMessage('');
    setFailed(false);

    if(
      document.documentElement.dataset.offline === 'true'
    ){
      setFailed(true);

      setMessage(
        'This offline viewing copy cannot send messages. Use the email link or the running website.'
      );

      return;
    }

    setBusy(true);

    const form=e.currentTarget;

    try{
      const data=Object.fromEntries(
        new FormData(form)
      );

      const r=await fetch(
        '/api/contact',
        {
          method:'POST',

          headers:{
            'Content-Type':'application/json'
          },

          body:JSON.stringify(data)
        }
      );

      const result:any=await r.json();

      if(!r.ok){
        throw Error(
          result.error ||
          'Unable to send your message.'
        );
      }

      setMessage(result.message);

      form.reset();

    }catch(e){

      setFailed(true);

      setMessage(
        e instanceof Error
          ? e.message
          : 'Unable to send your message. Please try again.'
      );

    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Heading
        eyebrow="GET IN TOUCH"
        title="Contact"
        subtitle={p.contactSubtitle}
      />

      <div className="contact-grid">

        <section className="contact-details">

          <h2>Contact details</h2>

          <div className="accent"/>

          {[
            ['Email',p.email,I.Mail],
            ['Phone',p.phone,I.Phone],
            ['LinkedIn',p.linkedin,I.Link],
            ['Facebook',p.facebook,FacebookIcon],
            ['GitHub',p.github,I.CodeXml]
          ].map(
            ([label,value,Icon])=>{
              const Symbol=Icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;

              const inner=(
                <>
                  <span className="round-icon">

                    {label==='Email'||label==='Phone'||label==='Facebook'
                      ? <Symbol/>
                      : (
                        <img
                          src={
                            '/images/contact-' +
                            String(label).toLowerCase() +
                            '.webp'
                          }
                          alt=""
                        />
                      )
                    }

                  </span>

                  <span>
                    <strong>
                      {label as string}
                    </strong>

                    <small>
                      {(value as string) ||
                        'Not added yet'}
                    </small>
                  </span>

                  <I.ChevronRight/>
                </>
              );

              return value ? (

                <a
                  className={
                    'contact-link '+label
                  }
                  href={
                    label==='Email'
                      ? 'mailto:'+value
                      : label==='Phone'
                        ? 'tel:'+String(value).replace(/[^+\d]/g,'')
                        : value as string
                  }
                  key={label as string}
                  target={
                    label==='Email'||label==='Phone'
                      ? undefined
                      : '_blank'
                  }
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>

              ) : (

                <div
                  className={
                    'contact-link '+label
                  }
                  key={label as string}
                >
                  {inner}
                </div>

              );
            }
          )}

          <div className="contact-map">

            <img
              src="/images/dhaka-map.webp"
              alt="Illustrative map of Dhaka"
            />

            <div>
              <h3>
                <I.MapPin/>
                {p.location}
              </h3>

              <p>
                Open to research collaboration
              </p>
            </div>

          </div>

        </section>


        <section className="contact-form">

          <h2>Send a message</h2>

          <div className="accent"/>

          <p>
            Have a project or question in mind?
          </p>

          <form onSubmit={submit}>

            <div className="form-row">

              <label>
                Your name

                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Enter your name"
                />
              </label>

              <label>
                Email address

                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </label>

            </div>

            <label>
              Subject

              <input
                name="subject"
                required
                placeholder="What would you like to discuss?"
              />
            </label>

            <label>
              Message

              <textarea
                name="message"
                required
                rows={5}
                placeholder="Write your message here..."
              />
            </label>

            <button
              className="primary"
              type="submit"
              disabled={busy}
            >
              <I.Send/>

              {busy
                ? 'Sending…'
                : 'Send Message'}
            </button>

            <p className="form-note">
              Your message is saved for the portfolio owner.
              Email notification depends on service availability.
            </p>

            {message && (
              <p
                className="form-status"
                role={failed?'alert':'status'}
              >
                {message}
              </p>
            )}

          </form>

        </section>

      </div>

      <SimpleFooter/>
    </>
  );
}


function PortfolioSite(){const [active,setActive]=useState('Home');useEffect(()=>{const sync=()=>{const aliases:Record<string,string>={'research-works':'research-projects','work-experiences':'work-experience','courses-workshop':'courses-workshops'};const hash=location.hash.slice(1);const found=pages.find(x=>slug(x)===(aliases[hash]||hash));setActive(found||'Home')};sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);function navigate(s:string){if(s==='Admin'){if(document.documentElement.dataset.offline==='true'){alert('Admin login requires the running portfolio server. Open the project with npm run dev.');return}location.assign('/admin');return}setActive(s);history.pushState(null,'','#'+slug(s));window.scrollTo({top:0,behavior:'instant'})}return <SidebarProvider style={{'--sidebar-width':active==='Home'?'297px':'324px'} as React.CSSProperties} className={'portfolio mode-'+slug(active)}><a className="skip" href="#main">Skip to content</a><SideNav active={active} navigate={navigate}/><div className="site-body"><MobileNav/><main id="main">{active==='Home'?<HomePage navigate={navigate}/>:<>{active==='Education'&&<Education/>}{active==='Courses & Workshops'&&<Courses/>}{active==='Skills'&&<SkillsPage/>}{active==='Work Experience'&&<WorkPage/>} {active==='Research Projects'&&<ResearchPage/>}{active==='Gallery'&&<GalleryPage/>}{active==='Contact'&&<Contact/>}</>}</main><AdminEntry/></div></SidebarProvider>}
function AdminEntry(){const [local,setLocal]=useState(false);useEffect(()=>setLocal(['localhost','127.0.0.1','[::1]'].includes(location.hostname)),[]);return local?<a className="admin-entry" href="/admin"><I.Settings size={15}/>Manage website</a>:null}
export default function App(){return <PortfolioProvider><PortfolioSite/></PortfolioProvider>}