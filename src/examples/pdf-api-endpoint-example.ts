/**
 * Example API endpoint for PDF generation
 * This file demonstrates how to integrate the PDF generator into Express routes
 *
 * To use this in your app:
 * 1. Copy this code to your routes file (e.g., src/routes/resume.ts)
 * 2. Import and mount the router in your main app
 * 3. Ensure authentication middleware is applied as needed
 */

import express, { Request, Response } from 'express';
import {
  generatePDFFromReact,
  generatePDFWithTimeout,
  healthCheck,
} from '../services/react-pdf-generator';
import { ParsedResumeData } from '../types';

const router = express.Router();

/**
 * POST /api/resume/generate-pdf
 *
 * Generate PDF from resume data
 *
 * Request body:
 * {
 *   templateId: string,          // e.g., "london-navy"
 *   resumeData: ParsedResumeData,
 *   customColors?: {
 *     primaryColor?: string,
 *     secondaryColor?: string,
 *     accentColor?: string
 *   }
 * }
 *
 * Response: PDF file download
 */
router.post('/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { templateId, resumeData, customColors } = req.body;

    // Validate input
    if (!templateId || !resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: templateId and resumeData',
      });
    }

    // Validate resume data structure
    if (!resumeData.contact || !resumeData.contact.name) {
      return res.status(400).json({
        success: false,
        error: 'Invalid resume data: contact.name is required',
      });
    }

    console.log(`Generating PDF for template: ${templateId}`);

    // Generate PDF with 15 second timeout
    const pdfBuffer = await generatePDFWithTimeout(
      templateId,
      resumeData as ParsedResumeData,
      customColors,
      15000
    );

    // Set response headers for PDF download
    const filename = `resume-${resumeData.contact.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Send PDF
    res.send(pdfBuffer);

    console.log(`PDF generated successfully: ${filename} (${pdfBuffer.length} bytes)`);
  } catch (error) {
    console.error('PDF generation failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'PDF generation timed out. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * GET /api/resume/templates
 *
 * Get list of available templates
 */
router.get('/templates', (req: Request, res: Response) => {
  try {
    const { getAllTemplates } = require('../services/templates');
    const templates = getAllTemplates();

    res.json({
      success: true,
      data: templates,
      total: templates.length,
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates',
    });
  }
});

/**
 * GET /api/resume/templates/:category
 *
 * Get templates by category
 */
router.get('/templates/category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { getTemplatesByCategory } = require('../services/templates');
    const templates = getTemplatesByCategory(category);

    res.json({
      success: true,
      data: templates,
      category,
      total: templates.length,
    });
  } catch (error) {
    console.error('Failed to get templates by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates',
    });
  }
});

/**
 * GET /api/resume/pdf-service/health
 *
 * Health check for PDF generation service
 */
router.get('/pdf-service/health', async (req: Request, res: Response) => {
  try {
    const health = await healthCheck();

    if (!health.browserConnected || !health.canGeneratePDF) {
      return res.status(503).json({
        success: false,
        error: 'PDF service is not healthy',
        details: health,
      });
    }

    res.json({
      success: true,
      data: health,
      message: 'PDF service is healthy',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'PDF service health check failed',
    });
  }
});

/**
 * POST /api/resume/preview-pdf
 *
 * Generate PDF preview (returns base64 for frontend preview)
 *
 * Request body: Same as /generate-pdf
 * Response: { success: true, data: { base64: string, size: number } }
 */
router.post('/preview-pdf', async (req: Request, res: Response) => {
  try {
    const { templateId, resumeData, customColors } = req.body;

    if (!templateId || !resumeData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: templateId and resumeData',
      });
    }

    console.log(`Generating PDF preview for template: ${templateId}`);

    // Generate PDF with shorter timeout for preview
    const pdfBuffer = await generatePDFWithTimeout(
      templateId,
      resumeData as ParsedResumeData,
      customColors,
      10000
    );

    // Convert to base64 for frontend preview
    const base64 = pdfBuffer.toString('base64');

    res.json({
      success: true,
      data: {
        base64: `data:application/pdf;base64,${base64}`,
        size: pdfBuffer.length,
        sizeKB: (pdfBuffer.length / 1024).toFixed(2),
      },
    });

    console.log(`PDF preview generated: ${pdfBuffer.length} bytes`);
  } catch (error) {
    console.error('PDF preview generation failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'PDF generation timed out. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF preview',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * POST /api/resume/batch-generate-pdf
 *
 * Generate multiple PDFs at once (e.g., different templates for comparison)
 *
 * Request body:
 * {
 *   requests: Array<{
 *     templateId: string,
 *     resumeData: ParsedResumeData,
 *     customColors?: { ... }
 *   }>
 * }
 *
 * Response: ZIP file containing all PDFs
 */
router.post('/batch-generate-pdf', async (req: Request, res: Response) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid requests array',
      });
    }

    // Limit batch size
    if (requests.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 PDFs per batch request',
      });
    }

    console.log(`Batch generating ${requests.length} PDFs`);

    const { batchGeneratePDFs } = require('../services/react-pdf-generator');
    const pdfs = await batchGeneratePDFs(requests);

    // Create ZIP file
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="resumes-${Date.now()}.zip"`);

    archive.pipe(res);

    // Add each PDF to the archive
    pdfs.forEach((pdfBuffer: Buffer, index: number) => {
      const templateId = requests[index].templateId;
      const name = requests[index].resumeData.contact?.name || 'resume';
      const filename = `${name}-${templateId}.pdf`;
      archive.append(pdfBuffer, { name: filename });
    });

    await archive.finalize();

    console.log(`Batch PDF generation completed: ${pdfs.length} PDFs`);
  } catch (error) {
    console.error('Batch PDF generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate batch PDFs',
    });
  }
});

export default router;

/**
 * Example usage in main app.ts:
 *
 * import pdfRoutes from './examples/pdf-api-endpoint-example';
 *
 * // Mount routes
 * app.use('/api/resume', pdfRoutes);
 *
 * // Graceful shutdown
 * process.on('SIGTERM', async () => {
 *   const { closeBrowser } = require('./services/react-pdf-generator');
 *   await closeBrowser();
 *   process.exit(0);
 * });
 */

/**
 * Frontend usage example:
 *
 * // Generate and download PDF
 * const response = await fetch('/api/resume/generate-pdf', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     templateId: 'london-navy',
 *     resumeData: { ... },
 *     customColors: {
 *       primaryColor: '#1e3a5f'
 *     }
 *   })
 * });
 *
 * const blob = await response.blob();
 * const url = window.URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = 'resume.pdf';
 * a.click();
 *
 * // Preview PDF in iframe
 * const previewResponse = await fetch('/api/resume/preview-pdf', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ templateId, resumeData })
 * });
 *
 * const { data } = await previewResponse.json();
 * document.querySelector('iframe').src = data.base64;
 */
