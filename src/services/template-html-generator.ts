/**
 * Template HTML Generator
 * Generates HTML for templates — 8 distinct layout types
 */

import { ParsedResumeData } from '../types';
import { getTemplateById } from './template-registry';
import puppeteer from 'puppeteer';

interface Palette {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  bg: string;
  light: string;
}

const PALETTES: Record<string, Palette> = {
  navy:      { primary: '#1e3a8a', secondary: '#3b5cc4', text: '#1f2937', muted: '#6b7280', bg: '#ffffff', light: '#dbeafe' },
  ocean:     { primary: '#0c4a6e', secondary: '#0284c7', text: '#0f172a', muted: '#64748b', bg: '#ffffff', light: '#bae6fd' },
  royal:     { primary: '#3730a3', secondary: '#6366f1', text: '#1e1b4b', muted: '#7c83d1', bg: '#ffffff', light: '#e0e7ff' },
  slate:     { primary: '#334155', secondary: '#64748b', text: '#1e293b', muted: '#94a3b8', bg: '#ffffff', light: '#e2e8f0' },
  emerald:   { primary: '#065f46', secondary: '#059669', text: '#1f2937', muted: '#6b7280', bg: '#ffffff', light: '#d1fae5' },
  forest:    { primary: '#14532d', secondary: '#16a34a', text: '#1f2937', muted: '#6b7280', bg: '#ffffff', light: '#dcfce7' },
  teal:      { primary: '#134e4a', secondary: '#0d9488', text: '#1f2937', muted: '#6b7280', bg: '#ffffff', light: '#ccfbf1' },
  burgundy:  { primary: '#7c2d12', secondary: '#c2410c', text: '#1c1917', muted: '#78716c', bg: '#ffffff', light: '#fed7aa' },
  rust:      { primary: '#9a3412', secondary: '#ea580c', text: '#1c1917', muted: '#78716c', bg: '#ffffff', light: '#ffedd5' },
  wine:      { primary: '#6b21a8', secondary: '#9333ea', text: '#1e1b4b', muted: '#a78bfa', bg: '#ffffff', light: '#f3e8ff' },
  charcoal:  { primary: '#1c1917', secondary: '#44403c', text: '#1c1917', muted: '#78716c', bg: '#ffffff', light: '#e7e5e4' },
  graphite:  { primary: '#27272a', secondary: '#52525b', text: '#27272a', muted: '#71717a', bg: '#ffffff', light: '#f4f4f5' },
  stone:     { primary: '#44403c', secondary: '#78716c', text: '#1c1917', muted: '#a8a29e', bg: '#ffffff', light: '#f5f5f4' },
  violet:    { primary: '#4c1d95', secondary: '#7c3aed', text: '#1e1b4b', muted: '#a78bfa', bg: '#ffffff', light: '#ede9fe' },
  indigo:    { primary: '#312e81', secondary: '#4338ca', text: '#1e1b4b', muted: '#818cf8', bg: '#ffffff', light: '#e0e7ff' },
  plum:      { primary: '#581c87', secondary: '#9333ea', text: '#1e1b4b', muted: '#c084fc', bg: '#ffffff', light: '#faf5ff' },
};

const CATEGORY_PALETTE: Record<string, string> = {
  'ats-professional':    'navy',
  'tech-startup':        'indigo',
  'creative-design':     'wine',
  'academic-research':   'teal',
  'entry-student':       'royal',
  'executive-leadership':'charcoal',
};

function getPalette(paletteId?: string, category?: string | null): Palette {
  if (paletteId && PALETTES[paletteId]) return PALETTES[paletteId];
  const fallbackId = category ? CATEGORY_PALETTE[category] : 'navy';
  return PALETTES[fallbackId] || PALETTES['navy'];
}

function getJobTitle(experience: any[]): string {
  return experience && experience.length > 0 && experience[0].title
    ? experience[0].title
    : 'Professional';
}

