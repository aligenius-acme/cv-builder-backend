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
  midnight:  { primary: '#0a0a0a', secondary: '#262626', text: '#0a0a0a', muted: '#737373', bg: '#ffffff', light: '#f5f5f5' },
  coral:     { primary: '#c0392b', secondary: '#e74c3c', text: '#1a1a1a', muted: '#6b7280', bg: '#ffffff', light: '#fecaca' },
  sage:      { primary: '#4a7c59', secondary: '#6aaa7e', text: '#1a2e1d', muted: '#6b7280', bg: '#ffffff', light: '#d4e8da' },
  gold:      { primary: '#92660a', secondary: '#c9820e', text: '#1c1708', muted: '#78716c', bg: '#ffffff', light: '#fef08a' },
  sky:       { primary: '#0369a1', secondary: '#0284c7', text: '#0c1a2e', muted: '#64748b', bg: '#ffffff', light: '#e0f2fe' },
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
// 9. SPLIT-PANEL  (colored left sidebar + white right body)
// ─────────────────────────────────────────────────────────────────────────────
function generateSplitPanelHTML(data: ParsedResumeData, p: Palette): string {
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
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;display:flex;min-height:297mm;}
    .sidebar{width:33%;background:${p.primary};padding:36px 18px 36px 20px;color:#fff;flex-shrink:0;}
    .sname{font-size:20px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:4px;letter-spacing:-0.3px;}
    .stitle{font-size:8.5px;color:rgba(255,255,255,0.72);margin-bottom:18px;}
    .sh{font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#fff;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:5px;margin:18px 0 8px;}
    .si{font-size:8px;color:rgba(255,255,255,0.85);margin-bottom:5px;line-height:1.45;word-break:break-word;}
    .sk{font-size:8px;color:rgba(255,255,255,0.88);margin-bottom:5px;padding-left:8px;border-left:2px solid rgba(255,255,255,0.4);}
    .body{flex:1;padding:36px 28px 36px 22px;}
    h2{font-size:8.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${p.primary};padding-bottom:3px;margin:18px 0 8px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};font-style:italic;}
    .co{font-size:9px;color:${p.secondary};margin-bottom:3px;font-weight:500;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;color:${p.text};}
    .sch{font-size:8.5px;color:${p.muted};}
  </style></head><body>
    <div class="sidebar">
      <div class="sname">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="stitle">${exp[0].title||''}</div>`:''}
      <div class="sh">Contact</div>
      ${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<div class="si">${v}</div>`).join('')}
      ${skills.length?`<div class="sh">Skills</div>${(skills as any[]).map(s=>`<div class="sk">${skillStr(s)}</div>`).join('')}`:''}
      ${certs.length?`<div class="sh">Certifications</div>${certs.map((c:any)=>`<div class="si">• ${certStr(c)}</div>`).join('')}`:''}
      ${langs.length?`<div class="sh">Languages</div>${langs.map(l=>`<div class="si">• ${l}</div>`).join('')}`:''}
    </div>
    <div class="body">
      ${sum?`<h2>Profile</h2><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p>`:''}
      ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
      ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
      ${proj.length?`<h2>Projects</h2>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
      ${awards.length?`<h2>Awards</h2>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
      ${vol.length?`<h2>Volunteer Work</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. RULED-ELEGANT  (editorial serif, ruled section dividers)
// ─────────────────────────────────────────────────────────────────────────────
function generateRuledElegantHTML(data: ParsedResumeData, p: Palette): string {
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

  const ruled = (title: string) =>
    `<div style="display:flex;align-items:center;gap:10px;margin:18px 0 10px">
      <span style="font-size:7.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:2px;white-space:nowrap">${title}</span>
      <div style="flex:1;height:1px;background:${p.primary};opacity:0.4"></div>
    </div>`;

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:42px 50px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Georgia,'Times New Roman',serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.6;}
    .hdr{text-align:center;margin-bottom:16px;}
    .name{font-size:26px;font-weight:400;color:${p.primary};letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;}
    .htitle{font-size:9px;color:${p.muted};font-style:italic;margin-bottom:8px;}
    .hcontact{font-size:8px;color:${p.muted};letter-spacing:0.3px;}
    .dbl1{height:3px;background:${p.primary};margin-bottom:3px;}
    .dbl2{height:1px;background:${p.primary};opacity:0.4;margin-bottom:10px;}
    .job{margin-bottom:14px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;}
    .jd{font-size:8px;color:${p.muted};font-style:italic;}
    .co{font-size:9px;color:${p.secondary};font-style:italic;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.6;margin:2px 0 2px 14px;color:${p.muted};}
    .b:before{content:"–";margin-right:6px;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};font-style:italic;}
    .inline{font-size:9px;color:${p.muted};line-height:2;}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      <div class="hcontact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).join('  ·  ')}</div>
      <div class="dbl1" style="margin-top:12px"></div><div class="dbl2"></div>
    </div>
    ${sum?ruled('Profile')+`<p style="font-size:9px;color:${p.muted};line-height:1.7;font-style:italic">${sum}</p>`:''}
    ${exp.length?ruled('Experience')+exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join(''):''}
    ${edu.length?ruled('Education')+edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join(''):''}
    ${skills.length?ruled('Skills')+`<div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('   ·   ')}</div>`:''}
    ${certs.length?ruled('Certifications')+certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join(''):''}
    ${proj.length?ruled('Projects')+proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join(''):''}
    ${langs.length?ruled('Languages')+`<div class="inline">${langs.join('   ·   ')}</div>`:''}
    ${awards.length?ruled('Awards')+awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join(''):''}
    ${vol.length?ruled('Volunteer Work')+vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join(''):''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. TOP-ACCENT  (8px color strip, name left / contact right)
// ─────────────────────────────────────────────────────────────────────────────
function generateTopAccentHTML(data: ParsedResumeData, p: Palette): string {
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
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;}
    .strip{height:8px;background:${p.primary};}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 44px 14px 44px;border-bottom:1px solid ${p.primary}25;}
    .name{font-size:24px;font-weight:800;color:${p.text};letter-spacing:-0.5px;margin-bottom:3px;}
    .htitle{font-size:10px;color:${p.primary};font-weight:600;}
    .hcontact{text-align:right;font-size:8px;color:${p.muted};line-height:1.9;}
    .body{padding:6px 44px 36px;}
    .sh{display:flex;align-items:center;gap:7px;margin:18px 0 8px;}
    .shdot{width:9px;height:9px;background:${p.primary};flex-shrink:0;border-radius:2px;}
    .shlbl{font-size:8.5px;font-weight:800;color:${p.text};text-transform:uppercase;letter-spacing:1.5px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};}
    .co{font-size:9px;color:${p.primary};font-weight:500;margin-bottom:3px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"·";margin-right:6px;color:${p.primary};}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .pill{display:inline-block;background:${p.light};color:${p.primary};border:1px solid ${p.secondary}30;padding:2px 8px;border-radius:3px;font-size:8px;font-weight:600;margin:2px 3px 2px 0;}
  </style></head><body>
    <div class="strip"></div>
    <div class="hdr">
      <div>
        <div class="name">${c.name||'Your Name'}</div>
        ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      </div>
      <div class="hcontact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<div>${v}</div>`).join('')}</div>
    </div>
    <div class="body">
      ${sum?`<div class="sh"><div class="shdot"></div><div class="shlbl">Summary</div></div><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p>`:''}
      ${exp.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Experience</div></div>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
      ${skills.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Skills</div></div><div>${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
      ${edu.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Education</div></div>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
      ${certs.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Certifications</div></div>${certs.map((c:any)=>`<div class="b">${certStr(c)}</div>`).join('')}`:''}
      ${proj.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Projects</div></div>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
      ${langs.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Languages</div></div><div style="font-size:9px;color:${p.muted}">${langs.join('  ·  ')}</div>`:''}
      ${awards.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Awards</div></div>${awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join('')}`:''}
      ${vol.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Volunteer Work</div></div>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. COLUMN-SPLIT  (full-width header, 58/42 two-column body)
// ─────────────────────────────────────────────────────────────────────────────
function generateColumnSplitHTML(data: ParsedResumeData, p: Palette): string {
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
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;}
    .hdr{background:${p.primary};padding:24px 40px 18px;}
    .hname{font-size:24px;font-weight:700;color:#fff;margin-bottom:5px;letter-spacing:-0.3px;}
    .hsubtitle{font-size:9px;color:rgba(255,255,255,0.8);margin-bottom:8px;}
    .hcontact{font-size:8px;color:rgba(255,255,255,0.7);display:flex;flex-wrap:wrap;gap:0 14px;}
    .cols{display:flex;padding:0 40px 36px;}
    .main{flex:0 0 58%;padding-right:20px;border-right:1px solid ${p.primary}20;}
    .side{flex:0 0 42%;padding-left:18px;}
    .mh{font-size:8.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid ${p.primary};padding-bottom:3px;margin:18px 0 8px;}
    .sh{font-size:7.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1.2px;border-bottom:1px solid ${p.primary}40;padding-bottom:3px;margin:18px 0 7px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};font-style:italic;}
    .co{font-size:9px;color:${p.secondary};font-weight:500;margin-bottom:3px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .pill{display:inline-block;background:${p.light};color:${p.primary};border:1px solid ${p.secondary}30;padding:2px 7px;border-radius:3px;font-size:7.5px;font-weight:600;margin:2px 2px 2px 0;}
  </style></head><body>
    <div class="hdr">
      <div class="hname">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="hsubtitle">${exp[0].title||''}${exp[0].company?' · '+exp[0].company:''}</div>`:''}
      <div class="hcontact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<span>${v}</span>`).join('')}</div>
    </div>
    <div class="cols">
      <div class="main">
        ${exp.length?`<div class="mh">Experience</div>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
        ${edu.length?`<div class="mh">Education</div>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
        ${proj.length?`<div class="mh">Projects</div>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
        ${vol.length?`<div class="mh">Volunteer</div>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
      </div>
      <div class="side">
        ${sum?`<div class="sh">Summary</div><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p>`:''}
        ${skills.length?`<div class="sh">Skills</div><div>${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
        ${certs.length?`<div class="sh">Certifications</div>${certs.map((c:any)=>`<div style="font-size:8px;color:${p.muted};margin-bottom:4px">• ${certStr(c)}</div>`).join('')}`:''}
        ${langs.length?`<div class="sh">Languages</div>${langs.map(l=>`<div style="font-size:9px;color:${p.muted};margin-bottom:4px">• ${l}</div>`).join('')}`:''}
        ${awards.length?`<div class="sh">Awards</div>${awards.map((a:any)=>`<div style="font-size:8px;color:${p.muted};margin-bottom:4px">• ${awardStr(a)}</div>`).join('')}`:''}
      </div>
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. BORDERED-PAGE  (thin border frame, centered serif name, ruled sections)
// ─────────────────────────────────────────────────────────────────────────────
function generateBorderedPageHTML(data: ParsedResumeData, p: Palette): string {
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

  const centeredRule = (title: string) =>
    `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px">
      <div style="flex:1;height:1px;background:${p.primary};opacity:0.4"></div>
      <span style="font-size:7.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:2.5px;padding:0 6px">${title}</span>
      <div style="flex:1;height:1px;background:${p.primary};opacity:0.4"></div>
    </div>`;

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:0;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Georgia,'Times New Roman',serif;font-size:9.5px;color:${p.text};background:#fff;border:3px solid ${p.primary};min-height:297mm;}
    .inner{border:1px solid ${p.primary}30;margin:8px;padding:32px 40px 36px;}
    .hdr{text-align:center;margin-bottom:12px;}
    .name{font-size:28px;font-weight:400;color:${p.primary};letter-spacing:4px;text-transform:uppercase;margin-bottom:6px;}
    .htitle{font-size:9px;color:${p.muted};font-style:italic;margin-bottom:10px;}
    .dbl1{height:3px;background:${p.primary};margin-bottom:3px;}
    .dbl2{height:1px;background:${p.primary};opacity:0.4;margin-bottom:10px;}
    .hcontact{font-size:8px;color:${p.muted};letter-spacing:0.3px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};font-style:italic;}
    .co{font-size:9px;color:${p.secondary};font-style:italic;margin-bottom:3px;}
    .b{font-size:8.5px;line-height:1.6;margin:2px 0 2px 14px;color:${p.muted};}
    .b:before{content:"▸";margin-right:6px;color:${p.primary};}
    .edu{margin-bottom:8px;text-align:center;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};font-style:italic;}
    .inline{font-size:9px;color:${p.muted};line-height:2;text-align:center;}
  </style></head><body>
    <div class="inner">
      <div class="hdr">
        <div class="name">${c.name||'Your Name'}</div>
        ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
        <div class="dbl1"></div><div class="dbl2"></div>
        <div class="hcontact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).join('  ·  ')}</div>
      </div>
      ${sum?centeredRule('Profile')+`<p style="font-size:9px;color:${p.muted};line-height:1.7;text-align:center;font-style:italic">${sum}</p>`:''}
      ${exp.length?centeredRule('Professional Experience')+exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join(''):''}
      ${edu.length?centeredRule('Education')+edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join(''):''}
      ${skills.length?centeredRule('Core Competencies')+`<div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('   ·   ')}</div>`:''}
      ${certs.length?centeredRule('Certifications')+`<div class="inline">${certs.map((c:any)=>certStr(c)).join('  ·  ')}</div>`:''}
      ${proj.length?centeredRule('Notable Projects')+proj.map((pr:any)=>`<div class="job"><div style="font-weight:700;font-size:10px;text-align:center">${pr.name||''}</div>${pr.description?`<div style="font-size:9px;color:${p.muted};text-align:center;font-style:italic">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch" style="text-align:center">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join(''):''}
      ${langs.length?centeredRule('Languages')+`<div class="inline">${langs.join('   ·   ')}</div>`:''}
      ${awards.length?centeredRule('Honors &amp; Awards')+awards.map((a:any)=>`<div style="font-size:9px;color:${p.muted};text-align:center;margin-bottom:4px">${awardStr(a)}</div>`).join(''):''}
      ${vol.length?centeredRule('Community &amp; Service')+vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div style="font-size:9px;color:${p.muted};text-align:center">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join(''):''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. DARK-MODE  (dark navy background, primaryColor accents, monospace chips)
// ─────────────────────────────────────────────────────────────────────────────
function generateDarkModeHTML(data: ParsedResumeData, p: Palette): string {
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
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:#e2e8f0;background:#0f172a;line-height:1.5;}
    .hdr{padding-bottom:14px;border-bottom:1px solid ${p.primary}30;margin-bottom:6px;}
    .name{font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;margin-bottom:5px;}
    .htitle{font-size:10px;color:${p.primary};font-weight:600;margin-bottom:8px;}
    .contact{font-size:8px;color:rgba(255,255,255,0.5);}
    .contact span{margin-right:6px;}
    .contact span:not(:last-child):after{content:"·";margin-left:6px;color:${p.primary}80;}
    h2{font-size:9px;font-weight:800;color:${p.primary};text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid ${p.primary}4d;padding-bottom:5px;margin:18px 0 8px;}
    .job{margin-bottom:14px;border-left:3px solid ${p.primary};padding-left:14px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:#ffffff;}
    .jd{font-size:8px;color:rgba(255,255,255,0.4);}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 0;color:rgba(255,255,255,0.55);display:flex;gap:7px;}
    .b-arrow{color:${p.primary};font-weight:700;flex-shrink:0;}
    .chips{display:flex;flex-wrap:wrap;gap:5px;}
    .chip{background:${p.primary}20;border:1px solid ${p.primary}60;color:${p.primary};border-radius:4px;padding:3px 8px;font-size:8px;font-family:monospace;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;color:#ffffff;}
    .sch{font-size:9px;color:${p.primary};font-weight:600;}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github].filter(Boolean).map(v=>`<span>${v}</span>`).join('')}</div>
    </div>
    ${sum?`<h2>About</h2><p style="font-size:9px;line-height:1.65;color:rgba(255,255,255,0.55)">${sum}</p>`:''}
    ${exp.length?`<h2>Experience</h2>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b"><span class="b-arrow">&gt;</span><span>${d}</span></div>`).join('')}</div>`).join('')}`:''}
    ${skills.length?`<h2>Skills</h2><div class="chips">${(skills as any[]).map(s=>`<span class="chip">${skillStr(s)}</span>`).join('')}</div>`:''}
    ${edu.length?`<h2>Education</h2>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
    ${certs.length?`<h2>Certifications</h2><div class="chips">${certs.map((c:any)=>`<span class="chip">${certStr(c)}</span>`).join('')}</div>`:''}
    ${proj.length?`<h2>Projects</h2>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b"><span class="b-arrow">&gt;</span><span>${pr.description}</span></div>`:''}${pr.technologies?.length?`<div style="font-size:8px;color:${p.primary};margin-top:2px">${pr.technologies.join(' · ')}</div>`:''}</div>`).join('')}`:''}
    ${langs.length?`<h2>Languages</h2><div class="chips">${langs.map((l:string)=>`<span class="chip">${l}</span>`).join('')}</div>`:''}
    ${awards.length?`<h2>Awards</h2>${awards.map((a:any)=>`<div class="b"><span class="b-arrow">★</span><span>${awardStr(a)}</span></div>`).join('')}`:''}
    ${vol.length?`<h2>Volunteer</h2>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b"><span class="b-arrow">&gt;</span><span>${v}</span></div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b"><span class="b-arrow">&gt;</span><span>${d}</span></div>`).join('')}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. DIAGONAL-HERO  (geometric diagonal clip-path header)
// ─────────────────────────────────────────────────────────────────────────────
function generateDiagonalHeroHTML(data: ParsedResumeData, p: Palette): string {
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
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;}
    .hdr{position:relative;height:120px;overflow:hidden;margin-bottom:0;}
    .hdr-bg{position:absolute;left:0;top:0;width:58%;height:100%;background:${p.primary};clip-path:polygon(0 0,100% 0,82% 100%,0 100%);}
    .hdr-name{position:absolute;left:36px;top:50%;transform:translateY(-50%);}
    .name{font-size:24px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:3px;}
    .htitle{font-size:9px;color:rgba(255,255,255,0.85);}
    .hdr-contact{position:absolute;right:36px;top:50%;transform:translateY(-50%);text-align:right;}
    .hcontact{font-size:8px;color:${p.muted};line-height:1.8;}
    .body{padding:14px 36px 36px;}
    .sh{display:flex;align-items:center;gap:8px;margin:18px 0 8px;}
    .shdot{width:8px;height:8px;background:${p.primary};flex-shrink:0;border-radius:2px;}
    .shlbl{font-size:8px;font-weight:700;color:${p.text};text-transform:uppercase;letter-spacing:1.5px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:3px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 0;color:${p.muted};display:flex;gap:7px;}
    .b-arr{color:${p.primary};font-weight:700;flex-shrink:0;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .pill{display:inline-block;border:1.5px solid ${p.primary};color:${p.primary};border-radius:20px;padding:2px 10px;font-size:7.5px;margin:2px 3px 2px 0;}
  </style></head><body>
    <div class="hdr">
      <div class="hdr-bg"></div>
      <div class="hdr-name"><div class="name">${c.name||'Your Name'}</div>${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}</div>
      <div class="hdr-contact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<div class="hcontact">${v}</div>`).join('')}</div>
    </div>
    <div class="body">
      ${sum?`<div class="sh"><div class="shdot"></div><div class="shlbl">Summary</div></div><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p>`:''}
      ${exp.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Experience</div></div>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b"><span class="b-arr">▸</span><span>${d}</span></div>`).join('')}</div>`).join('')}`:''}
      ${skills.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Skills</div></div><div>${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
      ${edu.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Education</div></div>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
      ${certs.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Certifications</div></div>${certs.map((c:any)=>`<div class="b"><span class="b-arr">▸</span><span>${certStr(c)}</span></div>`).join('')}`:''}
      ${proj.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Projects</div></div>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b"><span class="b-arr">▸</span><span>${pr.description}</span></div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
      ${langs.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Languages</div></div><div>${langs.map((l:string)=>`<span class="pill">${l}</span>`).join('')}</div>`:''}
      ${awards.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Awards</div></div>${awards.map((a:any)=>`<div class="b"><span class="b-arr">★</span><span>${awardStr(a)}</span></div>`).join('')}`:''}
      ${vol.length?`<div class="sh"><div class="shdot"></div><div class="shlbl">Volunteer</div></div>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b"><span class="b-arr">▸</span><span>${v}</span></div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b"><span class="b-arr">▸</span><span>${d}</span></div>`).join('')}`}</div>`).join('')}`:''}
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. MAGAZINE  (full-width banner, two-column body 62/34)
// ─────────────────────────────────────────────────────────────────────────────
function generateMagazineHTML(data: ParsedResumeData, p: Palette): string {
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
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;}
    .banner{background:${p.primary};padding:28px 40px 20px;}
    .bname{font-size:40px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1.0;margin-bottom:5px;}
    .btitle{font-size:10px;color:rgba(255,255,255,0.7);}
    .cbar{background:${p.secondary}15;border-bottom:1px solid ${p.primary}20;padding:7px 40px;font-size:8px;color:${p.muted};}
    .cols{display:flex;padding:0 40px 36px;}
    .left{flex:0 0 62%;padding-right:22px;border-right:1px solid ${p.primary}15;}
    .right{flex:0 0 34%;padding-left:18px;}
    .lh{font-size:9px;font-weight:900;color:${p.text};text-transform:uppercase;letter-spacing:3px;border-bottom:3px solid ${p.primary};padding-bottom:3px;margin:18px 0 8px;}
    .rh{font-size:7.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid ${p.primary}30;padding-bottom:3px;margin:18px 0 7px;}
    .job{margin-bottom:12px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:800;font-size:10px;color:${p.text};}
    .jd{font-size:8px;color:${p.muted};}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:3px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .literary{font-size:9px;color:${p.text};line-height:1.9;}
  </style></head><body>
    <div class="banner">
      <div class="bname">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="btitle">${exp[0].title||''}</div>`:''}
    </div>
    <div class="cbar">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).join('  ·  ')}</div>
    <div class="cols">
      <div class="left">
        ${exp.length?`<div class="lh">Experience</div>${exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
        ${proj.length?`<div class="lh">Projects</div>${proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}`:''}
        ${vol.length?`<div class="lh">Volunteer</div>${vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
      </div>
      <div class="right">
        ${sum?`<div class="rh">Profile</div><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p>`:''}
        ${skills.length?`<div class="rh">Skills</div><div class="literary">${(skills as any[]).map(s=>skillStr(s)).join(', ')}</div>`:''}
        ${edu.length?`<div class="rh">Education</div>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
        ${certs.length?`<div class="rh">Certifications</div>${certs.map((c:any)=>`<div style="font-size:8px;color:${p.muted};margin-bottom:4px">• ${certStr(c)}</div>`).join('')}`:''}
        ${langs.length?`<div class="rh">Languages</div><div class="literary">${langs.join(', ')}</div>`:''}
        ${awards.length?`<div class="rh">Awards</div>${awards.map((a:any)=>`<div style="font-size:8px;color:${p.muted};margin-bottom:4px">• ${awardStr(a)}</div>`).join('')}`:''}
      </div>
    </div>
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. HIGHLIGHT-BAND  (full-width colored section title bands, alternating rows)
// ─────────────────────────────────────────────────────────────────────────────
function generateHighlightBandHTML(data: ParsedResumeData, p: Palette): string {
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

  const band = (title: string) => `<div style="background:${p.primary};padding:5px 20px;color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:9px;margin-top:14px">${title}</div>`;

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Calibri',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{margin-bottom:12px;}
    .name{font-size:26px;font-weight:700;color:${p.primary};margin-bottom:4px;letter-spacing:-0.3px;}
    .htitle{font-size:9.5px;color:${p.muted};margin-bottom:10px;}
    .cgrid{background:${p.primary}08;border-radius:3px;padding:6px 12px;display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;}
    .ci{font-size:8px;color:${p.muted};}
    .job{padding:8px 20px;}
    .job-even{background:#fafafa;}
    .job-odd{background:#ffffff;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px;}
    .jt{font-weight:700;font-size:10px;}
    .jd{font-size:8px;color:${p.muted};}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .sgrid{padding:8px 20px;display:grid;grid-template-columns:repeat(3,1fr);gap:3px 10px;}
    .si{font-size:9px;color:${p.text};}
    .edu{padding:8px 20px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      <div class="cgrid">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<div class="ci">${v}</div>`).join('')}</div>
    </div>
    ${sum?band('Summary')+`<div style="padding:8px 20px;font-size:9px;color:${p.muted};line-height:1.65">${sum}</div>`:''}
    ${exp.length?band('Experience')+exp.map((e,i)=>`<div class="job ${i%2===0?'job-even':'job-odd'}"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join(''):''}
    ${skills.length?band('Skills')+`<div class="sgrid">${(skills as any[]).map(s=>`<div class="si">· ${skillStr(s)}</div>`).join('')}</div>`:''}
    ${edu.length?band('Education')+edu.map((e,i)=>`<div class="edu" style="background:${i%2===0?'#fafafa':'#ffffff'}"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join(''):''}
    ${certs.length?band('Certifications')+`<div style="padding:8px 20px;display:grid;grid-template-columns:1fr 1fr;gap:3px 16px">${certs.map((c:any)=>`<div style="font-size:9px;color:${p.muted}">• ${certStr(c)}</div>`).join('')}</div>`:''}
    ${proj.length?band('Projects')+proj.map((pr:any,i:number)=>`<div class="job ${i%2===0?'job-even':'job-odd'}"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join(''):''}
    ${langs.length?band('Languages')+`<div style="padding:8px 20px;font-size:9px;color:${p.text}">${langs.join('  ·  ')}</div>`:''}
    ${awards.length?band('Awards')+awards.map((a:any,i:number)=>`<div class="job ${i%2===0?'job-even':'job-odd'}" style="font-size:9px;color:${p.muted}">• ${awardStr(a)}</div>`).join(''):''}
    ${vol.length?band('Volunteer Work')+vol.map((v:any,i:number)=>`<div class="job ${i%2===0?'job-even':'job-odd'}">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join(''):''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. STACKED-CARDS  (card-based experience entries with border-radius and shadow)
// ─────────────────────────────────────────────────────────────────────────────
function generateStackedCardsHTML(data: ParsedResumeData, p: Palette): string {
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
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{padding-bottom:14px;border-bottom:2px solid ${p.primary}20;margin-bottom:4px;}
    .name{font-size:26px;font-weight:800;color:${p.text};letter-spacing:-0.3px;margin-bottom:4px;}
    .htitle{font-size:10px;color:${p.primary};font-weight:600;margin-bottom:6px;}
    .contact{font-size:8px;color:${p.muted};}
    .sh{display:flex;align-items:center;gap:8px;margin:18px 0 10px;}
    .shbar{width:4px;height:14px;background:${p.primary};border-radius:2px;flex-shrink:0;}
    .shlbl{font-size:8px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1.5px;}
    .card{border-radius:8px;border:1px solid ${p.primary}20;border-left:4px solid ${p.primary};padding:12px 14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.06);background:#fff;}
    .jrow{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;}
    .jt{font-weight:700;font-size:10px;color:${p.text};}
    .jbadge{background:${p.primary}10;border-radius:20px;padding:2px 9px;font-size:7.5px;color:${p.primary};white-space:nowrap;font-weight:500;margin-left:8px;flex-shrink:0;}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .sumcard{background:${p.primary}08;border-radius:12px;padding:14px 18px;border-left:4px solid ${p.primary};}
    .chips{display:flex;flex-wrap:wrap;gap:5px;}
    .chip{background:${p.primary}10;border:1px solid ${p.primary}25;color:${p.primary};border-radius:6px;padding:3px 10px;font-size:7.5px;font-weight:600;}
    .edu{border-radius:8px;border:1px solid ${p.primary}20;border-left:4px solid ${p.primary};padding:10px 14px;margin-bottom:8px;background:#fff;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).join('  ·  ')}</div>
    </div>
    ${sum?`<div class="sh"><div class="shbar"></div><div class="shlbl">About</div></div><div class="sumcard"><p style="font-size:9px;color:${p.muted};line-height:1.65">${sum}</p></div>`:''}
    ${exp.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Experience</div></div>${exp.map(e=>`<div class="card"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jbadge">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}`:''}
    ${skills.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Skills</div></div><div class="chips">${(skills as any[]).map(s=>`<span class="chip">${skillStr(s)}</span>`).join('')}</div>`:''}
    ${edu.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Education</div></div>${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}`:''}
    ${certs.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Certifications</div></div><div class="chips">${certs.map((c:any)=>`<span class="chip">${certStr(c)}</span>`).join('')}</div>`:''}
    ${proj.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Projects</div></div>${proj.map((pr:any)=>`<div class="card"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div style="font-size:7.5px;color:${p.primary};font-weight:600;margin-top:3px">${pr.technologies.join(' · ')}</div>`:''}</div>`).join('')}`:''}
    ${langs.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Languages</div></div><div class="chips">${langs.map((l:string)=>`<span class="chip">${l}</span>`).join('')}</div>`:''}
    ${awards.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Awards</div></div>${awards.map((a:any)=>`<div style="font-size:9px;color:${p.muted};margin-bottom:4px">★ ${awardStr(a)}</div>`).join('')}`:''}
    ${vol.length?`<div class="sh"><div class="shbar"></div><div class="shlbl">Volunteer</div></div>${vol.map((v:any)=>`<div class="card">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jbadge">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. MONOGRAM  (large initials block, thin-weight name, drop-initial sections)
// ─────────────────────────────────────────────────────────────────────────────
function generateMonogramHTML(data: ParsedResumeData, p: Palette): string {
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

  const name = c.name || 'Your Name';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase() : (parts[0][0]||'Y').toUpperCase();

  const sh = (title: string) => {
    const fl = title.charAt(0).toUpperCase();
    const rest = title.slice(1).toUpperCase();
    return `<div style="display:flex;align-items:baseline;gap:1px;margin:20px 0 8px"><span style="font-size:16px;font-weight:700;color:${p.primary};line-height:1">${fl}</span><span style="font-size:8px;font-weight:700;color:${p.text};text-transform:uppercase;letter-spacing:1.5px">${rest}</span><div style="flex:1;height:1px;background:${p.primary}25;margin-left:8px;align-self:center"></div></div>`;
  };

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Georgia,'Times New Roman',serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{display:flex;align-items:center;gap:22px;padding-bottom:14px;}
    .mono{width:90px;height:90px;border:3px solid ${p.primary};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .mono-text{font-size:56px;font-weight:900;color:${p.primary};line-height:1;font-family:Arial,sans-serif;}
    .hname{font-size:24px;font-weight:300;color:${p.text};letter-spacing:1px;margin-bottom:3px;}
    .htitle{font-size:9px;color:${p.muted};font-style:italic;margin-bottom:6px;}
    .hcontact{font-size:8px;color:${p.muted};line-height:1.7;}
    .rule{height:2px;background:${p.primary}30;margin-bottom:4px;}
    .job{margin-bottom:14px;}
    .jrow{display:flex;justify-content:space-between;align-items:baseline;}
    .jt{font-weight:700;font-size:10px;}
    .jd{font-size:8px;color:${p.muted};font-style:italic;}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.6;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"—";margin-right:6px;color:${p.text};}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};font-style:italic;}
    .inline{font-size:9px;color:${p.text};line-height:2;}
  </style></head><body>
    <div class="hdr">
      <div class="mono"><span class="mono-text">${initials}</span></div>
      <div>
        <div class="hname">${name}</div>
        ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
        <div class="hcontact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).map(v=>`<div>${v}</div>`).join('')}</div>
      </div>
    </div>
    <div class="rule"></div>
    ${sum?sh('Profile')+`<p style="font-size:9px;color:${p.muted};line-height:1.7">${sum}</p>`:''}
    ${exp.length?sh('Experience')+exp.map(e=>`<div class="job"><div class="jrow"><span class="jt">${e.title||''}</span><span class="jd">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join(''):''}
    ${skills.length?sh('Competencies')+`<div class="inline">${(skills as any[]).map(s=>skillStr(s)).join('  ·  ')}</div>`:''}
    ${edu.length?sh('Education')+edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join(''):''}
    ${certs.length?sh('Certifications')+`<div class="inline">${certs.map((c:any)=>certStr(c)).join('  ·  ')}</div>`:''}
    ${proj.length?sh('Projects')+proj.map((pr:any)=>`<div class="job"><div class="jt">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join(''):''}
    ${langs.length?sh('Languages')+`<div class="inline">${langs.join('  ·  ')}</div>`:''}
    ${awards.length?sh('Awards')+awards.map((a:any)=>`<div class="b">${awardStr(a)}</div>`).join(''):''}
    ${vol.length?sh('Volunteer')+vol.map((v:any)=>`<div class="job">${typeof v==='string'?`<div class="b">${v}</div>`:`<div class="jrow"><span class="jt">${v.role||''}</span><span class="jd">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join(''):''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. TIMELINE-DOTS  (vertical timeline with date column left, spine, circle nodes)
// ─────────────────────────────────────────────────────────────────────────────
function generateTimelineDotsHTML(data: ParsedResumeData, p: Palette): string {
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

  const sh = (title: string) => `<div style="display:flex;align-items:center;gap:8px;margin:18px 0 10px"><div style="width:6px;height:6px;border-radius:50%;background:${p.primary};flex-shrink:0"></div><span style="font-size:8.5px;font-weight:700;color:${p.primary};text-transform:uppercase;letter-spacing:1.5px;flex:1;padding-bottom:3px;border-bottom:1px dashed ${p.primary}25">${title}</span></div>`;

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{padding-bottom:12px;}
    .name{font-size:26px;font-weight:700;color:${p.text};letter-spacing:-0.3px;margin-bottom:4px;}
    .htitle{font-size:10px;color:${p.primary};font-weight:600;margin-bottom:7px;}
    .contact{font-size:8px;color:${p.muted};}
    .rule{height:1px;background:${p.primary}25;margin-bottom:4px;}
    .tl{position:relative;padding-left:76px;}
    .tl-spine{position:absolute;left:52px;top:6px;bottom:6px;width:2px;background:${p.primary}30;}
    .tl-entry{position:relative;margin-bottom:18px;}
    .tl-date{position:absolute;left:-76px;width:46px;text-align:right;font-size:7.5px;color:${p.muted};line-height:1.4;}
    .tl-dot{position:absolute;left:-26px;top:4px;width:11px;height:11px;border-radius:50%;background:${p.primary};border:2px solid #fff;outline:1px solid ${p.primary};}
    .jt{font-weight:700;font-size:10px;color:${p.text};margin-bottom:2px;}
    .co{font-size:9px;color:${p.primary};font-weight:600;margin-bottom:4px;}
    .b{font-size:8.5px;line-height:1.55;margin:2px 0 2px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .sec{padding-left:14px;}
    .edu{margin-bottom:8px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
    .pill{display:inline-block;border:1px solid ${p.primary}40;color:${p.text};border-radius:4px;padding:2px 8px;font-size:7.5px;margin:2px 3px 2px 0;}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      <div class="contact">${[c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean).join('  ·  ')}</div>
    </div>
    <div class="rule"></div>
    ${sum?sh('Summary')+`<p style="font-size:9px;color:${p.muted};line-height:1.65;padding-left:14px">${sum}</p>`:''}
    ${exp.length?sh('Experience')+`<div class="tl"><div class="tl-spine"></div>${exp.map(e=>`<div class="tl-entry"><div class="tl-date">${e.startDate||''}<br/>${e.current?'Present':e.endDate||''}</div><div class="tl-dot"></div><div class="jt">${e.title||''}</div><div class="co">${e.company||''}${e.location?' · '+e.location:''}</div>${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div>`).join('')}</div>`:''}
    ${skills.length?sh('Skills')+`<div style="padding-left:14px">${(skills as any[]).map(s=>`<span class="pill">${skillStr(s)}</span>`).join('')}</div>`:''}
    ${edu.length?sh('Education')+`<div class="sec">${edu.map(e=>`<div class="edu"><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}${e.graduationDate?' · '+e.graduationDate:''}${e.gpa?' · GPA '+e.gpa:''}</div></div>`).join('')}</div>`:''}
    ${certs.length?sh('Certifications')+`<div style="padding-left:14px;display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">${certs.map((c:any)=>`<div style="font-size:9px;color:${p.muted}">• ${certStr(c)}</div>`).join('')}</div>`:''}
    ${proj.length?sh('Projects')+`<div class="sec">${proj.map((pr:any)=>`<div class="edu"><div class="deg">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join('')}</div>`:''}
    ${langs.length?sh('Languages')+`<div style="padding-left:14px;font-size:9px;color:${p.text}">${langs.join('  ·  ')}</div>`:''}
    ${awards.length?sh('Awards')+`<div class="sec">${awards.map((a:any)=>`<div style="font-size:9px;color:${p.muted};margin-bottom:4px">• ${awardStr(a)}</div>`).join('')}</div>`:''}
    ${vol.length?sh('Volunteer')+`<div class="sec">${vol.map((v:any)=>`<div class="edu">${typeof v==='string'?`<div class="b">${v}</div>`:`<div style="display:flex;justify-content:space-between"><span class="deg">${v.role||''}</span><span style="font-size:7.5px;color:${p.muted}">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div class="co">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join('')}</div>`:''}
  </body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. COMPACT-TABLE  (bordered table-style contact row, structured experience)
// ─────────────────────────────────────────────────────────────────────────────
function generateCompactTableHTML(data: ParsedResumeData, p: Palette): string {
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

  const band = (title: string) => `<div style="background:${p.primary}08;border:1px solid ${p.primary}20;border-left:3px solid ${p.primary};padding:4px 12px;margin-top:14px;color:${p.text};font-weight:700;text-transform:uppercase;letter-spacing:0.8px;font-size:8.5px">${title}</div>`;

  const contactCells = [c.email,c.phone,c.location,c.linkedin,c.github,c.website].filter(Boolean);

  return `<!DOCTYPE html><html><head><style>
    @page{size:A4;margin:36px 44px;}
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Calibri','Segoe UI',Arial,sans-serif;font-size:9.5px;color:${p.text};background:#fff;line-height:1.5;}
    .hdr{margin-bottom:10px;}
    .name{font-size:26px;font-weight:700;color:${p.primary};margin-bottom:4px;letter-spacing:-0.3px;}
    .htitle{font-size:9px;color:${p.muted};margin-bottom:7px;}
    .ctable{display:flex;border:1px solid ${p.primary}30;border-radius:2px;overflow:hidden;}
    .ccell{padding:4px 10px;font-size:7.5px;color:${p.muted};border-right:1px solid ${p.primary}20;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .ccell:last-child{border-right:none;}
    .expentry{border:1px solid #e5e7eb;margin-bottom:1px;}
    .exphdr{display:flex;justify-content:space-between;align-items:center;background:#f9fafb;border-bottom:1px solid #e5e7eb;padding:4px 12px;}
    .expco{font-weight:700;font-size:9.5px;}
    .expdate{font-size:7.5px;color:${p.muted};}
    .exptitle{padding:3px 12px 2px;font-size:9px;color:${p.primary};font-weight:600;}
    .expbullets{padding:3px 12px 8px;}
    .b{font-size:8.5px;line-height:1.55;margin:1px 0 1px 12px;color:${p.muted};}
    .b:before{content:"•";margin-right:6px;}
    .sgrid{padding:8px 0;display:grid;grid-template-columns:repeat(3,1fr);gap:3px 8px;}
    .si{border:1px solid ${p.primary}15;padding:2px 7px;font-size:8.5px;color:${p.text};}
    .edrow{display:flex;justify-content:space-between;align-items:baseline;padding:7px 12px;border:1px solid ${p.primary}15;margin-bottom:1px;}
    .deg{font-weight:700;font-size:10px;}
    .sch{font-size:8.5px;color:${p.muted};}
  </style></head><body>
    <div class="hdr">
      <div class="name">${c.name||'Your Name'}</div>
      ${exp.length?`<div class="htitle">${exp[0].title||''}</div>`:''}
      ${contactCells.length?`<div class="ctable">${contactCells.map(v=>`<div class="ccell">${v}</div>`).join('')}</div>`:''}
    </div>
    ${sum?band('Summary')+`<div style="padding:8px 12px;border:1px solid ${p.primary}15;border-top:none;font-size:9px;color:${p.muted};line-height:1.65">${sum}</div>`:''}
    ${exp.length?band('Professional Experience')+exp.map(e=>`<div class="expentry"><div class="exphdr"><span class="expco">${e.company||''}${e.location?' · '+e.location:''}</span><span class="expdate">${e.startDate||''} – ${e.current?'Present':e.endDate||''}</span></div><div class="exptitle">${e.title||''}</div><div class="expbullets">${(e.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}</div></div>`).join(''):''}
    ${skills.length?band('Skills')+`<div class="sgrid">${(skills as any[]).map(s=>`<div class="si">${skillStr(s)}</div>`).join('')}</div>`:''}
    ${edu.length?band('Education')+edu.map(e=>`<div class="edrow"><div><div class="deg">${e.degree||''}</div><div class="sch">${e.institution||''}</div></div><div style="text-align:right"><div class="sch">${e.graduationDate||''}</div>${e.gpa?`<div class="sch">GPA ${e.gpa}</div>`:''}</div></div>`).join(''):''}
    ${certs.length?band('Certifications')+`<div style="padding:8px 0;display:grid;grid-template-columns:1fr 1fr;gap:3px 14px">${certs.map((c:any)=>`<div style="font-size:8.5px;color:${p.muted}">• ${certStr(c)}</div>`).join('')}</div>`:''}
    ${proj.length?band('Projects')+proj.map((pr:any)=>`<div style="padding:7px 12px;border:1px solid ${p.primary}15;margin-bottom:1px"><div class="deg">${pr.name||''}</div>${pr.description?`<div class="b">${pr.description}</div>`:''}${pr.technologies?.length?`<div class="sch">Tech: ${pr.technologies.join(', ')}</div>`:''}</div>`).join(''):''}
    ${langs.length?band('Languages')+`<div style="padding:7px 0;font-size:9px;color:${p.text}">${langs.join('  ·  ')}</div>`:''}
    ${awards.length?band('Awards')+`<div style="padding:7px 0">${awards.map((a:any)=>`<div style="font-size:8.5px;color:${p.muted};margin-bottom:3px">• ${awardStr(a)}</div>`).join('')}</div>`:''}
    ${vol.length?band('Volunteer Work')+vol.map((v:any,i:number)=>`<div style="padding:7px 12px;border:1px solid ${p.primary}15;margin-bottom:1px">${typeof v==='string'?`<div class="b">${v}</div>`:`<div style="display:flex;justify-content:space-between"><span class="deg">${v.role||''}</span><span class="expdate">${v.startDate||''}${v.current?' – Present':v.endDate?' – '+v.endDate:''}</span></div><div style="font-size:9px;color:${p.primary};font-weight:600">${v.organization||''}</div>${(v.description||[]).map((d:string)=>`<div class="b">${d}</div>`).join('')}`}</div>`).join(''):''}
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
    case 'split-panel':    return generateSplitPanelHTML(data, palette);
    case 'ruled-elegant':  return generateRuledElegantHTML(data, palette);
    case 'top-accent':     return generateTopAccentHTML(data, palette);
    case 'column-split':   return generateColumnSplitHTML(data, palette);
    case 'bordered-page':  return generateBorderedPageHTML(data, palette);
    case 'dark-mode':      return generateDarkModeHTML(data, palette);
    case 'diagonal-hero':  return generateDiagonalHeroHTML(data, palette);
    case 'magazine':       return generateMagazineHTML(data, palette);
    case 'highlight-band': return generateHighlightBandHTML(data, palette);
    case 'stacked-cards':  return generateStackedCardsHTML(data, palette);
    case 'monogram':       return generateMonogramHTML(data, palette);
    case 'timeline-dots':  return generateTimelineDotsHTML(data, palette);
    case 'compact-table':  return generateCompactTableHTML(data, palette);
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
