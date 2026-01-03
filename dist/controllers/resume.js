"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateATS = exports.downloadVersion = exports.compareVersions = exports.getVersion = exports.customizeResume = exports.deleteResume = exports.updateResume = exports.getResume = exports.getResumes = exports.uploadResume = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_1 = require("../services/storage");
const parser_1 = require("../services/parser");
const ai_1 = require("../services/ai");
const documents_1 = require("../services/documents");
const subscription_1 = require("../middleware/subscription");
// Upload and parse resume
const uploadResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        if (!file) {
            throw new errors_1.ValidationError('Resume file is required');
        }
        // Check file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new errors_1.ValidationError('Only PDF and DOCX files are allowed');
        }
        // Check quota
        const limits = (0, subscription_1.getSubscriptionLimits)(req.user.planType);
        if (limits.maxResumes !== -1) {
            const resumeCount = await prisma_1.prisma.resume.count({
                where: { userId },
            });
            if (resumeCount >= limits.maxResumes) {
                throw new errors_1.QuotaExceededError(`Resume limit reached (${limits.maxResumes}). Upgrade to Pro for more resumes.`);
            }
        }
        // Upload to S3
        const { key, url } = await (0, storage_1.uploadFile)(file.buffer, file.originalname, userId, 'resumes', file.mimetype);
        // Create resume record with pending status
        const resume = await prisma_1.prisma.resume.create({
            data: {
                userId,
                originalFileName: file.originalname,
                originalFileUrl: url,
                originalFileKey: key,
                rawText: '',
                parsedData: {},
                parseStatus: 'processing',
            },
        });
        // Parse file asynchronously
        try {
            const rawText = await (0, parser_1.parseFile)(file.buffer, file.originalname);
            const parsedData = (0, parser_1.extractResumeData)(rawText);
            await prisma_1.prisma.resume.update({
                where: { id: resume.id },
                data: {
                    rawText,
                    parsedData: parsedData,
                    parseStatus: 'completed',
                },
            });
            // Update subscription usage
            await prisma_1.prisma.subscription.update({
                where: { userId },
                data: {
                    resumesCreated: { increment: 1 },
                },
            });
            res.status(201).json({
                success: true,
                data: {
                    id: resume.id,
                    fileName: file.originalname,
                    parseStatus: 'completed',
                    parsedData,
                },
            });
        }
        catch (parseError) {
            // Log parsing error but don't block
            await (0, parser_1.logParsingError)(file.originalname, file.mimetype, parseError, resume.id, userId);
            await prisma_1.prisma.resume.update({
                where: { id: resume.id },
                data: {
                    parseStatus: 'failed',
                    parseError: parseError.message,
                },
            });
            res.status(201).json({
                success: true,
                data: {
                    id: resume.id,
                    fileName: file.originalname,
                    parseStatus: 'failed',
                    parseError: parseError.message,
                },
                message: 'Resume uploaded but parsing failed. You can try re-uploading or manually edit.',
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.uploadResume = uploadResume;
// Get all resumes for user
const getResumes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const resumes = await prisma_1.prisma.resume.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { versions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({
            success: true,
            data: resumes.map((resume) => ({
                id: resume.id,
                title: resume.title,
                fileName: resume.originalFileName,
                parseStatus: resume.parseStatus,
                versionCount: resume._count.versions,
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
            })),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getResumes = getResumes;
// Get single resume with details
const getResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
            include: {
                versions: {
                    orderBy: { versionNumber: 'desc' },
                    take: 10,
                },
            },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        res.json({
            success: true,
            data: {
                id: resume.id,
                title: resume.title,
                fileName: resume.originalFileName,
                parseStatus: resume.parseStatus,
                parseError: resume.parseError,
                parsedData: resume.parsedData,
                rawText: resume.rawText,
                versions: resume.versions.map((v) => ({
                    id: v.id,
                    versionNumber: v.versionNumber,
                    jobTitle: v.jobTitle,
                    companyName: v.companyName,
                    atsScore: v.atsScore,
                    createdAt: v.createdAt,
                })),
                createdAt: resume.createdAt,
                updatedAt: resume.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getResume = getResume;
// Update resume title
const updateResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title } = req.body;
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        const updated = await prisma_1.prisma.resume.update({
            where: { id },
            data: { title },
        });
        res.json({
            success: true,
            data: {
                id: updated.id,
                title: updated.title,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateResume = updateResume;
// Delete resume
const deleteResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
            include: { versions: true },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        // Delete S3 files
        await (0, storage_1.deleteFile)(resume.originalFileKey);
        for (const version of resume.versions) {
            if (version.pdfFileKey)
                await (0, storage_1.deleteFile)(version.pdfFileKey);
            if (version.docxFileKey)
                await (0, storage_1.deleteFile)(version.docxFileKey);
        }
        // Delete from database (cascades to versions)
        await prisma_1.prisma.resume.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Resume deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteResume = deleteResume;
// Customize resume for job
const customizeResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const organizationId = req.user.organizationId;
        const { id } = req.params;
        const { jobTitle, companyName, jobDescription } = req.body;
        if (!jobTitle || !companyName || !jobDescription) {
            throw new errors_1.ValidationError('Job title, company name, and job description are required');
        }
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        if (resume.parseStatus !== 'completed') {
            throw new errors_1.ValidationError('Resume parsing is not completed');
        }
        // Get next version number
        const latestVersion = await prisma_1.prisma.resumeVersion.findFirst({
            where: { resumeId: id },
            orderBy: { versionNumber: 'desc' },
        });
        const versionNumber = (latestVersion?.versionNumber || 0) + 1;
        // Run full customization pipeline
        const result = await (0, ai_1.fullCustomizationPipeline)(resume.parsedData, resume.rawText, jobDescription, jobTitle, companyName, userId, organizationId);
        // Create version
        const version = await prisma_1.prisma.resumeVersion.create({
            data: {
                resumeId: id,
                userId,
                versionNumber,
                jobTitle,
                companyName,
                jobDescription,
                jobData: result.atsDetails,
                tailoredData: result.tailoredData,
                tailoredText: result.tailoredText,
                changesExplanation: result.changesExplanation,
                matchedKeywords: result.matchedKeywords,
                missingKeywords: result.missingKeywords,
                atsScore: result.atsScore,
                atsDetails: result.atsDetails,
                truthGuardWarnings: result.truthGuardWarnings,
            },
        });
        res.status(201).json({
            success: true,
            data: {
                id: version.id,
                versionNumber: version.versionNumber,
                jobTitle: version.jobTitle,
                companyName: version.companyName,
                atsScore: version.atsScore,
                matchedKeywords: version.matchedKeywords,
                missingKeywords: version.missingKeywords,
                changesExplanation: version.changesExplanation,
                truthGuardWarnings: version.truthGuardWarnings,
                createdAt: version.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.customizeResume = customizeResume;
// Get resume version details
const getVersion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id, versionId } = req.params;
        const version = await prisma_1.prisma.resumeVersion.findFirst({
            where: { id: versionId, resumeId: id, userId },
            include: {
                resume: {
                    select: {
                        parsedData: true,
                        title: true,
                    },
                },
            },
        });
        if (!version) {
            throw new errors_1.NotFoundError('Version not found');
        }
        res.json({
            success: true,
            data: {
                id: version.id,
                versionNumber: version.versionNumber,
                jobTitle: version.jobTitle,
                companyName: version.companyName,
                jobDescription: version.jobDescription,
                originalData: version.resume.parsedData,
                tailoredData: version.tailoredData,
                tailoredText: version.tailoredText,
                changesExplanation: version.changesExplanation,
                matchedKeywords: version.matchedKeywords,
                missingKeywords: version.missingKeywords,
                atsScore: version.atsScore,
                atsDetails: version.atsDetails,
                truthGuardWarnings: version.truthGuardWarnings,
                createdAt: version.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getVersion = getVersion;
// Compare versions (diff view)
const compareVersions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { version1, version2 } = req.query;
        if (!version1 || !version2) {
            throw new errors_1.ValidationError('Both version IDs are required');
        }
        const versions = await prisma_1.prisma.resumeVersion.findMany({
            where: {
                resumeId: id,
                userId,
                id: { in: [version1, version2] },
            },
        });
        if (versions.length !== 2) {
            throw new errors_1.NotFoundError('One or both versions not found');
        }
        const v1 = versions.find((v) => v.id === version1);
        const v2 = versions.find((v) => v.id === version2);
        res.json({
            success: true,
            data: {
                version1: {
                    id: v1.id,
                    versionNumber: v1.versionNumber,
                    jobTitle: v1.jobTitle,
                    companyName: v1.companyName,
                    tailoredData: v1.tailoredData,
                    atsScore: v1.atsScore,
                },
                version2: {
                    id: v2.id,
                    versionNumber: v2.versionNumber,
                    jobTitle: v2.jobTitle,
                    companyName: v2.companyName,
                    tailoredData: v2.tailoredData,
                    atsScore: v2.atsScore,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.compareVersions = compareVersions;
// Download resume version
const downloadVersion = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id, versionId } = req.params;
        const { format = 'pdf', anonymize = 'false' } = req.query;
        const version = await prisma_1.prisma.resumeVersion.findFirst({
            where: { id: versionId, resumeId: id, userId },
            include: {
                user: {
                    include: {
                        organization: true,
                    },
                },
            },
        });
        if (!version) {
            throw new errors_1.NotFoundError('Version not found');
        }
        let resumeData = version.tailoredData;
        // Apply anonymization if requested and allowed
        if (anonymize === 'true' && version.user.organization?.anonymizationEnabled) {
            resumeData = (0, documents_1.anonymizeResumeData)(resumeData, {
                maskName: true,
                maskEmail: true,
                maskPhone: true,
                maskLocation: true,
                maskCompanyNames: false,
            });
        }
        let buffer;
        let contentType;
        let fileName;
        if (format === 'docx') {
            buffer = await (0, documents_1.generateDOCX)(resumeData);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileName = `resume-v${version.versionNumber}-${version.companyName}.docx`;
        }
        else {
            buffer = await (0, documents_1.generatePDF)(resumeData);
            contentType = 'application/pdf';
            fileName = `resume-v${version.versionNumber}-${version.companyName}.pdf`;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(buffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadVersion = downloadVersion;
// Run ATS simulation on version
const simulateATS = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const organizationId = req.user.organizationId;
        const { id, versionId } = req.params;
        const version = await prisma_1.prisma.resumeVersion.findFirst({
            where: { id: versionId, resumeId: id, userId },
        });
        if (!version) {
            throw new errors_1.NotFoundError('Version not found');
        }
        // Get job keywords from stored data
        const jobData = version.jobData;
        const keywords = [
            ...(jobData.requiredSkills || []),
            ...(jobData.keywords || []),
        ];
        // Run ATS analysis
        const atsResult = await (0, ai_1.analyzeATS)(version.tailoredText, keywords, userId, organizationId);
        // Update version with new ATS details
        await prisma_1.prisma.resumeVersion.update({
            where: { id: versionId },
            data: {
                atsScore: atsResult.score,
                atsDetails: atsResult,
            },
        });
        res.json({
            success: true,
            data: {
                score: atsResult.score,
                keywordMatchPercentage: atsResult.keywordMatchPercentage,
                matchedKeywords: atsResult.matchedKeywords,
                missingKeywords: atsResult.missingKeywords,
                sectionScores: atsResult.sectionScores,
                formattingIssues: atsResult.formattingIssues,
                recommendations: atsResult.recommendations,
                atsExtractedView: atsResult.atsExtractedView,
                riskyElements: atsResult.riskyElements,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.simulateATS = simulateATS;
//# sourceMappingURL=resume.js.map