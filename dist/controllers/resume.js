"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewResume = exports.downloadResume = exports.updateResumeContent = exports.createBlankResume = exports.scrapeJobUrl = exports.simulateATS = exports.downloadVersion = exports.compareVersions = exports.getVersion = exports.customizeResume = exports.deleteResume = exports.updateResume = exports.getResume = exports.getResumes = exports.uploadResume = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_1 = require("../services/storage");
const parser_1 = require("../services/parser");
const ai_1 = require("../services/ai");
const documents_1 = require("../services/documents");
const template_registry_1 = require("../services/template-registry");
const subscription_1 = require("../middleware/subscription");
const jobScraper_1 = require("../services/jobScraper");
const client_1 = require("@prisma/client");
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
            const parsedData = await (0, parser_1.extractResumeData)(rawText);
            const updatedResume = await prisma_1.prisma.resume.update({
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
                    id: updatedResume.id,
                    title: updatedResume.title,
                    fileName: updatedResume.originalFileName,
                    parseStatus: updatedResume.parseStatus,
                    parsedData: updatedResume.parsedData,
                    rawText: updatedResume.rawText,
                    createdAt: updatedResume.createdAt,
                    updatedAt: updatedResume.updatedAt,
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
                photoUrl: resume.photoUrl,
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
        // Ensure parsedData is properly returned as an object
        const parsedData = resume.parsedData && typeof resume.parsedData === 'object'
            ? resume.parsedData
            : {};
        res.json({
            success: true,
            data: {
                id: resume.id,
                title: resume.title,
                fileName: resume.originalFileName,
                parseStatus: resume.parseStatus,
                parseError: resume.parseError,
                parsedData: parsedData,
                photoUrl: resume.photoUrl,
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
        // Check version quota
        const versionCount = await prisma_1.prisma.resumeVersion.count({
            where: { resumeId: id },
        });
        const limits = (0, subscription_1.getSubscriptionLimits)(req.user.planType);
        if (limits.maxVersionsPerResume !== -1 && versionCount >= limits.maxVersionsPerResume) {
            const currentPlan = req.user.planType;
            const upgradeMessage = currentPlan === client_1.PlanType.FREE
                ? 'Upgrade to Pro or Business for unlimited resume versions.'
                : 'Upgrade to Business for unlimited resume versions.';
            throw new errors_1.QuotaExceededError(`You've reached your plan's limit of ${limits.maxVersionsPerResume} versions per resume (${versionCount}/${limits.maxVersionsPerResume}). ${upgradeMessage}`);
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
        const { format = 'pdf', anonymize = 'false', template = 'professional' } = req.query;
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
        // Validate template exists in database
        const templateId = template;
        const dbTemplate = await (0, template_registry_1.getTemplateById)(templateId);
        if (!dbTemplate) {
            throw new errors_1.ValidationError(`Invalid template: ${templateId}`);
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
            buffer = await (0, documents_1.generateDOCXFromRegistry)(resumeData, templateId);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileName = `resume-v${version.versionNumber}-${version.companyName}.docx`;
        }
        else {
            buffer = await (0, documents_1.generatePDFFromRegistry)(resumeData, templateId);
            contentType = 'application/pdf';
            fileName = `resume-v${version.versionNumber}-${version.companyName}.pdf`;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length.toString());
        res.end(buffer, 'binary');
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
// Scrape job posting from URL
const scrapeJobUrl = async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url) {
            throw new errors_1.ValidationError('Job posting URL is required');
        }
        // Validate URL format
        try {
            new URL(url);
        }
        catch {
            throw new errors_1.ValidationError('Invalid URL format');
        }
        // Scrape the job posting
        const scrapedData = await (0, jobScraper_1.scrapeJobPosting)(url);
        // Format the job description
        const formattedDescription = (0, jobScraper_1.formatJobDescription)(scrapedData);
        res.json({
            success: true,
            data: {
                url: scrapedData.url,
                title: scrapedData.title,
                company: scrapedData.company,
                location: scrapedData.location,
                salary: scrapedData.salary,
                description: formattedDescription,
                requirements: scrapedData.requirements,
                benefits: scrapedData.benefits,
                employmentType: scrapedData.employmentType,
                experienceLevel: scrapedData.experienceLevel,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.scrapeJobUrl = scrapeJobUrl;
// Create a blank resume (for resume builder)
const createBlankResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, template } = req.body;
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
        // Default blank resume structure
        const blankResumeData = {
            contact: {
                name: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                website: '',
            },
            summary: '',
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            projects: [],
            languages: [],
            awards: [],
        };
        // Create resume record with empty rawText (will be generated when user adds content)
        const resume = await prisma_1.prisma.resume.create({
            data: {
                userId,
                title: title || 'Untitled Resume',
                originalFileName: 'Created with Resume Builder',
                originalFileUrl: '',
                originalFileKey: '',
                rawText: '', // Empty initially, generated on first save
                parsedData: blankResumeData,
                parseStatus: 'completed',
                isBase: true,
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
                title: resume.title,
                parsedData: blankResumeData,
                createdAt: resume.createdAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBlankResume = createBlankResume;
// Update resume content (for resume builder)
const updateResumeContent = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { parsedData, title, photoUrl } = req.body;
        console.log('=== UPDATE RESUME CONTENT DEBUG ===');
        console.log('Resume ID:', id);
        console.log('Received parsedData:', JSON.stringify(parsedData, null, 2));
        console.log('Title:', title);
        console.log('PhotoUrl:', photoUrl);
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        console.log('Current parsedData in DB:', JSON.stringify(resume.parsedData, null, 2));
        // Validate parsedData structure
        if (parsedData) {
            const validSections = [
                'contact', 'summary', 'experience', 'education',
                'skills', 'certifications', 'projects', 'languages', 'awards', 'photoUrl'
            ];
            for (const key of Object.keys(parsedData)) {
                if (!validSections.includes(key)) {
                    throw new errors_1.ValidationError(`Invalid section: ${key}`);
                }
            }
        }
        // Merge with existing data
        const currentData = resume.parsedData;
        const updatedData = parsedData ? { ...currentData, ...parsedData } : currentData;
        // Add photoUrl to parsedData if provided
        if (photoUrl !== undefined) {
            updatedData.photoUrl = photoUrl;
            // Also add to contact info
            if (updatedData.contact) {
                updatedData.contact.photoUrl = photoUrl;
            }
        }
        console.log('Merged updatedData:', JSON.stringify(updatedData, null, 2));
        // Generate raw text from parsed data for search/ATS purposes
        const rawText = generateRawTextFromParsedData(updatedData);
        console.log('Generated rawText length:', rawText.length);
        console.log('Generated rawText preview:', rawText.substring(0, 200));
        const updated = await prisma_1.prisma.resume.update({
            where: { id },
            data: {
                parsedData: updatedData,
                rawText,
                ...(title && { title }),
                ...(photoUrl !== undefined && { photoUrl }),
                updatedAt: new Date(),
            },
        });
        res.json({
            success: true,
            data: {
                id: updated.id,
                title: updated.title,
                parsedData: updatedData,
                photoUrl: updated.photoUrl,
                updatedAt: updated.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateResumeContent = updateResumeContent;
// Helper function to generate raw text from parsed data
function generateRawTextFromParsedData(data) {
    const lines = [];
    // Contact
    if (data.contact) {
        if (data.contact.name)
            lines.push(data.contact.name);
        if (data.contact.email)
            lines.push(data.contact.email);
        if (data.contact.phone)
            lines.push(data.contact.phone);
        if (data.contact.location)
            lines.push(data.contact.location);
    }
    // Summary
    if (data.summary) {
        lines.push('SUMMARY', data.summary);
    }
    // Experience
    if (data.experience && data.experience.length > 0) {
        lines.push('EXPERIENCE');
        for (const exp of data.experience) {
            lines.push(`${exp.title} at ${exp.company}`);
            if (exp.location)
                lines.push(exp.location);
            if (exp.startDate)
                lines.push(`${exp.startDate} - ${exp.endDate || 'Present'}`);
            if (exp.description) {
                for (const desc of exp.description) {
                    lines.push(`• ${desc}`);
                }
            }
        }
    }
    // Education
    if (data.education && data.education.length > 0) {
        lines.push('EDUCATION');
        for (const edu of data.education) {
            lines.push(edu.degree);
            lines.push(edu.institution);
            if (edu.graduationDate)
                lines.push(edu.graduationDate);
        }
    }
    // Skills
    if (data.skills && data.skills.length > 0) {
        lines.push('SKILLS');
        lines.push(data.skills.join(', '));
    }
    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        lines.push('CERTIFICATIONS');
        lines.push(data.certifications.join(', '));
    }
    // Projects
    if (data.projects && data.projects.length > 0) {
        lines.push('PROJECTS');
        for (const proj of data.projects) {
            lines.push(proj.name);
            if (proj.description)
                lines.push(proj.description);
            if (proj.technologies)
                lines.push(proj.technologies.join(', '));
        }
    }
    return lines.join('\n');
}
// Download resume directly (for resume builder - no version needed)
const downloadResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { format = 'pdf', template = 'london-navy' } = req.query;
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        // Validate template exists in database
        const templateId = template;
        const templateMetadata = await (0, template_registry_1.getTemplateById)(templateId);
        if (!templateMetadata) {
            throw new errors_1.ValidationError(`Invalid template: ${templateId}`);
        }
        const resumeData = resume.parsedData;
        let buffer;
        let contentType;
        let fileName;
        if (format === 'docx') {
            buffer = await (0, documents_1.generateDOCXFromRegistry)(resumeData, templateId);
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileName = `${resume.title || 'resume'}.docx`;
        }
        else {
            buffer = await (0, documents_1.generatePDFFromRegistry)(resumeData, templateId);
            contentType = 'application/pdf';
            fileName = `${resume.title || 'resume'}.pdf`;
        }
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', buffer.length.toString());
        res.end(buffer, 'binary');
    }
    catch (error) {
        next(error);
    }
};
exports.downloadResume = downloadResume;
// Preview resume as HTML (for live preview)
const previewResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { template = 'corporate-standard' } = req.query;
        const resume = await prisma_1.prisma.resume.findFirst({
            where: { id, userId },
        });
        if (!resume) {
            throw new errors_1.NotFoundError('Resume not found');
        }
        // Validate and get template from database
        const templateId = template;
        const templateMetadata = await (0, template_registry_1.getTemplateById)(templateId);
        if (!templateMetadata) {
            throw new errors_1.ValidationError(`Invalid template: ${templateId}`);
        }
        const resumeData = resume.parsedData;
        // Generate preview using HTML templates (matches preview images)
        console.log(`🎯 Generating preview for template: ${templateId}`);
        const { generateTemplatePDF } = await Promise.resolve().then(() => __importStar(require('../services/template-html-generator')));
        const buffer = await generateTemplatePDF(templateId, resumeData);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(buffer);
    }
    catch (error) {
        next(error);
    }
};
exports.previewResume = previewResume;
//# sourceMappingURL=resume.js.map