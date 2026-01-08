"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonymizeResumeData = anonymizeResumeData;
exports.generatePDF = generatePDF;
exports.generateDOCX = generateDOCX;
exports.generateCoverLetterPDF = generateCoverLetterPDF;
exports.generateCoverLetterDOCX = generateCoverLetterDOCX;
const pdfkit_1 = __importDefault(require("pdfkit"));
const docx_1 = require("docx");
// Bullet character map
const BULLETS = {
    dot: '•',
    dash: '–',
    arrow: '›',
    check: '✓',
    none: '',
};
// Anonymize resume data
function anonymizeResumeData(data, config) {
    const anonymized = JSON.parse(JSON.stringify(data));
    if (config.maskName && anonymized.contact.name) {
        anonymized.contact.name = 'Candidate';
    }
    if (config.maskEmail && anonymized.contact.email) {
        anonymized.contact.email = 'candidate@email.com';
    }
    if (config.maskPhone && anonymized.contact.phone) {
        anonymized.contact.phone = '[Phone Hidden]';
    }
    if (config.maskLocation && anonymized.contact.location) {
        anonymized.contact.location = '[Location Hidden]';
    }
    if (config.maskCompanyNames) {
        anonymized.experience = anonymized.experience.map((exp, index) => ({
            ...exp,
            company: `Company ${index + 1}`,
        }));
    }
    anonymized.contact.linkedin = undefined;
    anonymized.contact.github = undefined;
    anonymized.contact.website = undefined;
    return anonymized;
}
// ============================================================================
// MAIN PDF GENERATION
// ============================================================================
async function generatePDF(data, template) {
    // Route to appropriate layout generator
    if (template.hasSidebar) {
        if (template.sidebarPosition === 'right') {
            return generateSidebarRightPDF(data, template);
        }
        return generateSidebarLeftPDF(data, template);
    }
    switch (template.headerStyle) {
        case 'banner':
            return generateBannerPDF(data, template);
        case 'centered':
            return generateCenteredPDF(data, template);
        default:
            return generateLeftAlignedPDF(data, template);
    }
}
// ============================================================================
// LEFT-ALIGNED LAYOUT (Modern, Minimal, Compact)
// ============================================================================
async function generateLeftAlignedPDF(data, template) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: template.margins,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const { fontSize, primaryColor, margins } = template;
            const textColor = template.textColor || '#1a1a2e';
            const mutedColor = template.mutedColor || '#64748b';
            const bullet = BULLETS[template.bulletStyle];
            const pageWidth = doc.page.width - margins.left - margins.right;
            // Header - Name
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header)
                    .fillColor(primaryColor)
                    .text(data.contact.name);
            }
            // Contact line
            const contactParts = [
                data.contact.email,
                data.contact.phone,
                data.contact.location
            ].filter(Boolean);
            if (contactParts.length > 0) {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(mutedColor)
                    .moveDown(0.3)
                    .text(contactParts.join('  •  '));
            }
            // Links
            const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
            if (links.length > 0) {
                doc
                    .fontSize(fontSize.body - 0.5)
                    .fillColor(primaryColor)
                    .text(links.map(l => l?.replace('https://', '')).join('  •  '));
            }
            doc.moveDown(1.2);
            // Section renderer
            const renderSection = (title) => {
                if (template.sectionStyle === 'underlined') {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.subheader)
                        .fillColor(primaryColor)
                        .text(title.toUpperCase(), { characterSpacing: 0.5 });
                    doc
                        .strokeColor(primaryColor)
                        .lineWidth(0.75)
                        .moveTo(margins.left, doc.y + 2)
                        .lineTo(margins.left + pageWidth, doc.y + 2)
                        .stroke();
                    doc.moveDown(0.5);
                }
                else if (template.sectionStyle === 'highlighted' || template.sectionStyle === 'accent-bar') {
                    const y = doc.y;
                    doc.rect(margins.left - 4, y, 3, fontSize.subheader + 4).fill(primaryColor);
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.subheader)
                        .fillColor(textColor)
                        .text(title.toUpperCase(), margins.left + 6, y + 1, { characterSpacing: 0.5 });
                    doc.y = y + fontSize.subheader + 10;
                }
                else if (template.sectionStyle === 'dotted') {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.subheader)
                        .fillColor(primaryColor)
                        .text(title.toUpperCase(), { characterSpacing: 0.5 });
                    doc
                        .strokeColor(mutedColor)
                        .lineWidth(0.5)
                        .dash(2, { space: 2 })
                        .moveTo(margins.left, doc.y + 2)
                        .lineTo(margins.left + 60, doc.y + 2)
                        .stroke()
                        .undash();
                    doc.moveDown(0.5);
                }
                else {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.subheader)
                        .fillColor(primaryColor)
                        .text(title.toUpperCase(), { characterSpacing: 0.5 });
                    doc.moveDown(0.3);
                }
            };
            // Summary
            if (data.summary) {
                renderSection('Summary');
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.summary, { lineGap: 2 });
                doc.moveDown(1);
            }
            // Experience
            if (data.experience.length > 0) {
                renderSection('Experience');
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(exp.title);
                    const company = exp.company + (exp.location ? `, ${exp.location}` : '');
                    const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(mutedColor)
                        .text(`${company}  |  ${dates}`);
                    doc.moveDown(0.25);
                    for (const desc of exp.description || []) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(textColor)
                            .text(`${bullet}  ${desc}`, { indent: 8, lineGap: 1 });
                    }
                    doc.moveDown(0.6);
                }
                doc.moveDown(0.4);
            }
            // Education
            if (data.education.length > 0) {
                renderSection('Education');
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(edu.degree);
                    const eduInfo = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
                    if (eduInfo) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(mutedColor)
                            .text(eduInfo);
                    }
                    doc.moveDown(0.4);
                }
                doc.moveDown(0.4);
            }
            // Skills
            if (data.skills.length > 0) {
                renderSection('Skills');
                if (template.skillsStyle === 'pills') {
                    doc.font('Helvetica').fontSize(fontSize.body - 1);
                    let x = margins.left;
                    let y = doc.y;
                    for (const skill of data.skills) {
                        const width = doc.widthOfString(skill) + 14;
                        if (x + width > margins.left + pageWidth) {
                            x = margins.left;
                            y += 20;
                        }
                        doc.roundedRect(x, y, width, 16, 8).fill(template.accentColor || '#f1f5f9');
                        doc.fillColor(primaryColor).text(skill, x + 7, y + 3.5);
                        x += width + 6;
                    }
                    doc.y = y + 28;
                }
                else {
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(data.skills.join('  •  '), { lineGap: 2 });
                    doc.moveDown(0.8);
                }
            }
            // Projects
            if (data.projects && data.projects.length > 0) {
                renderSection('Projects');
                for (const proj of data.projects) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(proj.name);
                    if (proj.description) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(mutedColor)
                            .text(proj.description);
                    }
                    if (proj.technologies?.length) {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(fontSize.body - 1)
                            .fillColor(primaryColor)
                            .text(proj.technologies.join(', '));
                    }
                    doc.moveDown(0.4);
                }
            }
            // Certifications
            if (data.certifications && data.certifications.length > 0) {
                renderSection('Certifications');
                for (const cert of data.certifications) {
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(`${bullet}  ${cert}`);
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// ============================================================================
// CENTERED LAYOUT (Classic, Elegant)
// ============================================================================
async function generateCenteredPDF(data, template) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: template.margins,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const { fontSize, primaryColor, margins } = template;
            const textColor = template.textColor || '#1a1a2e';
            const mutedColor = template.mutedColor || '#64748b';
            const bullet = BULLETS[template.bulletStyle];
            const pageWidth = doc.page.width - margins.left - margins.right;
            // Centered Header
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header)
                    .fillColor(primaryColor)
                    .text(data.contact.name.toUpperCase(), { align: 'center', characterSpacing: 2 });
            }
            // Decorative line
            const lineY = doc.y + 8;
            const centerX = doc.page.width / 2;
            doc
                .strokeColor(primaryColor)
                .lineWidth(1.5)
                .moveTo(centerX - 40, lineY)
                .lineTo(centerX + 40, lineY)
                .stroke();
            doc.y = lineY + 12;
            // Contact
            const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
            if (contactParts.length > 0) {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(mutedColor)
                    .text(contactParts.join('   •   '), { align: 'center' });
            }
            doc.moveDown(1.5);
            // Section renderer
            const renderSection = (title) => {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text(title.toUpperCase(), { characterSpacing: 1 });
                if (template.sectionStyle === 'dotted') {
                    doc
                        .strokeColor(primaryColor)
                        .lineWidth(0.5)
                        .dash(1.5, { space: 1.5 })
                        .moveTo(margins.left, doc.y + 3)
                        .lineTo(margins.left + 50, doc.y + 3)
                        .stroke()
                        .undash();
                }
                else {
                    doc
                        .strokeColor(primaryColor)
                        .lineWidth(0.75)
                        .moveTo(margins.left, doc.y + 3)
                        .lineTo(margins.left + pageWidth, doc.y + 3)
                        .stroke();
                }
                doc.moveDown(0.6);
            };
            // Summary
            if (data.summary) {
                renderSection('Profile');
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.summary, { align: 'justify', lineGap: 2 });
                doc.moveDown(1);
            }
            // Experience
            if (data.experience.length > 0) {
                renderSection('Experience');
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(exp.title);
                    const info = [exp.company, exp.location].filter(Boolean).join(', ');
                    const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(mutedColor)
                        .text(`${info}  |  ${dates}`);
                    doc.moveDown(0.25);
                    for (const desc of exp.description || []) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(textColor)
                            .text(`${bullet}  ${desc}`, { indent: 12, lineGap: 1 });
                    }
                    doc.moveDown(0.6);
                }
            }
            // Education
            if (data.education.length > 0) {
                renderSection('Education');
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(edu.degree);
                    const info = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(mutedColor)
                        .text(info);
                    doc.moveDown(0.4);
                }
            }
            // Skills
            if (data.skills.length > 0) {
                renderSection('Skills');
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.skills.join('   •   '));
                doc.moveDown(0.8);
            }
            // Certifications
            if (data.certifications && data.certifications.length > 0) {
                renderSection('Certifications');
                for (const cert of data.certifications) {
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(`${bullet}  ${cert}`);
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// ============================================================================
// BANNER LAYOUT (Executive, Bold)
// ============================================================================
async function generateBannerPDF(data, template) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 0, right: 40, bottom: 40, left: 40 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const { fontSize, primaryColor } = template;
            const textColor = template.textColor || '#1a1a2e';
            const mutedColor = template.mutedColor || '#64748b';
            const accentColor = template.accentColor || '#e8f4fc';
            const bullet = BULLETS[template.bulletStyle];
            const pageWidth = doc.page.width;
            // Header banner
            doc.rect(0, 0, pageWidth, 100).fill(primaryColor);
            // Name in banner
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header)
                    .fillColor('#ffffff')
                    .text(data.contact.name.toUpperCase(), 40, 32, { width: pageWidth - 80, characterSpacing: 1 });
            }
            // Contact in banner
            const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
            if (contactParts.length > 0) {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor('rgba(255,255,255,0.85)')
                    .text(contactParts.join('   |   '), 40, 68, { width: pageWidth - 80 });
            }
            let y = 120;
            // Section renderer
            const renderSection = (title) => {
                if (template.sectionStyle === 'boxed') {
                    doc.rect(40, y, 140, 22).fill(primaryColor);
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(11)
                        .fillColor('#ffffff')
                        .text(title.toUpperCase(), 50, y + 5, { characterSpacing: 0.5 });
                    y += 32;
                }
                else {
                    // Accent bar style
                    doc.rect(40, y, 4, 18).fill(accentColor);
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.subheader)
                        .fillColor(primaryColor)
                        .text(title.toUpperCase(), 52, y + 2, { characterSpacing: 0.5 });
                    y += 28;
                }
            };
            // Summary
            if (data.summary) {
                // Summary box
                doc.rect(40, y, pageWidth - 80, 70).fill(accentColor);
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.summary, 52, y + 12, { width: pageWidth - 104, lineGap: 2 });
                y = Math.max(y + 80, doc.y + 20);
            }
            // Experience
            if (data.experience.length > 0) {
                renderSection('Experience');
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 1)
                        .fillColor(textColor)
                        .text(exp.title, 40, y, { width: pageWidth - 80 });
                    y = doc.y + 2;
                    const info = [exp.company, exp.location].filter(Boolean).join(', ');
                    const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(primaryColor)
                        .text(`${info}  |  ${dates}`, 40, y);
                    y = doc.y + 6;
                    for (const desc of exp.description || []) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(textColor)
                            .text(`${bullet}  ${desc}`, 52, y, { width: pageWidth - 100, lineGap: 1 });
                        y = doc.y + 3;
                    }
                    y += 10;
                }
            }
            // Skills
            if (data.skills.length > 0) {
                renderSection('Skills');
                if (template.skillsStyle === 'grid') {
                    const cols = 3;
                    const colWidth = (pageWidth - 100) / cols;
                    let col = 0;
                    let startY = y;
                    for (const skill of data.skills) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(textColor)
                            .text(`•  ${skill}`, 50 + col * colWidth, y, { width: colWidth - 10 });
                        col++;
                        if (col >= cols) {
                            col = 0;
                            y = doc.y + 3;
                        }
                    }
                    y = Math.max(y, doc.y) + 20;
                }
                else if (template.skillsStyle === 'pills') {
                    doc.font('Helvetica').fontSize(fontSize.body - 1);
                    let x = 40;
                    let pillY = y;
                    for (const skill of data.skills) {
                        const width = doc.widthOfString(skill) + 16;
                        if (x + width > pageWidth - 40) {
                            x = 40;
                            pillY += 22;
                        }
                        doc.roundedRect(x, pillY, width, 18, 9).fill(primaryColor);
                        doc.fillColor('#ffffff').text(skill, x + 8, pillY + 4);
                        x += width + 8;
                    }
                    y = pillY + 32;
                }
                else {
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(data.skills.join('  •  '), 40, y, { width: pageWidth - 80 });
                    y = doc.y + 20;
                }
            }
            // Education
            if (data.education.length > 0) {
                renderSection('Education');
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(edu.degree, 40, y);
                    y = doc.y + 2;
                    const info = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor(mutedColor)
                        .text(info, 40, y);
                    y = doc.y + 10;
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// ============================================================================
// SIDEBAR LEFT LAYOUT (Modern two-column)
// ============================================================================
async function generateSidebarLeftPDF(data, template) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 0, right: 0, bottom: 0, left: 0 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const { fontSize, primaryColor, secondaryColor } = template;
            const textColor = template.textColor || '#1a1a2e';
            const mutedColor = template.mutedColor || '#64748b';
            const sidebarWidth = (doc.page.width * (template.sidebarWidth || 32)) / 100;
            const mainWidth = doc.page.width - sidebarWidth;
            const bullet = BULLETS[template.bulletStyle];
            // Sidebar background
            doc.rect(0, 0, sidebarWidth, doc.page.height).fill(secondaryColor || primaryColor);
            // Accent stripe
            doc.rect(0, 0, sidebarWidth, 6).fill(primaryColor);
            let sideY = 30;
            // Name in sidebar
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header - 4)
                    .fillColor('#ffffff')
                    .text(data.contact.name, 18, sideY, { width: sidebarWidth - 36 });
                sideY = doc.y + 18;
            }
            // Contact section
            doc
                .font('Helvetica-Bold')
                .fontSize(9)
                .fillColor(primaryColor)
                .text('CONTACT', 18, sideY);
            sideY = doc.y + 8;
            doc.font('Helvetica').fontSize(8.5).fillColor('rgba(255,255,255,0.85)');
            if (data.contact.email) {
                doc.text(data.contact.email, 18, sideY, { width: sidebarWidth - 36 });
                sideY = doc.y + 4;
            }
            if (data.contact.phone) {
                doc.text(data.contact.phone, 18, sideY, { width: sidebarWidth - 36 });
                sideY = doc.y + 4;
            }
            if (data.contact.location) {
                doc.text(data.contact.location, 18, sideY, { width: sidebarWidth - 36 });
                sideY = doc.y + 4;
            }
            if (data.contact.linkedin) {
                doc.text(data.contact.linkedin.replace('https://', ''), 18, sideY, { width: sidebarWidth - 36 });
                sideY = doc.y + 4;
            }
            sideY += 16;
            // Skills in sidebar
            if (data.skills.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('SKILLS', 18, sideY);
                sideY = doc.y + 10;
                if (template.skillsStyle === 'pills') {
                    doc.font('Helvetica').fontSize(8);
                    let x = 18;
                    let pillY = sideY;
                    for (const skill of data.skills) {
                        const width = doc.widthOfString(skill) + 12;
                        if (x + width > sidebarWidth - 18) {
                            x = 18;
                            pillY += 18;
                        }
                        doc.roundedRect(x, pillY, width, 14, 7).fill('rgba(255,255,255,0.2)');
                        doc.fillColor('#ffffff').text(skill, x + 6, pillY + 3);
                        x += width + 6;
                    }
                    sideY = pillY + 28;
                }
                else {
                    doc.font('Helvetica').fontSize(8.5);
                    for (const skill of data.skills) {
                        doc.fillColor('rgba(255,255,255,0.85)').text(`•  ${skill}`, 18, sideY, { width: sidebarWidth - 36 });
                        sideY = doc.y + 3;
                    }
                    sideY += 12;
                }
            }
            // Education in sidebar
            if (data.education.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('EDUCATION', 18, sideY);
                sideY = doc.y + 8;
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(8.5)
                        .fillColor('#ffffff')
                        .text(edu.degree, 18, sideY, { width: sidebarWidth - 36 });
                    sideY = doc.y + 2;
                    if (edu.institution) {
                        doc
                            .font('Helvetica')
                            .fontSize(8)
                            .fillColor('rgba(255,255,255,0.75)')
                            .text(edu.institution, 18, sideY, { width: sidebarWidth - 36 });
                        sideY = doc.y + 2;
                    }
                    if (edu.graduationDate) {
                        doc
                            .font('Helvetica')
                            .fontSize(7.5)
                            .fillColor('rgba(255,255,255,0.6)')
                            .text(edu.graduationDate, 18, sideY);
                        sideY = doc.y + 10;
                    }
                }
            }
            // Main content
            let mainY = 30;
            const mainX = sidebarWidth + 28;
            const contentWidth = mainWidth - 56;
            // Summary
            if (data.summary) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('ABOUT', mainX, mainY);
                mainY = doc.y + 8;
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.summary, mainX, mainY, { width: contentWidth, lineGap: 2 });
                mainY = doc.y + 20;
            }
            // Experience
            if (data.experience.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('EXPERIENCE', mainX, mainY);
                mainY = doc.y + 10;
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(exp.title, mainX, mainY, { width: contentWidth });
                    mainY = doc.y + 2;
                    const info = [exp.company, exp.location].filter(Boolean).join(' • ');
                    const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body - 0.5)
                        .fillColor(primaryColor)
                        .text(`${info}  |  ${dates}`, mainX, mainY, { width: contentWidth });
                    mainY = doc.y + 6;
                    for (const desc of exp.description || []) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(mutedColor)
                            .text(`${bullet}  ${desc}`, mainX + 8, mainY, { width: contentWidth - 8, lineGap: 1 });
                        mainY = doc.y + 3;
                    }
                    mainY += 10;
                }
            }
            // Projects
            if (data.projects && data.projects.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('PROJECTS', mainX, mainY);
                mainY = doc.y + 10;
                for (const proj of data.projects) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(proj.name, mainX, mainY, { width: contentWidth });
                    mainY = doc.y + 2;
                    if (proj.description) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body - 0.5)
                            .fillColor(mutedColor)
                            .text(proj.description, mainX, mainY, { width: contentWidth });
                        mainY = doc.y + 3;
                    }
                    if (proj.technologies?.length) {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(fontSize.body - 1)
                            .fillColor(primaryColor)
                            .text(proj.technologies.join(' • '), mainX, mainY, { width: contentWidth });
                        mainY = doc.y + 10;
                    }
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// ============================================================================
// SIDEBAR RIGHT LAYOUT
// ============================================================================
async function generateSidebarRightPDF(data, template) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 0, right: 0, bottom: 0, left: 0 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const { fontSize, primaryColor } = template;
            const textColor = template.textColor || '#1a1a2e';
            const mutedColor = template.mutedColor || '#64748b';
            const accentColor = template.accentColor || '#f8fafc';
            const sidebarWidth = (doc.page.width * (template.sidebarWidth || 30)) / 100;
            const mainWidth = doc.page.width - sidebarWidth;
            const bullet = BULLETS[template.bulletStyle];
            // Right sidebar background
            doc.rect(mainWidth, 0, sidebarWidth, doc.page.height).fill(accentColor);
            // Accent stripe
            doc.rect(mainWidth, 0, 3, doc.page.height).fill(primaryColor);
            // Main content (left)
            let mainY = 36;
            const mainX = 36;
            const contentWidth = mainWidth - 72;
            // Name
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header)
                    .fillColor(primaryColor)
                    .text(data.contact.name, mainX, mainY, { width: contentWidth });
                mainY = doc.y + 4;
            }
            // Contact line
            const contactParts = [data.contact.email, data.contact.phone].filter(Boolean);
            if (contactParts.length > 0) {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(mutedColor)
                    .text(contactParts.join('  |  '), mainX, mainY);
                mainY = doc.y + 18;
            }
            // Summary
            if (data.summary) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('PROFILE', mainX, mainY);
                mainY = doc.y + 8;
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor(textColor)
                    .text(data.summary, mainX, mainY, { width: contentWidth, lineGap: 2 });
                mainY = doc.y + 18;
            }
            // Experience
            if (data.experience.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('EXPERIENCE', mainX, mainY);
                mainY = doc.y + 10;
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 0.5)
                        .fillColor(textColor)
                        .text(exp.title, mainX, mainY, { width: contentWidth });
                    mainY = doc.y + 2;
                    const info = [exp.company, exp.location].filter(Boolean).join(', ');
                    const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body - 0.5)
                        .fillColor(primaryColor)
                        .text(`${info}  |  ${dates}`, mainX, mainY);
                    mainY = doc.y + 5;
                    for (const desc of exp.description || []) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(textColor)
                            .text(`${bullet}  ${desc}`, mainX + 8, mainY, { width: contentWidth - 8, lineGap: 1 });
                        mainY = doc.y + 3;
                    }
                    mainY += 10;
                }
            }
            // Projects
            if (data.projects && data.projects.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text('PROJECTS', mainX, mainY);
                mainY = doc.y + 10;
                for (const proj of data.projects) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body)
                        .fillColor(textColor)
                        .text(proj.name, mainX, mainY, { width: contentWidth });
                    mainY = doc.y + 2;
                    if (proj.description) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor(mutedColor)
                            .text(proj.description, mainX, mainY, { width: contentWidth });
                        mainY = doc.y + 3;
                    }
                    mainY += 8;
                }
            }
            // Sidebar content (right)
            let sideY = 36;
            const sideX = mainWidth + 16;
            const sideWidth = sidebarWidth - 32;
            // Location
            if (data.contact.location) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('LOCATION', sideX, sideY);
                sideY = doc.y + 5;
                doc
                    .font('Helvetica')
                    .fontSize(8.5)
                    .fillColor(textColor)
                    .text(data.contact.location, sideX, sideY, { width: sideWidth });
                sideY = doc.y + 16;
            }
            // Links
            if (data.contact.linkedin || data.contact.github) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('LINKS', sideX, sideY);
                sideY = doc.y + 5;
                doc.font('Helvetica').fontSize(8).fillColor(mutedColor);
                if (data.contact.linkedin) {
                    doc.text(data.contact.linkedin.replace('https://', ''), sideX, sideY, { width: sideWidth });
                    sideY = doc.y + 3;
                }
                if (data.contact.github) {
                    doc.text(data.contact.github.replace('https://', ''), sideX, sideY, { width: sideWidth });
                    sideY = doc.y + 3;
                }
                sideY += 12;
            }
            // Skills
            if (data.skills.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('SKILLS', sideX, sideY);
                sideY = doc.y + 8;
                doc.font('Helvetica').fontSize(8.5);
                for (const skill of data.skills) {
                    doc.fillColor(textColor).text(`•  ${skill}`, sideX, sideY, { width: sideWidth });
                    sideY = doc.y + 3;
                }
                sideY += 12;
            }
            // Education
            if (data.education.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('EDUCATION', sideX, sideY);
                sideY = doc.y + 8;
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(8.5)
                        .fillColor(textColor)
                        .text(edu.degree, sideX, sideY, { width: sideWidth });
                    sideY = doc.y + 2;
                    if (edu.institution) {
                        doc
                            .font('Helvetica')
                            .fontSize(8)
                            .fillColor(mutedColor)
                            .text(edu.institution, sideX, sideY, { width: sideWidth });
                        sideY = doc.y + 2;
                    }
                    if (edu.graduationDate) {
                        doc.text(edu.graduationDate, sideX, sideY);
                        sideY = doc.y + 10;
                    }
                }
            }
            // Certifications
            if (data.certifications && data.certifications.length > 0) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(9)
                    .fillColor(primaryColor)
                    .text('CERTIFICATIONS', sideX, sideY);
                sideY = doc.y + 8;
                doc.font('Helvetica').fontSize(8);
                for (const cert of data.certifications) {
                    doc.fillColor(textColor).text(`•  ${cert}`, sideX, sideY, { width: sideWidth });
                    sideY = doc.y + 3;
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// ============================================================================
// DOCX GENERATION
// ============================================================================
async function generateDOCX(data, template) {
    const children = [];
    const primaryColorHex = template.primaryColor.replace('#', '');
    // Header / Name
    if (data.contact.name) {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: data.contact.name,
                    bold: true,
                    size: template.fontSize.header * 2,
                    color: primaryColorHex,
                }),
            ],
            alignment: template.headerStyle === 'centered' ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
            spacing: { after: 100 },
        }));
    }
    // Contact Info
    const contactParts = [data.contact.email, data.contact.phone, data.contact.location].filter(Boolean);
    if (contactParts.length > 0) {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: contactParts.join('  |  '),
                    size: 20,
                    color: '666666',
                }),
            ],
            alignment: template.headerStyle === 'centered' ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
            spacing: { after: 200 },
        }));
    }
    // Section header helper
    const addSectionHeader = (title) => {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: template.fontSize.subheader * 2,
                    color: primaryColorHex,
                }),
            ],
            heading: docx_1.HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
                bottom: {
                    color: primaryColorHex,
                    size: 8,
                    style: docx_1.BorderStyle.SINGLE,
                },
            },
        }));
    };
    // Summary
    if (data.summary) {
        addSectionHeader('Summary');
        children.push(new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: data.summary, size: 22 })],
            spacing: { after: 200 },
        }));
    }
    // Experience
    if (data.experience.length > 0) {
        addSectionHeader('Experience');
        for (const exp of data.experience) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: exp.title, bold: true, size: 24 })],
                spacing: { before: 100 },
            }));
            const line = [exp.company, exp.location].filter(Boolean).join(', ');
            const dates = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' – ');
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: `${line}  |  ${dates}`, size: 20, color: '555555' })],
                spacing: { after: 50 },
            }));
            for (const desc of exp.description || []) {
                children.push(new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: `• ${desc}`, size: 22 })],
                    indent: { left: 200 },
                    spacing: { after: 40 },
                }));
            }
        }
    }
    // Education
    if (data.education.length > 0) {
        addSectionHeader('Education');
        for (const edu of data.education) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: edu.degree, bold: true, size: 24 })],
                spacing: { before: 100 },
            }));
            const eduLine = [edu.institution, edu.graduationDate].filter(Boolean).join('  |  ');
            if (eduLine) {
                children.push(new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: eduLine, size: 20, color: '555555' })],
                    spacing: { after: 50 },
                }));
            }
        }
    }
    // Skills
    if (data.skills.length > 0) {
        addSectionHeader('Skills');
        children.push(new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: data.skills.join('  •  '), size: 22 })],
            spacing: { after: 200 },
        }));
    }
    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        addSectionHeader('Certifications');
        for (const cert of data.certifications) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: `• ${cert}`, size: 22 })],
                spacing: { after: 40 },
            }));
        }
    }
    // Projects
    if (data.projects && data.projects.length > 0) {
        addSectionHeader('Projects');
        for (const proj of data.projects) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: proj.name, bold: true, size: 24 })],
                spacing: { before: 100 },
            }));
            if (proj.description) {
                children.push(new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: proj.description, size: 22 })],
                    spacing: { after: 50 },
                }));
            }
            if (proj.technologies?.length) {
                children.push(new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: `Technologies: ${proj.technologies.join(', ')}`, italics: true, size: 20, color: '666666' })],
                    spacing: { after: 100 },
                }));
            }
        }
    }
    const doc = new docx_1.Document({
        sections: [{ children }],
    });
    return docx_1.Packer.toBuffer(doc);
}
// ============================================================================
// COVER LETTER GENERATION
// ============================================================================
async function generateCoverLetterPDF(content, candidateName, companyName, jobTitle) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                margins: { top: 72, right: 72, bottom: 72, left: 72 },
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const today = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            doc.font('Helvetica').fontSize(11).fillColor('#333333').text(today);
            doc.moveDown(2);
            doc.text(`Dear Hiring Manager at ${companyName},`);
            doc.moveDown();
            const paragraphs = content.split('\n\n');
            for (const para of paragraphs) {
                if (para.trim()) {
                    doc.text(para.trim(), { align: 'justify', lineGap: 4 });
                    doc.moveDown();
                }
            }
            doc.moveDown();
            doc.text('Sincerely,');
            doc.moveDown(2);
            doc.font('Helvetica-Bold').text(candidateName);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
async function generateCoverLetterDOCX(content, candidateName, companyName, jobTitle) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const children = [];
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: today, size: 22 })],
        spacing: { after: 400 },
    }));
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: `Dear Hiring Manager at ${companyName},`, size: 22 })],
        spacing: { after: 200 },
    }));
    const paragraphs = content.split('\n\n');
    for (const para of paragraphs) {
        if (para.trim()) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: para.trim(), size: 22 })],
                spacing: { after: 200 },
            }));
        }
    }
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: 'Sincerely,', size: 22 })],
        spacing: { before: 200, after: 400 },
    }));
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: candidateName, bold: true, size: 22 })],
    }));
    const doc = new docx_1.Document({
        sections: [{ children }],
    });
    return docx_1.Packer.toBuffer(doc);
}
//# sourceMappingURL=documents.js.map