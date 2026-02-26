/**
 * Resume thumbnail SVG generator — realistic text-based layout previews.
 * Shows actual readable resume content so users clearly understand each template's style.
 */

interface ThumbColors {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
  muted: string;
}

export function generateThumbnailSVG(
  layoutType: string,
  colors: ThumbColors,
  templateName: string
): string {
  const { primary, secondary, bg, text, muted } = colors;

  // ── Primitive helpers ────────────────────────────────────────────────────
  const R = (x: number, y: number, w: number, h: number, f: string, op: number, rx = 2) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" opacity="${op}"/>`;
  const C = (cx: number, cy: number, r: number, f: string, op: number) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" opacity="${op}"/>`;

  // Text helpers
  const T = (x: number, y: number, s: string, sz: number, f: string, ex = '') =>
    `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${sz}" fill="${f}" ${ex}>${s}</text>`;
  const TS = (x: number, y: number, s: string, sz: number, f: string, ex = '') =>
    `<text x="${x}" y="${y}" font-family="Georgia,serif" font-size="${sz}" fill="${f}" ${ex}>${s}</text>`;

  // Skill chip with text label (primary bg)
  const chipT = (x: number, y: number, label: string, w: number) =>
    R(x, y, w, 15, primary, 0.15, 7) +
    T(x + 6, y + 11, label, 7, primary, 'font-weight="500"');

  // Skill chip with white text (for dark-bg sidebars)
  const chipW = (x: number, y: number, label: string, w: number) =>
    R(x, y, w, 15, bg, 0.2, 7) +
    T(x + 6, y + 11, label, 7, bg, 'font-weight="500"');

  // Bullet point with text
  const bul = (x: number, y: number, s: string, f = text) =>
    T(x + 8, y, `\u2022 ${s}`, 7.5, f, 'opacity="0.7"');

  // Muted text (contact info, dates)
  const mut = (x: number, y: number, s: string) =>
    T(x, y, s, 7.5, muted, 'opacity="0.85"');

  // Tiny text for narrow sidebars
  const tiny = (x: number, y: number, s: string, f = text) =>
    T(x, y, s, 7, f, 'opacity="0.75"');

  // Section header: LABEL + horizontal rule
  const sec = (x: number, y: number, label: string, w = 350, f = primary) =>
    T(x, y, label, 9, f, 'font-weight="bold" letter-spacing="1"') +
    R(x, y + 5, w, 1, f, 0.2, 0);

  // Small section header for sidebars
  const secS = (x: number, y: number, label: string, w = 110, f = primary) =>
    T(x, y, label, 7.5, f, 'font-weight="bold" letter-spacing="0.5"') +
    R(x, y + 4, w, 1, f, 0.25, 0);

  // Job entry with real text (company, role, bullet lines, date right-aligned)
  const job = (x: number, y: number, company: string, role: string, bullets: string[], date: string, w = 350) => {
    let s = T(x, y, company, 9, text, 'font-weight="600"');
    s += T(x + w - 5, y, date, 8, muted, 'text-anchor="end" opacity="0.75"');
    s += T(x, y + 13, role, 9, primary);
    bullets.forEach((b, i) => { s += bul(x, y + 25 + i * 10, b); });
    return s;
  };

  // Photo silhouette: ring + head + shoulders, clipped to circle
  const photo = (cx: number, cy: number, r: number, fill: string) => {
    const hr  = Math.round(r * 0.38);
    const hcy = Math.round(cy - r * 0.12);
    const srx = Math.round(r * 0.82);
    const sry = Math.round(r * 0.48);
    const scy = Math.round(cy + r * 0.65);
    const uid = `${cx}x${cy}`;
    return `<clipPath id="ph${uid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="0.12"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fill}" stroke-width="1.5" opacity="0.55"/>`
      + `<circle cx="${cx}" cy="${hcy}" r="${hr}" fill="${fill}" opacity="0.65" clip-path="url(#ph${uid})"/>`
      + `<ellipse cx="${cx}" cy="${scy}" rx="${srx}" ry="${sry}" fill="${fill}" opacity="0.5" clip-path="url(#ph${uid})"/>`;
  };

  let body = '';

  switch (layoutType) {

    // ── Two-column sidebar (32% tinted sidebar, name in sidebar) ──────────
    case 'two-sidebar':
      body = `
        ${R(0, 0, 128, 560, primary, 0.1, 0)}
        ${photo(64, 42, 28, primary)}
        ${T(64, 84, 'Alex Morgan', 10, primary, 'text-anchor="middle" font-weight="600"')}
        ${T(64, 96, 'Sr. Software Engineer', 8, muted, 'text-anchor="middle"')}
        ${secS(8, 115, 'CONTACT', 112)}
        ${tiny(8, 127, 'alex@email.com')}
        ${tiny(8, 138, '(555) 234-5678')}
        ${tiny(8, 149, 'San Francisco, CA')}
        ${tiny(8, 160, 'linkedin.com/in/alex')}
        ${secS(8, 178, 'SKILLS', 112)}
        ${chipT(8, 183, 'Python', 52)} ${chipT(64, 183, 'React', 44)}
        ${chipT(8, 202, 'Node.js', 52)} ${chipT(64, 202, 'TypeScript', 60)}
        ${chipT(8, 221, 'AWS', 36)} ${chipT(48, 221, 'Docker', 50)}
        ${secS(8, 247, 'CERTIFICATIONS', 112)}
        ${tiny(8, 258, 'AWS Solutions Architect')}
        ${tiny(8, 269, 'Google Cloud Engineer')}
        ${secS(8, 288, 'AWARDS', 112)}
        ${tiny(8, 299, 'Engineer of Year 2023')}
        ${tiny(8, 310, 'Innovation Award 2022')}
        <g transform="translate(138, 0)">
          ${sec(0, 20, 'EXPERIENCE', 262)}
          ${job(0, 35, 'Tech Company Inc.', 'Senior Software Engineer', ['Built APIs serving 5M+ daily requests', 'Led team of 6, cut deploy time 60%', 'Reduced latency 40% via optimization'], '2021–Now', 262)}
          ${job(0, 104, 'Startup Corp', 'Software Engineer', ['Full-stack React/Node.js, 10k+ users', 'CI/CD pipeline, 80% test coverage'], '2018–2021', 262)}
          ${sec(0, 153, 'PROJECTS', 262)}
          ${bul(0, 163, 'cli-toolkit — 2.4k GitHub stars')}
          ${bul(0, 173, 'E-commerce platform, 50k+ users/mo')}
          ${sec(0, 196, 'EDUCATION', 262)}
          ${T(0, 210, 'Stanford University', 9, text, 'font-weight="600"')}
          ${mut(190, 210, '2018')}
          ${T(0, 222, 'B.S. Computer Science', 9, primary)}
        </g>`;
      break;

    // ── Bold modern (dark full-width header) ──────────────────────────────
    case 'bold-modern':
      body = `
        ${R(0, 0, 400, 100, primary, 0.95, 0)}
        ${photo(363, 50, 28, bg)}
        ${T(25, 38, 'ALEX MORGAN', 20, bg, 'font-weight="bold" letter-spacing="2"')}
        ${T(25, 55, 'Senior Software Engineer', 11, bg, 'opacity="0.85"')}
        ${T(25, 70, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA', 7.5, bg, 'opacity="0.65"')}
        ${R(0, 100, 400, 7, secondary, 0.5, 0)}
        ${sec(25, 120, 'EXPERIENCE')}
        ${job(25, 135, 'Tech Company Inc.', 'Senior Software Engineer', ['Built scalable APIs serving 5M+ daily requests', 'Led 6-engineer team, cut deploy time by 60%', 'Architected microservices for 99.9% uptime'], '2021–Present')}
        ${job(25, 204, 'Startup Corp', 'Software Engineer', ['Developed React/Node.js SaaS, 10k+ users', 'CI/CD automation, cut release cycle 50%'], '2018–2021')}
        ${sec(25, 252, 'SKILLS')}
        ${chipT(25, 262, 'Python', 52)} ${chipT(81, 262, 'React', 44)} ${chipT(129, 262, 'Node.js', 54)} ${chipT(187, 262, 'TypeScript', 68)} ${chipT(259, 262, 'AWS', 36)} ${chipT(299, 262, 'Docker', 50)}
        ${chipT(25, 282, 'PostgreSQL', 68)} ${chipT(97, 282, 'GraphQL', 58)} ${chipT(159, 282, 'Redis', 42)} ${chipT(205, 282, 'Kubernetes', 68)} ${chipT(277, 282, 'Go', 30)}
        ${sec(25, 314, 'EDUCATION')}
        ${T(25, 328, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 328, '2018')}
        ${T(25, 340, 'B.S. Computer Science', 9, primary)}
        ${sec(25, 362, 'CERTIFICATIONS')}
        ${bul(25, 372, 'AWS Solutions Architect \u2013 Professional')}
        ${bul(25, 382, 'Google Cloud Professional Engineer')}
        ${bul(25, 392, 'Certified Kubernetes Administrator')}`;
      break;

    // ── Classic (centered serif header, double rule) ──────────────────────
    case 'classic':
      body = `
        ${R(0, 0, 400, 78, primary, 0.06, 0)}
        ${photo(361, 36, 22, primary)}
        ${TS(200, 36, 'Alex Morgan', 22, primary, 'text-anchor="middle" font-weight="bold"')}
        ${R(0, 46, 400, 1.5, primary, 0.4, 0)}
        ${T(200, 58, 'Senior Software Engineer  \u2022  San Francisco, CA', 9, muted, 'text-anchor="middle"')}
        ${T(200, 70, 'alex@email.com  \u2022  (555) 234-5678  \u2022  github.com/alex', 8, muted, 'text-anchor="middle" opacity="0.75"')}
        ${R(0, 78, 400, 1.5, primary, 0.4, 0)}
        ${sec(25, 95, 'EXPERIENCE')}
        ${job(25, 110, 'Tech Company Inc.', 'Senior Software Engineer', ['Built high-traffic APIs serving 5M+ daily requests', 'Led team of 6 on cloud migration project', 'Reduced latency by 40% through query caching'], '2021–Present')}
        ${job(25, 179, 'Previous Company', 'Software Engineer', ['Built full-stack web apps for 10k+ active users', 'Automated testing, achieved 80% coverage'], '2018–2021')}
        ${sec(25, 227, 'EDUCATION')}
        ${T(25, 241, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 241, '2018')}
        ${T(25, 253, 'B.S. Computer Science  \u2022  GPA: 3.9 / 4.0', 9, primary)}
        ${sec(25, 277, 'SKILLS')}
        ${chipT(25, 287, 'Python', 52)} ${chipT(81, 287, 'JavaScript', 70)} ${chipT(155, 287, 'React', 44)} ${chipT(203, 287, 'Node.js', 54)} ${chipT(261, 287, 'AWS', 36)} ${chipT(301, 287, 'SQL', 34)}
        ${chipT(25, 307, 'Docker', 50)} ${chipT(79, 307, 'TypeScript', 68)} ${chipT(151, 307, 'Redis', 42)} ${chipT(197, 307, 'GraphQL', 58)} ${chipT(259, 307, 'Git', 34)}
        ${sec(25, 340, 'CERTIFICATIONS')}
        ${bul(25, 351, 'AWS Solutions Architect \u2013 Professional  \u2022  2023')}
        ${bul(25, 361, 'Google Cloud Professional Engineer  \u2022  2022')}`;
      break;

    // ── Contemporary (rich colored header) ───────────────────────────────
    case 'contemporary':
      body = `
        ${R(0, 0, 400, 108, primary, 0.92, 0)}
        ${photo(362, 54, 30, bg)}
        ${T(25, 36, 'Alex Morgan', 22, bg, 'font-weight="bold"')}
        ${T(25, 52, 'Senior Software Engineer', 11, bg, 'opacity="0.85"')}
        ${R(25, 62, 195, 4, secondary, 0.7, 2)}
        ${T(25, 76, 'alex@email.com  \u2022  San Francisco, CA', 8, bg, 'opacity="0.7"')}
        ${T(25, 88, 'linkedin.com/in/alex  \u2022  (555) 234-5678', 8, bg, 'opacity="0.6"')}
        ${T(25, 100, 'github.com/alexmorgan  \u2022  alexmorgan.io', 8, bg, 'opacity="0.5"')}
        ${sec(25, 122, 'EXPERIENCE')}
        ${job(25, 137, 'Tech Company Inc.', 'Senior Software Engineer', ['Built microservices serving 5M+ daily requests', 'Led 6-engineer team on cloud migration', 'Reduced latency 40% via query optimization'], '2021–Present')}
        ${job(25, 206, 'Previous Company', 'Software Engineer', ['Built React/Node.js SaaS, 10k+ active users', 'CI/CD pipeline, reduced release cycle 50%'], '2018–2021')}
        ${R(25, 250, 350, 2, secondary, 0.3, 0)}
        ${sec(25, 264, 'SKILLS')}
        ${chipT(25, 274, 'Python', 52)} ${chipT(81, 274, 'React', 44)} ${chipT(129, 274, 'Node.js', 54)} ${chipT(187, 274, 'TypeScript', 68)} ${chipT(259, 274, 'AWS', 36)} ${chipT(299, 274, 'Docker', 50)}
        ${chipT(25, 294, 'PostgreSQL', 68)} ${chipT(97, 294, 'GraphQL', 58)} ${chipT(159, 294, 'Redis', 42)} ${chipT(205, 294, 'Kubernetes', 68)}
        ${sec(25, 328, 'EDUCATION')}
        ${T(25, 342, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 342, '2018')}
        ${T(25, 354, 'B.S. Computer Science', 9, primary)}`;
      break;

    // ── Academic (centered formal) ────────────────────────────────────────
    case 'academic':
      body = `
        ${photo(364, 28, 22, primary)}
        ${TS(200, 30, 'Alex Morgan, Ph.D.', 20, primary, 'text-anchor="middle" font-weight="bold"')}
        ${T(200, 46, 'Professor of Computer Science  \u2022  Research Fellow', 9, muted, 'text-anchor="middle"')}
        ${T(200, 58, 'Stanford University  \u2022  alex@stanford.edu  \u2022  (650) 555-0100', 8, muted, 'text-anchor="middle" opacity="0.8"')}
        ${R(25, 66, 350, 2, primary, 0.5, 0)}
        ${sec(25, 82, 'RESEARCH EXPERIENCE')}
        ${job(25, 97, 'Stanford University', 'Principal Investigator, AI Lab', ['Led research team of 12 on NLP and ML optimization', 'Secured $2.4M NSF grant for distributed systems', 'Published 18 peer-reviewed papers, 1,200+ citations'], '2019–Present')}
        ${job(25, 166, 'MIT Research Laboratory', 'Postdoctoral Researcher', ['Designed novel algorithms for graph neural networks', 'Collaborated with industry on applied ML projects'], '2017–2019')}
        ${sec(25, 214, 'PUBLICATIONS')}
        ${bul(25, 224, '"Advances in Distributed Systems" \u2014 Nature Comp. Sci., 2023')}
        ${bul(25, 234, '"Neural Network Optimization at Scale" \u2014 ICML, 2022')}
        ${bul(25, 244, '"Federated Learning Frameworks" \u2014 NeurIPS, 2021')}
        ${sec(25, 266, 'EDUCATION')}
        ${T(25, 280, 'Harvard University', 9, text, 'font-weight="600"')} ${mut(248, 280, '2017')}
        ${T(25, 292, 'Ph.D. Computer Science  \u2022  Thesis: Distributed ML Systems', 9, primary)}
        ${sec(25, 314, 'SKILLS & EXPERTISE')}
        ${chipT(25, 324, 'Python', 52)} ${chipT(81, 324, 'TensorFlow', 68)} ${chipT(153, 324, 'PyTorch', 54)} ${chipT(211, 324, 'R', 22)} ${chipT(237, 324, 'MATLAB', 52)} ${chipT(293, 324, 'LaTeX', 44)}
        ${chipT(25, 344, 'Statistics', 62)} ${chipT(91, 344, 'NLP', 34)} ${chipT(129, 344, 'Computer Vision', 94)} ${chipT(227, 344, 'Federated Learning', 108)}`;
      break;

    // ── Minimal (ultra-clean, thin lines) ────────────────────────────────
    case 'minimal':
      body = `
        ${R(30, 22, 340, 1.5, primary, 0.35, 0)}
        ${photo(363, 48, 22, primary)}
        ${T(30, 46, 'Alex Morgan', 22, text, 'font-weight="300" letter-spacing="3"')}
        ${T(30, 62, 'SENIOR SOFTWARE ENGINEER', 8, primary, 'letter-spacing="2"')}
        ${mut(30, 74, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA')}
        ${R(30, 81, 340, 1.5, primary, 0.35, 0)}
        ${T(30, 100, 'Experience', 10, primary, 'font-weight="600"')}
        ${job(30, 115, 'Tech Company Inc.', 'Senior Software Engineer', ['Built scalable APIs serving 5M+ daily requests', 'Led team of 6, reduced deploy time by 60%', 'Reduced latency 40% via query optimization'], '2021–Present', 340)}
        ${job(30, 184, 'Previous Company', 'Software Engineer', ['Developed React/Node.js SaaS for 10k+ users', 'Automated testing pipeline, 80% code coverage'], '2018–2021', 340)}
        ${R(30, 228, 340, 1, text, 0.12, 0)}
        ${T(30, 246, 'Education', 10, primary, 'font-weight="600"')}
        ${T(30, 261, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(245, 261, '2018')}
        ${T(30, 273, 'B.S. Computer Science', 9, muted)}
        ${R(30, 288, 340, 1, text, 0.12, 0)}
        ${T(30, 307, 'Skills', 10, primary, 'font-weight="600"')}
        ${chipT(30, 321, 'Python', 52)} ${chipT(86, 321, 'React', 44)} ${chipT(134, 321, 'Node.js', 54)} ${chipT(192, 321, 'TypeScript', 68)} ${chipT(264, 321, 'AWS', 36)} ${chipT(304, 321, 'SQL', 34)}
        ${chipT(30, 341, 'Docker', 50)} ${chipT(84, 341, 'GraphQL', 58)} ${chipT(146, 341, 'Redis', 42)} ${chipT(192, 341, 'Kubernetes', 68)} ${chipT(264, 341, 'Go', 30)}
        ${R(30, 375, 340, 1.5, primary, 0.35, 0)}`;
      break;

    // ── Professional (corporate, photo top-right) ─────────────────────────
    case 'professional':
      body = `
        ${R(0, 0, 400, 85, primary, 0.08, 0)}
        ${photo(340, 45, 30, primary)}
        ${T(25, 30, 'Alex Morgan', 20, primary, 'font-weight="bold"')}
        ${T(25, 46, 'Senior Software Engineer', 11, muted)}
        ${mut(25, 58, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA')}
        ${sec(25, 100, 'EXPERIENCE')}
        ${job(25, 115, 'Tech Company Inc.', 'Senior Software Engineer', ['Built APIs serving 5M+ daily requests', 'Led team of 6, cut deploy time by 60%', 'Reduced system latency 40% via optimization'], '2021–Present')}
        ${job(25, 184, 'Previous Company', 'Software Engineer', ['Developed full-stack SaaS for 10k+ users', 'CI/CD automation, reduced release cycle 50%'], '2018–2021')}
        ${sec(25, 232, 'SKILLS')}
        ${chipT(25, 242, 'Python', 52)} ${chipT(81, 242, 'React', 44)} ${chipT(129, 242, 'Node.js', 54)} ${chipT(187, 242, 'TypeScript', 68)} ${chipT(259, 242, 'AWS', 36)} ${chipT(299, 242, 'Docker', 50)}
        ${chipT(25, 262, 'PostgreSQL', 68)} ${chipT(97, 262, 'GraphQL', 58)} ${chipT(159, 262, 'Redis', 42)} ${chipT(205, 262, 'Kubernetes', 68)}
        ${sec(25, 290, 'EDUCATION')}
        ${T(25, 304, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 304, '2018')}
        ${T(25, 316, 'B.S. Computer Science', 9, primary)}
        ${sec(25, 337, 'CERTIFICATIONS')}
        ${bul(25, 347, 'AWS Solutions Architect \u2013 Professional  \u2022  2023')}
        ${bul(25, 357, 'Google Cloud Professional Engineer  \u2022  2022')}
        ${bul(25, 367, 'Certified Kubernetes Administrator  \u2022  2022')}`;
      break;

    // ── Tech (dark header + accent stripe, left border bars) ─────────────
    case 'tech':
      body = `
        ${R(0, 0, 400, 96, primary, 0.95, 0)}
        ${R(0, 86, 400, 10, secondary, 0.5, 0)}
        ${photo(363, 47, 29, bg)}
        ${T(25, 36, 'Alex Morgan', 20, bg, 'font-weight="bold"')}
        ${T(25, 52, 'Full-Stack Engineer  \u2022  Open Source Contributor', 10, bg, 'opacity="0.85"')}
        ${T(25, 68, 'alex@email.com  \u2022  github.com/alex  \u2022  San Francisco, CA', 7.5, bg, 'opacity="0.6"')}
        ${R(4, 110, 4, 62, primary, 0.7, 2)}
        ${sec(18, 108, 'EXPERIENCE', 370)}
        ${job(18, 123, 'Tech Company Inc.', 'Senior Software Engineer', ['Built microservices serving 5M+ daily requests', 'Led 6-engineer team, reduced deploy time 60%', 'Architected real-time event system with Kafka'], '2021–Present', 370)}
        ${R(4, 194, 4, 54, primary, 0.7, 2)}
        ${job(18, 197, 'Startup Corp', 'Software Engineer', ['Full-stack React/Node.js platform, 10k+ users', 'CI/CD pipeline, 80% test coverage achieved'], '2018–2021', 370)}
        ${R(0, 258, 400, 32, primary, 0.07, 0)}
        ${sec(18, 266, 'TECHNICAL SKILLS', 370)}
        ${chipT(18, 276, 'React', 44)} ${chipT(66, 276, 'TypeScript', 68)} ${chipT(138, 276, 'Node.js', 54)} ${chipT(196, 276, 'Python', 52)} ${chipT(252, 276, 'AWS', 36)} ${chipT(292, 276, 'Kubernetes', 68)} ${chipT(364, 276, 'Go', 30)}
        ${chipT(18, 296, 'PostgreSQL', 68)} ${chipT(90, 296, 'Redis', 42)} ${chipT(136, 296, 'Kafka', 44)} ${chipT(184, 296, 'Docker', 50)} ${chipT(238, 296, 'GraphQL', 58)} ${chipT(300, 296, 'Terraform', 64)}
        ${sec(18, 326, 'EDUCATION', 370)}
        ${T(18, 340, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(285, 340, '2018')}
        ${T(18, 352, 'B.S. Computer Science', 9, primary)}
        ${sec(18, 372, 'OPEN SOURCE & PROJECTS', 370)}
        ${bul(18, 382, 'cli-toolkit \u2014 2.4k GitHub stars, 50k+ downloads')}
        ${bul(18, 392, 'react-query-cache \u2014 800+ stars, used in production')}`;
      break;

    // ── Compact (dense, 3 job entries visible) ────────────────────────────
    case 'compact':
      body = `
        ${R(0, 0, 400, 62, primary, 0.08, 0)}
        ${photo(363, 32, 20, primary)}
        ${T(25, 24, 'Alex Morgan', 18, primary, 'font-weight="bold"')}
        ${T(25, 38, 'Senior Software Engineer', 10, muted)}
        ${mut(25, 50, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA')}
        ${sec(25, 70, 'EXPERIENCE')}
        ${job(25, 85, 'Tech Company Inc.', 'Senior Engineer', ['Built APIs serving 5M+ requests/day', 'Led team of 6, deploy time cut 60%'], '2021–Present')}
        ${job(25, 130, 'Startup Corp', 'Software Engineer', ['React/Node.js SaaS, 10k+ users', 'CI/CD pipeline, 80% test coverage'], '2018–2021')}
        ${job(25, 175, 'Earlier Company', 'Junior Developer', ['Built internal tooling for 200+ staff', 'Migrated legacy system to modern stack'], '2016–2018')}
        ${sec(25, 220, 'SKILLS')}
        ${chipT(25, 230, 'Python', 52)} ${chipT(81, 230, 'React', 44)} ${chipT(129, 230, 'Node.js', 54)} ${chipT(187, 230, 'TypeScript', 68)} ${chipT(259, 230, 'AWS', 36)} ${chipT(299, 230, 'Docker', 50)} ${chipT(353, 230, 'SQL', 34)}
        ${chipT(25, 250, 'PostgreSQL', 68)} ${chipT(97, 250, 'GraphQL', 58)} ${chipT(159, 250, 'Redis', 42)} ${chipT(205, 250, 'Kubernetes', 68)}
        ${sec(25, 278, 'EDUCATION')}
        ${T(25, 292, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 292, '2016')}
        ${T(25, 304, 'B.S. Computer Science', 9, primary)}
        ${sec(25, 323, 'CERTIFICATIONS')}
        ${bul(25, 333, 'AWS Solutions Architect \u2013 Professional')}
        ${bul(25, 343, 'Google Cloud Professional Engineer')}
        ${sec(25, 363, 'PROJECTS')}
        ${bul(25, 373, 'Open source CLI tool \u2014 2.4k GitHub stars')}
        ${bul(25, 383, 'E-commerce platform, 50k+ monthly users')}`;
      break;

    // ── Timeline (vertical spine with circles) ────────────────────────────
    case 'timeline':
      body = `
        ${photo(363, 36, 26, primary)}
        ${T(30, 28, 'Alex Morgan', 20, primary, 'font-weight="bold"')}
        ${T(30, 44, 'Senior Software Engineer', 11, muted)}
        ${R(30, 52, 340, 1, primary, 0.25, 0)}
        ${mut(30, 63, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA')}
        ${sec(30, 82, 'EXPERIENCE', 340)}
        ${R(56, 96, 2, 296, primary, 0.28, 0)}
        ${C(57, 108, 6.5, primary, 0.85)} ${T(72, 113, 'Tech Company Inc.', 9, text, 'font-weight="600"')} ${mut(275, 113, '2021–Present')}
        ${T(72, 125, 'Senior Software Engineer', 9, primary)}
        ${bul(64, 135, 'APIs serving 5M+ daily requests')}
        ${bul(64, 145, 'Led team of 6, cut deploy time 60%')}
        ${bul(64, 155, 'Reduced latency 40% via optimization')}
        ${C(57, 174, 6.5, primary, 0.85)} ${T(72, 179, 'Startup Corp', 9, text, 'font-weight="600"')} ${mut(252, 179, '2018–2021')}
        ${T(72, 191, 'Software Engineer', 9, primary)}
        ${bul(64, 201, 'Full-stack React/Node.js, 10k+ users')}
        ${bul(64, 211, 'CI/CD implementation, 80% test coverage')}
        ${C(57, 231, 6.5, primary, 0.85)} ${T(72, 236, 'Earlier Company', 9, text, 'font-weight="600"')} ${mut(254, 236, '2016–2018')}
        ${T(72, 248, 'Junior Developer', 9, primary)}
        ${bul(64, 258, 'Built tooling used by 200+ employees')}
        ${bul(64, 268, 'Migrated legacy PHP to modern stack')}
        ${C(57, 288, 5.5, secondary, 0.6)} ${T(72, 293, 'First Company', 9, text, 'font-weight="600"')} ${mut(252, 293, '2014–2016')}
        ${T(72, 305, 'Intern', 9, primary)}
        ${sec(30, 324, 'SKILLS', 340)}
        ${chipT(30, 334, 'Python', 52)} ${chipT(86, 334, 'React', 44)} ${chipT(134, 334, 'Node.js', 54)} ${chipT(192, 334, 'TypeScript', 68)} ${chipT(264, 334, 'AWS', 36)} ${chipT(304, 334, 'Docker', 50)}
        ${chipT(30, 354, 'PostgreSQL', 68)} ${chipT(102, 354, 'GraphQL', 58)} ${chipT(164, 354, 'Redis', 42)} ${chipT(210, 354, 'Kubernetes', 68)}`;
      break;

    // ── Portfolio (centered photo, 2×2 project grid) ──────────────────────
    case 'portfolio':
      body = `
        ${photo(200, 48, 42, primary)}
        ${TS(200, 104, 'Alex Morgan', 20, primary, 'text-anchor="middle" font-weight="bold"')}
        ${T(200, 120, 'UX Designer  \u2022  Creative Director', 11, muted, 'text-anchor="middle"')}
        ${T(200, 132, 'portfolio@alex.com  \u2022  alexmorgan.io  \u2022  dribbble.com/alex', 8, muted, 'text-anchor="middle" opacity="0.75"')}
        ${sec(25, 152, 'FEATURED PROJECTS', 350)}
        ${R(25, 162, 170, 72, primary, 0.08, 4)} ${R(205, 162, 170, 72, primary, 0.08, 4)}
        ${T(33, 177, 'Fintech App Redesign', 8, primary, 'font-weight="600"')}
        ${T(33, 189, 'End-to-end UX, 35% drop in churn', 7.5, text, 'opacity="0.65"')}
        ${T(33, 199, 'Figma \u2022 Research \u2022 Prototyping', 7, muted, 'opacity="0.8"')}
        ${T(33, 210, '2023  \u2022  UX Awards Finalist', 7, muted, 'opacity="0.7"')}
        ${T(213, 177, 'E-commerce Rebrand', 8, primary, 'font-weight="600"')}
        ${T(213, 189, 'Visual identity for $50M brand', 7.5, text, 'opacity="0.65"')}
        ${T(213, 199, 'Illustration \u2022 Brand \u2022 Motion', 7, muted, 'opacity="0.8"')}
        ${T(213, 210, '2022  \u2022  Webby Award Winner', 7, muted, 'opacity="0.7"')}
        ${R(25, 242, 170, 72, primary, 0.08, 4)} ${R(205, 242, 170, 72, primary, 0.08, 4)}
        ${T(33, 257, 'Healthcare Dashboard', 8, primary, 'font-weight="600"')}
        ${T(33, 269, 'Data viz for clinical teams', 7.5, text, 'opacity="0.65"')}
        ${T(33, 279, 'D3.js \u2022 React \u2022 Accessibility', 7, muted, 'opacity="0.8"')}
        ${T(213, 257, 'Mobile Banking App', 8, primary, 'font-weight="600"')}
        ${T(213, 269, 'Designed & shipped in 8 weeks', 7.5, text, 'opacity="0.65"')}
        ${T(213, 279, 'Figma \u2022 Swift UI \u2022 A/B Testing', 7, muted, 'opacity="0.8"')}
        ${sec(25, 325, 'EXPERIENCE', 350)}
        ${job(25, 340, 'Creative Agency Inc.', 'Senior UX Designer', ['Led design for 15+ client projects, $2M+ ARR', 'Built design system used by team of 20'], '2020–Present')}
        ${sec(25, 390, 'SKILLS')}
        ${chipT(25, 400, 'Figma', 44)} ${chipT(73, 400, 'Sketch', 46)} ${chipT(123, 400, 'Photoshop', 64)} ${chipT(191, 400, 'Illustrator', 72)} ${chipT(267, 400, 'Motion', 52)} ${chipT(323, 400, 'CSS', 34)}`;
      break;

    // ── Creative (full-height left color sidebar, right main content) ────
    case 'creative':
      body = `
        ${R(0, 0, 148, 560, primary, 0.9, 0)}
        ${photo(74, 52, 32, bg)}
        ${secS(10, 96, 'CONTACT', 128, bg)}
        ${tiny(10, 110, 'alex@email.com', bg)}
        ${tiny(10, 121, '(555) 234-5678', bg)}
        ${tiny(10, 132, 'San Francisco, CA', bg)}
        ${tiny(10, 143, 'linkedin.com/in/alex', bg)}
        ${secS(10, 163, 'SKILLS', 128, bg)}
        ${chipW(10, 168, 'Figma', 44)} ${chipW(58, 168, 'Sketch', 46)}
        ${chipW(10, 187, 'Photoshop', 62)} ${chipW(76, 187, 'CSS', 36)}
        ${chipW(10, 206, 'Illustrator', 72)} ${chipW(86, 206, 'UX', 30)}
        ${secS(10, 234, 'EDUCATION', 128, bg)}
        ${tiny(10, 245, 'RISD', bg)}
        ${tiny(10, 256, 'BFA Graphic Design', bg)}
        ${tiny(10, 267, '2016', bg)}
        ${secS(10, 287, 'AWARDS', 128, bg)}
        ${tiny(10, 298, 'Webby Award 2023', bg)}
        ${tiny(10, 309, 'D&AD Pencil 2022', bg)}
        ${tiny(10, 320, 'AIGA 50/50 2021', bg)}
        <g transform="translate(158, 0)">
          ${R(0, 0, 242, 82, primary, 0.06, 0)}
          ${R(0, 0, 4, 82, secondary, 0.7, 0)}
          ${T(12, 28, 'Alex Morgan', 18, primary, 'font-weight="bold"')}
          ${T(12, 44, 'Creative Director', 10, secondary)}
          ${mut(12, 57, 'Creative Agency Inc.  \u2022  8 yrs exp')}
          ${mut(12, 68, 'Open to: Brand, Product, Art Direction')}
          ${sec(12, 100, 'EXPERIENCE', 230)}
          ${job(12, 115, 'Creative Agency Inc.', 'Creative Director', ['Led brand redesign for $50M consumer brand', 'Managed team of 8 designers and copywriters', 'Launched 24 campaigns, avg 22% sales uplift'], '2019–Present', 230)}
          ${job(12, 184, 'Design Studio', 'Senior Designer', ['Led visual identity for 15+ client brands', 'Produced award-winning packaging design'], '2016–2019', 230)}
          ${sec(12, 232, 'PROJECTS', 230)}
          ${bul(12, 242, 'Fintech App \u2014 Webby Award 2023')}
          ${bul(12, 252, 'E-commerce rebrand \u2014 D&AD Pencil')}
        </g>`;
      break;

    // ── Infographic (left tinted sidebar with skill bars, right main) ─────
    case 'infographic':
      body = `
        ${R(0, 0, 138, 560, primary, 0.12, 0)}
        ${photo(69, 46, 28, primary)}
        ${secS(8, 88, 'CONTACT', 122)}
        ${tiny(8, 100, 'alex@email.com')}
        ${tiny(8, 111, '(555) 234-5678')}
        ${tiny(8, 122, 'San Francisco, CA')}
        ${secS(8, 142, 'SKILLS', 122)}
        ${tiny(8, 153, 'Python')} ${R(44, 148, 86, 8, text, 0.08, 3)} ${R(44, 148, 74, 8, primary, 0.55, 3)}
        ${tiny(8, 166, 'SQL')} ${R(44, 161, 86, 8, text, 0.08, 3)} ${R(44, 161, 62, 8, primary, 0.55, 3)}
        ${tiny(8, 179, 'Tableau')} ${R(44, 174, 86, 8, text, 0.08, 3)} ${R(44, 174, 78, 8, primary, 0.55, 3)}
        ${tiny(8, 192, 'Power BI')} ${R(44, 187, 86, 8, text, 0.08, 3)} ${R(44, 187, 54, 8, primary, 0.55, 3)}
        ${tiny(8, 205, 'Spark')} ${R(44, 200, 86, 8, text, 0.08, 3)} ${R(44, 200, 46, 8, primary, 0.55, 3)}
        ${secS(8, 224, 'EDUCATION', 122)}
        ${tiny(8, 235, 'MIT')}
        ${tiny(8, 246, 'M.S. Data Science')}
        ${tiny(8, 257, '2018')}
        ${secS(8, 276, 'LANGUAGES', 122)}
        ${tiny(8, 287, 'English (Native)')}
        ${tiny(8, 298, 'Spanish (Fluent)')}
        <g transform="translate(148, 0)">
          ${T(0, 24, 'Alex Morgan', 18, primary, 'font-weight="bold"')}
          ${T(0, 40, 'Senior Data Analyst  \u2022  BI Lead', 10, muted)}
          ${mut(0, 52, 'alex@bi.com  \u2022  San Francisco, CA')}
          ${R(0, 60, 252, 1, primary, 0.25, 0)}
          ${R(0, 68, 78, 46, primary, 0.08, 4)} ${R(82, 68, 78, 46, primary, 0.08, 4)} ${R(164, 68, 78, 46, primary, 0.08, 4)}
          ${R(8, 79, 60, 8, primary, 0.55, 3)} ${T(8, 93, '5.2M rows/day', 7, text, 'opacity="0.65"')} ${T(8, 103, 'Data Processed', 6.5, muted, 'opacity="0.75"')}
          ${R(90, 79, 60, 8, primary, 0.55, 3)} ${T(90, 93, '$4.8M savings', 7, text, 'opacity="0.65"')} ${T(90, 103, 'Cost Reduction', 6.5, muted, 'opacity="0.75"')}
          ${R(172, 79, 60, 8, primary, 0.55, 3)} ${T(172, 93, '99.7% accuracy', 7, text, 'opacity="0.65"')} ${T(172, 103, 'Model Precision', 6.5, muted, 'opacity="0.75"')}
          ${sec(0, 128, 'EXPERIENCE', 252)}
          ${job(0, 143, 'Analytics Corp', 'Senior Data Analyst', ['ETL pipelines processing 5M+ rows/day', 'Reduced reporting time 4h \u2192 20 min', 'Insights saving $4.8M annually'], '2020–Present', 252)}
          ${job(0, 212, 'Tech Startup', 'Data Analyst', ['Tableau & Power BI dashboards for exec team', 'Automated reports, saved 30 hours/month'], '2018–2020', 252)}
          ${sec(0, 260, 'PROJECTS', 252)}
          ${bul(0, 270, 'Churn prediction model \u2014 89% accuracy')}
          ${bul(0, 280, 'Real-time anomaly detection dashboard')}
        </g>`;
      break;

    // ── Executive (elegant serif, premium spacing) ────────────────────────
    case 'executive':
      body = `
        ${R(0, 0, 400, 88, primary, 0.07, 0)}
        ${photo(357, 44, 30, primary)}
        ${TS(30, 36, 'Alexander Morgan', 22, primary, 'font-weight="bold"')}
        ${T(30, 53, 'Chief Technology Officer  \u2022  Board Advisor', 11, muted)}
        ${R(30, 60, 270, 1.5, primary, 0.4, 0)}
        ${mut(30, 72, 'a.morgan@corp.com  \u2022  (555) 234-5678  \u2022  New York, NY')}
        ${mut(30, 84, 'linkedin.com/in/amorgan  \u2022  Board Member since 2018')}
        ${sec(30, 110, 'PROFESSIONAL EXPERIENCE', 340)}
        ${job(30, 125, 'Fortune 500 Corp', 'Chief Technology Officer', ['Led digital transformation, $120M tech budget', 'Scaled engineering org from 40 to 180 people', 'Delivered 5 major platform launches on schedule'], '2019–Present', 340)}
        ${job(30, 194, 'Global Tech Corp', 'VP of Engineering', ['Built distributed systems for 100M+ users', 'Led M&A technical due diligence for 3 deals'], '2016–2019', 340)}
        ${sec(30, 242, 'BOARD MEMBERSHIPS', 340)}
        ${bul(30, 252, 'TechVentures Inc. \u2014 Independent Director, 2021–Present')}
        ${bul(30, 262, 'AI Ethics Foundation \u2014 Board Advisor, 2020–Present')}
        ${bul(30, 272, 'Startup Accelerator XYZ \u2014 Mentor, 2018–Present')}
        ${sec(30, 296, 'EXPERTISE', 340)}
        ${chipT(30, 306, 'P&L Management', 90)} ${chipT(124, 306, 'M&A Strategy', 80)} ${chipT(208, 306, 'Board Relations', 88)} ${chipT(300, 306, 'Fundraising', 72)}
        ${chipT(30, 326, 'Org Design', 68)} ${chipT(102, 326, 'Digital Transform.', 104)} ${chipT(210, 326, 'Cloud Strategy', 84)} ${chipT(298, 326, 'AI/ML Strategy', 86)}
        ${sec(30, 360, 'EDUCATION', 340)}
        ${T(30, 374, 'Harvard Business School', 9, text, 'font-weight="600"')} ${mut(280, 374, '2008')}
        ${T(30, 386, 'MBA  \u2022  Technology & Innovation  \u2022  Baker Scholar', 9, primary)}
        ${sec(30, 408, 'SPEAKING & PUBLICATIONS', 340)}
        ${bul(30, 418, '"The Future of Enterprise AI" \u2014 Harvard Business Review')}
        ${bul(30, 428, '"Scaling Engineering Teams" \u2014 O\'Reilly, 2021')}`;
      break;

    // ── Single-standard (default clean layout) ────────────────────────────
    case 'single-standard':
    default:
      body = `
        ${photo(363, 38, 26, primary)}
        ${T(25, 33, 'Alex Morgan', 22, primary, 'font-weight="bold"')}
        ${T(25, 49, 'Senior Software Engineer', 11, muted)}
        ${mut(25, 61, 'alex@email.com  \u2022  (555) 234-5678  \u2022  San Francisco, CA')}
        ${R(25, 68, 350, 1, primary, 0.3, 0)}
        ${sec(25, 85, 'EXPERIENCE')}
        ${job(25, 100, 'Tech Company Inc.', 'Senior Software Engineer', ['Built high-traffic APIs serving 5M+ daily requests', 'Led team of 6 engineers on cloud migration', 'Reduced latency by 40% via query optimization'], '2021–Present')}
        ${job(25, 169, 'Previous Company', 'Software Engineer', ['Developed full-stack SaaS for 10k+ active users', 'Automated CI/CD, cut release cycle by 50%'], '2018–2021')}
        ${sec(25, 217, 'EDUCATION')}
        ${T(25, 231, 'Stanford University', 9, text, 'font-weight="600"')} ${mut(258, 231, '2018')}
        ${T(25, 243, 'B.S. Computer Science  \u2022  GPA: 3.9 / 4.0', 9, primary)}
        ${sec(25, 266, 'SKILLS')}
        ${chipT(25, 276, 'Python', 52)} ${chipT(81, 276, 'React', 44)} ${chipT(129, 276, 'Node.js', 54)} ${chipT(187, 276, 'TypeScript', 68)} ${chipT(259, 276, 'AWS', 36)} ${chipT(299, 276, 'Docker', 50)} ${chipT(353, 276, 'SQL', 34)}
        ${chipT(25, 296, 'PostgreSQL', 68)} ${chipT(97, 296, 'GraphQL', 58)} ${chipT(159, 296, 'Redis', 42)} ${chipT(205, 296, 'Kubernetes', 68)} ${chipT(277, 296, 'Go', 30)} ${chipT(311, 296, 'Linux', 42)}
        ${sec(25, 328, 'CERTIFICATIONS')}
        ${bul(25, 338, 'AWS Solutions Architect \u2013 Professional  \u2022  2023')}
        ${bul(25, 348, 'Google Cloud Professional Engineer  \u2022  2022')}
        ${bul(25, 358, 'Certified Kubernetes Administrator  \u2022  2021')}
        ${sec(25, 378, 'PROJECTS')}
        ${bul(25, 388, 'Open source CLI tool \u2014 2.4k GitHub stars')}
        ${bul(25, 398, 'Real-time analytics dashboard \u2014 Next.js + D3.js')}
        ${sec(25, 419, 'LANGUAGES')}
        ${bul(25, 429, 'English (Native)  \u2022  Spanish (Professional)  \u2022  German (Basic)')}`;
      break;
  }

  return `<svg width="400" height="560" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="560" fill="${bg}"/>
  ${body}
  <text x="200" y="549" font-family="Arial,sans-serif" font-size="10" fill="${text}" opacity="0.35" text-anchor="middle">${templateName.substring(0, 38)}</text>
</svg>`;
}
