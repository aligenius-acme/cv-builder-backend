"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateCoverLetter = exports.downloadCoverLetter = exports.deleteCoverLetter = exports.updateCoverLetter = exports.getCoverLetter = exports.getCoverLetters = exports.generateCoverLetter = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const ai_1 = require("../services/ai");
const documents_1 = require("../services/documents");
// Generate cover letter
const generateCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const organizationId = req.user.organizationId;
        const { resumeVersionId, jobTitle, companyName, jobDescription, tone = 'professional' } = req.body;
        if (!jobTitle || !companyName || !jobDescription) {
            throw new errors_1.ValidationError('Job title, company name, and job description are required');
        }
        let resumeData;
        let jobData;
        // If resumeVersionId provided, use that version's data
        if (resumeVersionId) {
            const version = await prisma_1.prisma.resumeVersion.findFirst({
                where: { id: resumeVersionId, userId },
            });
            if (!version) {
                throw new errors_1.NotFoundError('Resume version not found');
            }
            resumeData = version.tailoredData;
            jobData = version.jobData;
        }
        else {
            // Use the most recent resume
            const resume = await prisma_1.prisma.resume.findFirst({
                where: { userId, parseStatus: 'completed' },
                orderBy: { createdAt: 'desc' },
            });
            if (!resume) {
                throw new errors_1.NotFoundError('No parsed resume found. Please upload a resume first.');
            }
            resumeData = resume.parsedData;
            // Extract job data from provided job description
            jobData = {
                requiredSkills: [],
                preferredSkills: [],
                responsibilities: [],
                keywords: [],
                qualifications: [],
            };
        }
        // Generate cover letter using AI
        const content = await (0, ai_1.generateCoverLetter)({
            resumeData,
            jobData,
            jobTitle,
            companyName,
            tone: tone,
        }, userId, organizationId);
        // Save cover letter
        const coverLetter = await prisma_1.prisma.coverLetter.create({
            data: {
                userId,
                resumeVersionId,
                jobTitle,
                companyName,
                jobDescription,
                content,
                tone,
            },
        });
        res.status(201).json({
            success: true,
            data: {
                id: coverLetter.id,
                jobTitle: coverLetter.jobTitle,
                companyName: coverLetter.companyName,
                content: coverLetter.content,
                createdAt: coverLetter.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateCoverLetter = generateCoverLetter;
// Get all cover letters
const getCoverLetters = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const coverLetters = await prisma_1.prisma.coverLetter.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: coverLetters.map((cl) => ({
                id: cl.id,
                jobTitle: cl.jobTitle,
                companyName: cl.companyName,
                tone: cl.tone,
                createdAt: cl.createdAt,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCoverLetters = getCoverLetters;
// Get single cover letter
const getCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const coverLetter = await prisma_1.prisma.coverLetter.findFirst({
            where: { id, userId },
        });
        if (!coverLetter) {
            throw new errors_1.NotFoundError('Cover letter not found');
        }
        res.json({
            success: true,
            data: {
                id: coverLetter.id,
                jobTitle: coverLetter.jobTitle,
                companyName: coverLetter.companyName,
                jobDescription: coverLetter.jobDescription,
                content: coverLetter.content,
                tone: coverLetter.tone,
                createdAt: coverLetter.createdAt,
                updatedAt: coverLetter.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCoverLetter = getCoverLetter;
// Update cover letter content
const updateCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { content } = req.body;
        const coverLetter = await prisma_1.prisma.coverLetter.findFirst({
            where: { id, userId },
        });
        if (!coverLetter) {
            throw new errors_1.NotFoundError('Cover letter not found');
        }
        const updated = await prisma_1.prisma.coverLetter.update({
            where: { id },
            data: { content },
        });
        res.json({
            success: true,
            data: {
                id: updated.id,
                content: updated.content,
                updatedAt: updated.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCoverLetter = updateCoverLetter;
// Delete cover letter
const deleteCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const coverLetter = await prisma_1.prisma.coverLetter.findFirst({
            where: { id, userId },
        });
        if (!coverLetter) {
            throw new errors_1.NotFoundError('Cover letter not found');
        }
        await prisma_1.prisma.coverLetter.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Cover letter deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCoverLetter = deleteCoverLetter;
// Download cover letter
const downloadCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { format = 'pdf' } = req.query;
        const coverLetter = await prisma_1.prisma.coverLetter.findFirst({
            where: { id, userId },
            include: {
                user: true,
            },
        });
        if (!coverLetter) {
            throw new errors_1.NotFoundError('Cover letter not found');
        }
        const candidateName = `${coverLetter.user.firstName || ''} ${coverLetter.user.lastName || ''}`.trim() || 'Candidate';
        let buffer;
        let contentType;
        let fileName;
        if (format === 'docx') {
            buffer = await (0, documents_1.generateCoverLetterDOCX)(coverLetter.content, candidateName, coverLetter.companyName, coverLetter.jobTitle);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileName = `cover-letter-${coverLetter.companyName}.docx`;
        }
        else {
            buffer = await (0, documents_1.generateCoverLetterPDF)(coverLetter.content, candidateName, coverLetter.companyName, coverLetter.jobTitle);
            contentType = 'application/pdf';
            fileName = `cover-letter-${coverLetter.companyName}.pdf`;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadCoverLetter = downloadCoverLetter;
// Regenerate cover letter with different parameters
const regenerateCoverLetter = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const organizationId = req.user.organizationId;
        const { id } = req.params;
        const { tone = 'professional' } = req.body;
        const coverLetter = await prisma_1.prisma.coverLetter.findFirst({
            where: { id, userId },
        });
        if (!coverLetter) {
            throw new errors_1.NotFoundError('Cover letter not found');
        }
        // Get resume data
        let resumeData;
        let jobData;
        if (coverLetter.resumeVersionId) {
            const version = await prisma_1.prisma.resumeVersion.findFirst({
                where: { id: coverLetter.resumeVersionId },
            });
            if (version) {
                resumeData = version.tailoredData;
                jobData = version.jobData;
            }
            else {
                throw new errors_1.NotFoundError('Associated resume version not found');
            }
        }
        else {
            const resume = await prisma_1.prisma.resume.findFirst({
                where: { userId, parseStatus: 'completed' },
                orderBy: { createdAt: 'desc' },
            });
            if (!resume) {
                throw new errors_1.NotFoundError('No parsed resume found');
            }
            resumeData = resume.parsedData;
            jobData = {
                requiredSkills: [],
                preferredSkills: [],
                responsibilities: [],
                keywords: [],
                qualifications: [],
            };
        }
        // Generate new content
        const content = await (0, ai_1.generateCoverLetter)({
            resumeData,
            jobData,
            jobTitle: coverLetter.jobTitle,
            companyName: coverLetter.companyName,
            tone: tone,
        }, userId, organizationId);
        // Update cover letter
        const updated = await prisma_1.prisma.coverLetter.update({
            where: { id },
            data: { content, tone },
        });
        res.json({
            success: true,
            data: {
                id: updated.id,
                content: updated.content,
                tone: updated.tone,
                updatedAt: updated.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.regenerateCoverLetter = regenerateCoverLetter;
//# sourceMappingURL=coverLetter.js.map