function skillStr(skill: any): string {
  return typeof skill === 'string' ? skill : (skill as any).category || (skill as any).name || String(skill);
}

function certStr(cert: any): string {
  return typeof cert === 'string' ? cert : cert.name || '';
}

function awardStr(award: any): string {
  return typeof award === 'string' ? award : (award.name || '') + (award.date ? ` (${award.date})` : '');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SINGLE-STANDARD
// ─────────────────────────────────────────────────────────────────────────────
function generateSingleColumnHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:40px 48px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Calibri',Arial,sans-serif;font-size:10px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{text-align:center;padding-bottom:10px;margin-bottom:18px;border-bottom:2px solid ${p.primary};}
    .name{font-size:26px;font-weight:bold;color:${p.primary};letter-spacing:0.5px;margin-bottom:4px;}
    .contact{font-size:9px;color:${p.muted};}
    h2{font-size:11px;font-weight:bold;color:${p.primary};border-bottom:2px solid ${p.primary};padding-bottom:3px;margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.8px;}
    .job{margin-bottom:10px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:10.5px;}
    .jd{font-size:8.5px;color:${p.muted};font-style:italic;}
    .co{font-size:9.5px;color:${p.muted};margin-bottom:3px;}
    .b{font-size:9px;line-height:1.55;margin:2px 0 2px 14px;color:${p.muted};}
    .b:before{content:"•";margin-right:7px;color:${p.primary};font-weight:bold;}
    .pills{display:flex;flex-wrap:wrap;gap:5px;}
    .pill{background:${p.light};color:${p.primary};padding:3px 9px;border-radius:4px;font-size:8.5px;font-weight:500;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:bold;font-size:10px;}
    .sch{font-size:9px;color:${p.muted};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name || 'YOUR NAME'}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).join(' • ')}</div>
    </div>
    ${sum ? `<h2>Professional Summary</h2><p style="font-size:9.5px;line-height:1.65;color:${p.muted}">${sum}</p>` : ''}
    ${exp.length ? `<h2>Professional Experience</h2>${exp.map(e => `<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' • '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}` : ''}
    ${skills.length ? `<h2>Skills</h2><div class="pills">${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>` : ''}
    ${edu.length ? `<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.location?' • '+e.location:''}${e.graduationDate?' • '+e.graduationDate:''}${e.gpa?' • GPA: '+e.gpa:''}</div></div>`).join('')}` : ''}
    ${certs.length ? `<h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}` : ''}
    ${proj.length ? `<h2>Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}${p.url?' — '+p.url:''}</div>${p.description?`<div class="co">${p.description}</div>`:''}${p.technologies?.length?`<div class="sch">Tech: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}` : ''}
    ${langs.length ? `<h2>Languages</h2><div class="pills">${langs.map((l:string)=>`<span class="pill">${l}</span>`).join('')}</div>` : ''}
    ${awards.length ? `<h2>Awards &amp; Honors</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}` : ''}
    ${vol.length ? `<h2>Volunteer Work</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?' • '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}` : ''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TWO-SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function generateTwoColumnHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:0;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:${p.text};background:#fff;display:flex;min-height:297mm;}
    .sb{width:260px;background:${p.primary};padding:28px 20px;color:#fff;}
    .sb .name{font-size:22px;font-weight:bold;color:#fff;line-height:1.2;margin-bottom:4px;}
    .sb .title{font-size:10px;color:rgba(255,255,255,0.8);margin-bottom:22px;}
    .sh{font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.7);border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:4px;margin-bottom:8px;}
    .si{font-size:8.5px;color:rgba(255,255,255,0.9);margin-bottom:5px;line-height:1.5;}
    .pill{background:rgba(255,255,255,0.2);color:#fff;padding:3px 8px;border-radius:10px;font-size:7.5px;display:inline-block;margin:3px 3px 0 0;}
    .ss{margin-bottom:18px;}
    .main{flex:1;padding:32px 32px;}
    h2{font-size:11px;font-weight:bold;color:${p.primary};border-bottom:2px solid ${p.primary};padding-bottom:3px;margin:14px 0 8px;text-transform:uppercase;letter-spacing:0.5px;}
    .job{margin-bottom:10px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:10.5px;}
    .jd{font-size:8.5px;color:${p.muted};font-style:italic;}
    .co{font-size:9.5px;color:${p.muted};margin-bottom:3px;}
    .b{font-size:9px;line-height:1.55;margin:2px 0 2px 14px;color:${p.muted};}
    .b:before{content:"•";margin-right:7px;color:${p.primary};font-weight:bold;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:bold;font-size:10px;}
    .sch{font-size:9px;color:${p.muted};}
  </style></head><body>
    <div class="sb">
      <div class="name">${c.name||'YOUR NAME'}</div>
      <div class="title">${getJobTitle(exp)}</div>
      <div class="ss"><div class="sh">Contact</div>
        ${c.email?`<div class="si">${c.email}</div>`:''}
        ${c.phone?`<div class="si">${c.phone}</div>`:''}
        ${c.location?`<div class="si">${c.location}</div>`:''}
        ${c.linkedin?`<div class="si">${c.linkedin}</div>`:''}
        ${c.github?`<div class="si">${c.github}</div>`:''}
      </div>
      ${skills.length?`<div class="ss"><div class="sh">Skills</div>${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
      ${certs.length?`<div class="ss"><div class="sh">Certifications</div>${certs.map((c:any)=>`<div class="si">• ${certStr(c)}</div>`).join('')}</div>`:''}
      ${langs.length?`<div class="ss"><div class="sh">Languages</div>${langs.map((l:string)=>`<div class="si">• ${l}</div>`).join('')}</div>`:''}
      ${awards.length?`<div class="ss"><div class="sh">Awards</div>${awards.map((a:any)=>`<div class="si">• ${awardStr(a)}</div>`).join('')}</div>`:''}
    </div>
    <div class="main">
      ${sum?`<h2>Summary</h2><p style="font-size:9.5px;line-height:1.65;color:${p.muted}">${sum}</p>`:''}
      ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' • '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
      ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' • '+e.graduationDate:''}${e.gpa?' • GPA: '+e.gpa:''}</div></div>`).join('')}`:''}
      ${proj.length?`<h2>Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}${p.url?' — '+p.url:''}</div>${p.description?`<div class="co">${p.description}</div>`:''}${p.technologies?.length?`<div class="sch">Tech: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
      ${vol.length?`<h2>Volunteer Work</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?' • '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ACADEMIC
// ─────────────────────────────────────────────────────────────────────────────
function generateAcademicHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:42px 56px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Times New Roman',Georgia,serif;font-size:10px;color:${p.text};background:#fff;line-height:1.6;}
    .hdr{text-align:center;border-bottom:2px solid ${p.primary};padding-bottom:14px;margin-bottom:22px;}
    .name{font-size:24px;font-weight:bold;color:${p.primary};margin-bottom:6px;}
    .contact{font-size:9.5px;color:${p.muted};}
    h2{font-size:11px;font-weight:bold;color:${p.primary};border-bottom:1.5px solid ${p.primary};padding-bottom:3px;margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.5px;}
    .entry{margin-bottom:10px;font-size:9.5px;}
    .b{margin-left:16px;font-size:9.5px;}
    .b:before{content:"•";margin-right:7px;color:${p.primary};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'YOUR NAME'}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin].filter(Boolean).join(' • ')}</div>
    </div>
    ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="entry"><strong>${e.degree||''}</strong>, ${e.institution||''}${e.location?', '+e.location:''}${e.graduationDate?', '+e.graduationDate:''}${e.gpa?' (GPA: '+e.gpa+')':''}</div>`).join('')}`:''}
    ${sum?`<h2>Research Interests</h2><div class="entry">${sum}</div>`:''}
    ${exp.length?`<h2>Academic &amp; Research Experience</h2>${exp.map(e=>`<div class="entry"><strong>${e.title||''}</strong>, ${e.company||''}, ${e.startDate||''} – ${e.current?'Present':e.endDate||''}${(e.description||[]).length?'<ul style="margin:4px 0 0 20px">'+(e.description||[]).map((d:string)=>`<li>${d}</li>`).join('')+'</ul>':''}</div>`).join('')}`:''}
    ${proj.length?`<h2>Publications &amp; Research</h2>${proj.map((p:any)=>`<div class="entry"><strong>${p.name||''}</strong>${p.description?'. '+p.description:''}${p.url?' ['+p.url+']':''}</div>`).join('')}`:''}
    ${skills.length?`<h2>Areas of Expertise</h2><div class="entry">${(skills as any[]).map(s=>skillStr(s)).join(' • ')}</div>`:''}
    ${awards.length?`<h2>Honors &amp; Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
    ${certs.length?`<h2>Professional Affiliations</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
    ${langs.length?`<h2>Languages</h2><div class="entry">${langs.join(' • ')}</div>`:''}
    ${vol.length?`<h2>Service &amp; Community</h2>${vol.map((v:any)=>`<div class="entry">${typeof v==='string'?'• '+v:`<strong>${v.role||''}</strong>, ${v.organization||''}${v.location?', '+v.location:''}${v.startDate?' ('+v.startDate+(v.current?' – Present':v.endDate?' – '+v.endDate:'')+')':''}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BOLD-MODERN
// ─────────────────────────────────────────────────────────────────────────────
function generateBoldModernHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:40px 48px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Arial Black',Arial,sans-serif;font-size:10px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{border-left:8px solid ${p.primary};padding-left:20px;margin-bottom:28px;}
    .name{font-size:34px;font-weight:900;color:${p.primary};letter-spacing:-0.5px;line-height:1.1;margin-bottom:6px;}
    .contact{font-size:9px;color:${p.muted};line-height:1.8;}
    h2{font-size:10px;font-weight:bold;background:${p.primary};color:#fff;padding:4px 10px;margin:16px -4px 10px;text-transform:uppercase;letter-spacing:1px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:10.5px;}
    .jd{font-size:8.5px;color:${p.muted};font-style:italic;}
    .co{font-size:9.5px;color:${p.secondary};font-weight:600;margin-bottom:4px;}
    .b{font-size:9px;line-height:1.55;margin:2px 0 2px 14px;}
    .b:before{content:"▸";margin-right:7px;color:${p.primary};}
    .pills{display:flex;flex-wrap:wrap;gap:5px;}
    .pill{background:${p.primary};color:#fff;padding:4px 11px;border-radius:14px;font-size:8px;font-weight:bold;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:bold;font-size:10px;}
    .sch{font-size:9px;color:${p.muted};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'YOUR NAME'}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).join('  |  ')}</div>
    </div>
    ${sum?`<h2>About</h2><p style="font-size:9.5px;line-height:1.65;color:${p.muted}">${sum}</p>`:''}
    ${skills.length?`<h2>Skills</h2><div class="pills">${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
    ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' | '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
    ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' • '+e.graduationDate:''}${e.gpa?' • GPA '+e.gpa:''}</div></div>`).join('')}`:''}
    ${certs.length?`<h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
    ${proj.length?`<h2>Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}${p.url?' — '+p.url:''}</div>${p.description?`<div style="font-size:9px;color:${p.muted}">${p.description}</div>`:''}${p.technologies?.length?`<div class="sch">Tech: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
    ${langs.length?`<h2>Languages</h2><div class="pills">${langs.map((l:string)=>`<span class="pill">${l}</span>`).join('')}</div>`:''}
    ${awards.length?`<h2>Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
    ${vol.length?`<h2>Volunteer</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?' | '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CLASSIC
// ─────────────────────────────────────────────────────────────────────────────
function generateClassicHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:44px 56px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Georgia,'Times New Roman',serif;font-size:10.5px;color:${p.text};background:#fff;line-height:1.6;}
    .hdr{text-align:center;margin-bottom:20px;}
    .name{font-size:28px;font-weight:bold;color:${p.text};letter-spacing:2px;margin-bottom:6px;}
    .contact{font-size:9px;color:${p.muted};margin-bottom:10px;}
    hr{border:none;border-top:1.5px solid #bbb;margin:10px 0;}
    h2{font-size:11.5px;font-weight:bold;color:${p.primary};border-bottom:1.5px solid ${p.primary};padding-bottom:4px;margin:18px 0 10px;letter-spacing:0.5px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:10.5px;}
    .jd{font-size:9px;color:${p.muted};font-style:italic;}
    .co{font-size:10px;color:${p.secondary};font-style:italic;margin-bottom:4px;}
    .b{font-size:10px;line-height:1.6;margin:2px 0 2px 18px;}
    .b:before{content:"–";margin-right:8px;color:${p.muted};}
    .edu{margin-bottom:10px;}
    .deg{font-weight:bold;font-size:10.5px;}
    .sch{font-size:9.5px;color:${p.muted};font-style:italic;}
    .inline{font-size:10px;line-height:1.8;}
  </style></head><body>
    <div class="hdr">
      <div class="name">${(c.name||'YOUR NAME').toUpperCase()}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin].filter(Boolean).join('  ·  ')}</div>
      <hr/>
    </div>
    ${sum?`<h2>Professional Summary</h2><p style="font-size:10px;line-height:1.7;font-style:italic">${sum}</p>`:''}
    ${exp.length?`<h2>Professional Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?', '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
    ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.location?', '+e.location:''}${e.graduationDate?', '+e.graduationDate:''}${e.gpa?' (GPA: '+e.gpa+')':''}</div></div>`).join('')}`:''}
    ${skills.length?`<h2>Core Competencies</h2><div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('  •  ')}</div>`:''}
    ${certs.length?`<h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
    ${proj.length?`<h2>Selected Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}</div>${p.description?`<div class="b">${p.description}</div>`:''}${p.technologies?.length?`<div style="font-size:9px;color:${p.muted};font-style:italic">Technologies: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
    ${langs.length?`<h2>Languages</h2><div class="inline">${langs.join('  •  ')}</div>`:''}
    ${awards.length?`<h2>Honors &amp; Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
    ${vol.length?`<h2>Community Involvement</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?', '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CONTEMPORARY
// ─────────────────────────────────────────────────────────────────────────────
function generateContemporaryHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:0;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:${p.text};background:#fff;}
    .band{background:${p.primary};padding:32px 48px;color:#fff;margin-bottom:0;}
    .name{font-size:30px;font-weight:700;color:#fff;margin-bottom:6px;}
    .title{font-size:11px;color:rgba(255,255,255,0.8);margin-bottom:10px;}
    .contact{font-size:8.5px;color:rgba(255,255,255,0.85);}
    .body{padding:24px 48px;}
    h2{font-size:10.5px;font-weight:bold;color:${p.primary};border-left:4px solid ${p.primary};padding-left:10px;margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.8px;}
    .job{margin-bottom:10px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:10.5px;}
    .jd{font-size:8.5px;color:${p.muted};font-style:italic;}
    .co{font-size:9.5px;color:${p.muted};margin-bottom:3px;}
    .b{font-size:9px;line-height:1.55;margin:2px 0 2px 14px;color:${p.muted};}
    .b:before{content:"•";margin-right:7px;color:${p.primary};font-weight:bold;}
    .pills{display:flex;flex-wrap:wrap;gap:5px;}
    .pill{background:${p.light};color:${p.primary};padding:3px 9px;border-radius:4px;font-size:8.5px;font-weight:600;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:bold;font-size:10px;}
    .sch{font-size:9px;color:${p.muted};}
  </style></head><body>
    <div class="band">
      <div class="name">${c.name||'YOUR NAME'}</div>
      <div class="title">${getJobTitle(exp)}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).join('  ·  ')}</div>
    </div>
    <div class="body">
      ${sum?`<h2>Summary</h2><p style="font-size:9.5px;line-height:1.65;color:${p.muted}">${sum}</p>`:''}
      ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' • '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
      ${skills.length?`<h2>Skills</h2><div class="pills">${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
      ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' • '+e.graduationDate:''}${e.gpa?' • GPA: '+e.gpa:''}</div></div>`).join('')}`:''}
      ${certs.length?`<h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
      ${proj.length?`<h2>Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}${p.url?' — '+p.url:''}</div>${p.description?`<div class="co">${p.description}</div>`:''}${p.technologies?.length?`<div class="sch">Tech: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
      ${langs.length?`<h2>Languages</h2><div class="pills">${langs.map((l:string)=>`<span class="pill">${l}</span>`).join('')}</div>`:''}
      ${awards.length?`<h2>Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
      ${vol.length?`<h2>Volunteer Work</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?' • '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. EXECUTIVE
// ─────────────────────────────────────────────────────────────────────────────
function generateExecutiveHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:0;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Georgia',serif;font-size:10.5px;color:${p.text};background:#fff;}
    .banner{background:${p.primary};padding:36px 56px;color:#fff;}
    .name{font-size:32px;font-weight:700;color:#fff;letter-spacing:1.5px;margin-bottom:6px;}
    .contact{font-size:9px;color:rgba(255,255,255,0.85);letter-spacing:0.3px;}
    .divider{height:3px;background:${p.secondary};opacity:0.6;}
    .body{padding:28px 56px;}
    h2{font-size:11px;font-weight:bold;color:${p.primary};text-transform:uppercase;letter-spacing:2px;border-bottom:2px solid ${p.primary};padding-bottom:4px;margin:20px 0 10px;}
    .job{margin-bottom:14px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:bold;font-size:11px;letter-spacing:0.3px;}
    .jd{font-size:9px;color:${p.muted};font-style:italic;}
    .co{font-size:10px;color:${p.secondary};font-weight:600;margin-bottom:5px;}
    .b{font-size:9.5px;line-height:1.6;margin:3px 0 3px 18px;}
    .b:before{content:"▪";margin-right:8px;color:${p.primary};}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
    .edu{margin-bottom:10px;}
    .deg{font-weight:bold;font-size:11px;}
    .sch{font-size:9.5px;color:${p.muted};}
    .inline{font-size:10px;line-height:1.9;}
  </style></head><body>
    <div class="banner">
      <div class="name">${(c.name||'YOUR NAME').toUpperCase()}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin].filter(Boolean).join('   •   ')}</div>
    </div>
    <div class="divider"></div>
    <div class="body">
      ${sum?`<h2>Executive Profile</h2><p style="font-size:10px;line-height:1.75;font-style:italic">${sum}</p>`:''}
      ${exp.length?`<h2>Career History</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' | '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
      <div class="grid2">
        ${edu.length?`<div><h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?', '+e.graduationDate:''}</div></div>`).join('')}</div>`:'<div></div>'}
        ${certs.length?`<div><h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}</div>`:'<div></div>'}
      </div>
      ${skills.length?`<h2>Core Competencies</h2><div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('   ▪   ')}</div>`:''}
      ${awards.length?`<h2>Awards &amp; Recognition</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
      ${proj.length?`<h2>Key Initiatives</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}</div>${p.description?`<div class="b">${p.description}</div>`:''}</div>`).join('')}`:''}
      ${langs.length?`<h2>Languages</h2><div class="inline">${langs.join('   •   ')}</div>`:''}
      ${vol.length?`<h2>Board &amp; Community</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}${v.location?' | '+v.location:''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. MINIMAL
// ─────────────────────────────────────────────────────────────────────────────
function generateMinimalHTML(data: ParsedResumeData, p: Palette): string {
  const c = data.contact || {} as any;
  const exp = data.experience || [];
  const edu = data.education || [];
  const skills = data.skills || [];
  const sum = data.summary || '';
  const certs = data.certifications || [];
  const proj = data.projects || [];
  const langs = data.languages || [];
  const awards = data.awards || [];
  const vol = data.volunteerWork || [];

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:56px 64px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.7;}
    .hdr{margin-bottom:28px;}
    .name{font-size:22px;font-weight:300;color:${p.text};letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;}
    .contact{font-size:8.5px;color:${p.muted};}
    h2{font-size:9px;font-weight:600;color:${p.primary};text-transform:uppercase;letter-spacing:2.5px;margin:20px 0 10px;padding-bottom:4px;border-bottom:1px solid ${p.light};}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:600;font-size:10px;}
    .jd{font-size:8px;color:${p.muted};}
    .co{font-size:9px;color:${p.muted};margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.6;margin:2px 0 2px 12px;color:${p.muted};}
    .edu{margin-bottom:8px;}
    .deg{font-weight:600;font-size:9.5px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .inline{font-size:9px;color:${p.muted};line-height:1.9;}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).join('  /  ')}</div>
    </div>
    ${sum?`<h2>Profile</h2><p style="font-size:9px;line-height:1.75;color:${p.muted}">${sum}</p>`:''}
    ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''} — ${e.company||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.location||''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
    ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
    ${skills.length?`<h2>Skills</h2><div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('  ·  ')}</div>`:''}
    ${certs.length?`<h2>Certifications</h2>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
    ${proj.length?`<h2>Projects</h2>${proj.map((p:any)=>`<div class="job"><div class="jt">${p.name||''}</div>${p.description?`<div class="b">${p.description}</div>`:''}${p.technologies?.length?`<div class="sch">Tech: ${p.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
    ${langs.length?`<h2>Languages</h2><div class="inline">${langs.join('  ·  ')}</div>`:''}
    ${awards.length?`<h2>Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
    ${vol.length?`<h2>Volunteer</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}${v.organization?' — '+v.organization:''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTemplateHTML(
  templateId: string,
  data: ParsedResumeData
): Promise<string> {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error(`Template not found: ${templateId}`);

  const config = template.templateConfig as any || {};
  const palette = getPalette(config.colorPalette, template.primaryCategory);

  // Determine layout: use explicit DB config, fall back to legacy heuristics
  let layoutType: string = config.layoutType || '';

  if (!layoutType) {
    // Legacy fallback for old templates without layoutType
    const nameLower = template.name.toLowerCase();
    const isTwoCol = nameLower.includes('bold') || nameLower.includes('sidebar') ||
      nameLower.includes('portfolio') || (nameLower.includes('modern') && template.primaryCategory === 'tech-startup');
    if (isTwoCol) layoutType = 'two-sidebar';
    else if (template.primaryCategory === 'academic-research') layoutType = 'academic';
    else layoutType = 'single-standard';
  }

  console.log(`📄 Template "${template.name}" → layout: ${layoutType}, palette: ${config.colorPalette || 'auto'}`);

  switch (layoutType) {
    case 'two-sidebar':    return generateTwoColumnHTML(data, palette);
    case 'academic':       return generateAcademicHTML(data, palette);
    case 'bold-modern':    return generateBoldModernHTML(data, palette);
    case 'classic':        return generateClassicHTML(data, palette);
    case 'contemporary':   return generateContemporaryHTML(data, palette);
    case 'executive':      return generateExecutiveHTML(data, palette);
    case 'minimal':        return generateMinimalHTML(data, palette);
    default:               return generateSingleColumnHTML(data, palette);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF GENERATION
// ─────────────────────────────────────────────────────────────────────────────
export async function generateTemplatePDF(
  templateId: string,
  data: ParsedResumeData
): Promise<Buffer> {
  console.log(`📄 Generating PDF for template: ${templateId}`);

  const html = await generateTemplateHTML(templateId, data);
  console.log(`  HTML generated, length: ${html.length} chars`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    console.log(`  PDF generated successfully, size: ${buffer.length} bytes`);
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`  PDF generation error:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}
