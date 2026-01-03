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
// Default template config
const DEFAULT_TEMPLATE = {
    name: 'Professional',
    layout: 'single-column',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Helvetica',
    fontSize: {
        header: 24,
        subheader: 14,
        body: 11,
    },
    margins: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
    },
    sections: {
        order: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
        visible: {
            summary: true,
            experience: true,
            education: true,
            skills: true,
            certifications: true,
            projects: true,
        },
    },
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
    // Remove identifying URLs
    anonymized.contact.linkedin = undefined;
    anonymized.contact.github = undefined;
    anonymized.contact.website = undefined;
    return anonymized;
}
// Generate PDF from resume data
async function generatePDF(data, template = DEFAULT_TEMPLATE) {
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
            const { fontSize, primaryColor } = template;
            // Header / Contact Info
            if (data.contact.name) {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.header)
                    .fillColor(primaryColor)
                    .text(data.contact.name, { align: 'center' });
            }
            const contactLine = [
                data.contact.email,
                data.contact.phone,
                data.contact.location,
            ].filter(Boolean).join(' | ');
            if (contactLine) {
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor('#666666')
                    .moveDown(0.3)
                    .text(contactLine, { align: 'center' });
            }
            const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
            if (links.length > 0) {
                doc
                    .fontSize(fontSize.body - 1)
                    .fillColor('#0066cc')
                    .moveDown(0.2)
                    .text(links.join(' | '), { align: 'center' });
            }
            doc.moveDown(0.8);
            // Helper to add section header
            const addSectionHeader = (title) => {
                doc
                    .font('Helvetica-Bold')
                    .fontSize(fontSize.subheader)
                    .fillColor(primaryColor)
                    .text(title.toUpperCase());
                doc
                    .strokeColor(primaryColor)
                    .lineWidth(1)
                    .moveTo(template.margins.left, doc.y)
                    .lineTo(doc.page.width - template.margins.right, doc.y)
                    .stroke();
                doc.moveDown(0.4);
            };
            // Summary
            if (template.sections.visible.summary && data.summary) {
                addSectionHeader('Summary');
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor('#333333')
                    .text(data.summary, { align: 'justify' });
                doc.moveDown(0.8);
            }
            // Experience
            if (template.sections.visible.experience && data.experience.length > 0) {
                addSectionHeader('Experience');
                for (const exp of data.experience) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 1)
                        .fillColor('#333333')
                        .text(exp.title);
                    const companyLine = [exp.company, exp.location].filter(Boolean).join(', ');
                    const dateLine = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor('#555555')
                        .text(`${companyLine}${dateLine ? ' | ' + dateLine : ''}`);
                    doc.moveDown(0.3);
                    for (const desc of exp.description) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor('#333333')
                            .text(`• ${desc}`, {
                            indent: 10,
                            align: 'left',
                        });
                    }
                    doc.moveDown(0.6);
                }
            }
            // Education
            if (template.sections.visible.education && data.education.length > 0) {
                addSectionHeader('Education');
                for (const edu of data.education) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 1)
                        .fillColor('#333333')
                        .text(edu.degree);
                    const eduLine = [edu.institution, edu.graduationDate].filter(Boolean).join(' | ');
                    if (eduLine) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor('#555555')
                            .text(eduLine);
                    }
                    if (edu.gpa) {
                        doc.text(`GPA: ${edu.gpa}`);
                    }
                    if (edu.achievements && edu.achievements.length > 0) {
                        for (const achievement of edu.achievements) {
                            doc
                                .font('Helvetica-Oblique')
                                .fontSize(fontSize.body)
                                .fillColor('#666666')
                                .text(achievement);
                        }
                    }
                    doc.moveDown(0.4);
                }
            }
            // Skills
            if (template.sections.visible.skills && data.skills.length > 0) {
                addSectionHeader('Skills');
                doc
                    .font('Helvetica')
                    .fontSize(fontSize.body)
                    .fillColor('#333333')
                    .text(data.skills.join('  •  '), { align: 'left' });
                doc.moveDown(0.8);
            }
            // Certifications
            if (template.sections.visible.certifications && data.certifications && data.certifications.length > 0) {
                addSectionHeader('Certifications');
                for (const cert of data.certifications) {
                    doc
                        .font('Helvetica')
                        .fontSize(fontSize.body)
                        .fillColor('#333333')
                        .text(`• ${cert}`);
                }
                doc.moveDown(0.8);
            }
            // Projects
            if (template.sections.visible.projects && data.projects && data.projects.length > 0) {
                addSectionHeader('Projects');
                for (const project of data.projects) {
                    doc
                        .font('Helvetica-Bold')
                        .fontSize(fontSize.body + 1)
                        .fillColor('#333333')
                        .text(project.name);
                    if (project.description) {
                        doc
                            .font('Helvetica')
                            .fontSize(fontSize.body)
                            .fillColor('#555555')
                            .text(project.description);
                    }
                    if (project.technologies && project.technologies.length > 0) {
                        doc
                            .font('Helvetica-Oblique')
                            .fontSize(fontSize.body - 1)
                            .fillColor('#666666')
                            .text(`Technologies: ${project.technologies.join(', ')}`);
                    }
                    doc.moveDown(0.4);
                }
            }
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// Generate DOCX from resume data
async function generateDOCX(data, template = DEFAULT_TEMPLATE) {
    const children = [];
    // Header / Name
    if (data.contact.name) {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: data.contact.name,
                    bold: true,
                    size: 48,
                    color: template.primaryColor.replace('#', ''),
                }),
            ],
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 100 },
        }));
    }
    // Contact Info
    const contactParts = [
        data.contact.email,
        data.contact.phone,
        data.contact.location,
    ].filter(Boolean);
    if (contactParts.length > 0) {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: contactParts.join(' | '),
                    size: 20,
                    color: '666666',
                }),
            ],
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 100 },
        }));
    }
    // Links
    const links = [data.contact.linkedin, data.contact.github].filter(Boolean);
    if (links.length > 0) {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: links.join(' | '),
                    size: 18,
                    color: '0066cc',
                }),
            ],
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 200 },
        }));
    }
    // Helper for section headers
    const addSectionHeader = (title) => {
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: title.toUpperCase(),
                    bold: true,
                    size: 24,
                    color: template.primaryColor.replace('#', ''),
                }),
            ],
            heading: docx_1.HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
                bottom: {
                    color: template.primaryColor.replace('#', ''),
                    size: 8,
                    style: docx_1.BorderStyle.SINGLE,
                },
            },
        }));
    };
    // Summary
    if (template.sections.visible.summary && data.summary) {
        addSectionHeader('Summary');
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: data.summary,
                    size: 22,
                }),
            ],
            spacing: { after: 200 },
        }));
    }
    // Experience
    if (template.sections.visible.experience && data.experience.length > 0) {
        addSectionHeader('Experience');
        for (const exp of data.experience) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: exp.title,
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: { before: 100 },
            }));
            const companyLine = [exp.company, exp.location].filter(Boolean).join(', ');
            const dateLine = [exp.startDate, exp.current ? 'Present' : exp.endDate].filter(Boolean).join(' - ');
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: `${companyLine}${dateLine ? ' | ' + dateLine : ''}`,
                        size: 20,
                        color: '555555',
                    }),
                ],
                spacing: { after: 50 },
            }));
            for (const desc of exp.description) {
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: `• ${desc}`,
                            size: 22,
                        }),
                    ],
                    indent: { left: 200 },
                    spacing: { after: 40 },
                }));
            }
        }
    }
    // Education
    if (template.sections.visible.education && data.education.length > 0) {
        addSectionHeader('Education');
        for (const edu of data.education) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: edu.degree,
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: { before: 100 },
            }));
            const eduLine = [edu.institution, edu.graduationDate].filter(Boolean).join(' | ');
            if (eduLine) {
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: eduLine,
                            size: 20,
                            color: '555555',
                        }),
                    ],
                    spacing: { after: 50 },
                }));
            }
        }
    }
    // Skills
    if (template.sections.visible.skills && data.skills.length > 0) {
        addSectionHeader('Skills');
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: data.skills.join('  •  '),
                    size: 22,
                }),
            ],
            spacing: { after: 200 },
        }));
    }
    // Certifications
    if (template.sections.visible.certifications && data.certifications && data.certifications.length > 0) {
        addSectionHeader('Certifications');
        for (const cert of data.certifications) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: `• ${cert}`,
                        size: 22,
                    }),
                ],
                spacing: { after: 40 },
            }));
        }
    }
    // Projects
    if (template.sections.visible.projects && data.projects && data.projects.length > 0) {
        addSectionHeader('Projects');
        for (const project of data.projects) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: project.name,
                        bold: true,
                        size: 24,
                    }),
                ],
                spacing: { before: 100 },
            }));
            if (project.description) {
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: project.description,
                            size: 22,
                        }),
                    ],
                    spacing: { after: 50 },
                }));
            }
            if (project.technologies && project.technologies.length > 0) {
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: `Technologies: ${project.technologies.join(', ')}`,
                            italics: true,
                            size: 20,
                            color: '666666',
                        }),
                    ],
                    spacing: { after: 100 },
                }));
            }
        }
    }
    const doc = new docx_1.Document({
        sections: [{
                children,
            }],
    });
    return docx_1.Packer.toBuffer(doc);
}
// Generate cover letter PDF
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
            // Date
            const today = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            doc
                .font('Helvetica')
                .fontSize(11)
                .fillColor('#333333')
                .text(today);
            doc.moveDown(2);
            // Recipient
            doc.text(`Dear Hiring Manager at ${companyName},`);
            doc.moveDown();
            // Body
            const paragraphs = content.split('\n\n');
            for (const para of paragraphs) {
                if (para.trim()) {
                    doc.text(para.trim(), { align: 'justify', lineGap: 4 });
                    doc.moveDown();
                }
            }
            doc.moveDown();
            // Closing
            doc.text('Sincerely,');
            doc.moveDown(2);
            doc
                .font('Helvetica-Bold')
                .text(candidateName);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
}
// Generate cover letter DOCX
async function generateCoverLetterDOCX(content, candidateName, companyName, jobTitle) {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const children = [];
    // Date
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: today, size: 22 })],
        spacing: { after: 400 },
    }));
    // Salutation
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: `Dear Hiring Manager at ${companyName},`, size: 22 })],
        spacing: { after: 200 },
    }));
    // Body paragraphs
    const paragraphs = content.split('\n\n');
    for (const para of paragraphs) {
        if (para.trim()) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: para.trim(), size: 22 })],
                spacing: { after: 200 },
            }));
        }
    }
    // Closing
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