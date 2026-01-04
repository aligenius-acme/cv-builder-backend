import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest } from '../middleware/auth';

// Get all A/B tests for user
export const getTests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    const where: any = { userId };
    if (status && status !== 'all') {
      where.status = status;
    }

    const tests = await prisma.resumeABTest.findMany({
      where,
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            views: true,
            downloads: true,
            applications: true,
            responses: true,
            interviews: true,
            responseRate: true,
            shareToken: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: tests,
    });
  } catch (error) {
    console.error('Error fetching A/B tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B tests',
    });
  }
};

// Get single A/B test with details
export const getTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const test = await prisma.resumeABTest.findFirst({
      where: { id, userId },
      include: {
        variants: {
          include: {
            events: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    // Calculate additional stats
    const stats = {
      totalViews: test.variants.reduce((sum, v) => sum + v.views, 0),
      totalDownloads: test.variants.reduce((sum, v) => sum + v.downloads, 0),
      totalResponses: test.variants.reduce((sum, v) => sum + v.responses, 0),
      avgResponseRate: test.variants.length > 0
        ? test.variants.reduce((sum, v) => sum + v.responseRate, 0) / test.variants.length
        : 0,
    };

    res.json({
      success: true,
      data: { ...test, stats },
    });
  } catch (error) {
    console.error('Error fetching A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch A/B test',
    });
  }
};

// Create new A/B test
export const createTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, description, targetJobTitle, targetCompany, goal, variants } = req.body;

    if (!name || !variants || variants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Test name and at least 2 variants are required',
      });
    }

    const test = await prisma.resumeABTest.create({
      data: {
        userId,
        name,
        description,
        targetJobTitle,
        targetCompany,
        goal: goal || 'response_rate',
        variants: {
          create: variants.map((v: any, index: number) => ({
            name: v.name || `Version ${String.fromCharCode(65 + index)}`,
            resumeVersionId: v.resumeVersionId,
            customContent: v.customContent,
            shareToken: uuidv4(),
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Error creating A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create A/B test',
    });
  }
};

// Update A/B test
export const updateTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, targetJobTitle, targetCompany, goal } = req.body;

    const existing = await prisma.resumeABTest.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    const test = await prisma.resumeABTest.update({
      where: { id },
      data: {
        name,
        description,
        targetJobTitle,
        targetCompany,
        goal,
      },
      include: {
        variants: true,
      },
    });

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Error updating A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update A/B test',
    });
  }
};

// Start/pause/complete A/B test
export const updateTestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status, winningVariantId } = req.body;

    const existing = await prisma.resumeABTest.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    const updateData: any = { status };

    if (status === 'RUNNING' && !existing.startedAt) {
      updateData.startedAt = new Date();
    }

    if (status === 'COMPLETED') {
      updateData.endedAt = new Date();
      if (winningVariantId) {
        updateData.winningVariantId = winningVariantId;
      }
    }

    const test = await prisma.resumeABTest.update({
      where: { id },
      data: updateData,
      include: {
        variants: true,
      },
    });

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Error updating A/B test status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update A/B test status',
    });
  }
};

// Delete A/B test
export const deleteTest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.resumeABTest.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    await prisma.resumeABTest.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'A/B test deleted',
    });
  } catch (error) {
    console.error('Error deleting A/B test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete A/B test',
    });
  }
};

// Record event for variant (public endpoint)
export const recordEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shareToken } = req.params;
    const { eventType, metadata } = req.body;

    const variant = await prisma.aBTestVariant.findUnique({
      where: { shareToken },
      include: {
        test: true,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found',
      });
    }

    // Only record events for running tests
    if (variant.test.status !== 'RUNNING') {
      return res.json({
        success: true,
        message: 'Test is not running',
      });
    }

    // Create event
    await prisma.aBTestEvent.create({
      data: {
        variantId: variant.id,
        eventType,
        metadata,
        visitorIp: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Update variant metrics
    const updateData: any = {};
    if (eventType === 'view') {
      updateData.views = { increment: 1 };
    } else if (eventType === 'download') {
      updateData.downloads = { increment: 1 };
    } else if (eventType === 'application_sent') {
      updateData.applications = { increment: 1 };
    } else if (eventType === 'response_received') {
      updateData.responses = { increment: 1 };
    } else if (eventType === 'interview_scheduled') {
      updateData.interviews = { increment: 1 };
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await prisma.aBTestVariant.update({
        where: { id: variant.id },
        data: updateData,
      });

      // Update response rate
      if (updated.applications > 0) {
        await prisma.aBTestVariant.update({
          where: { id: variant.id },
          data: {
            responseRate: (updated.responses / updated.applications) * 100,
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Event recorded',
    });
  } catch (error) {
    console.error('Error recording event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record event',
    });
  }
};

// Add variant to existing test
export const addVariant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, resumeVersionId, customContent } = req.body;

    const test = await prisma.resumeABTest.findFirst({
      where: { id, userId },
      include: { variants: true },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    if (test.status === 'RUNNING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add variants to a running test',
      });
    }

    const variant = await prisma.aBTestVariant.create({
      data: {
        testId: id,
        name: name || `Version ${String.fromCharCode(65 + test.variants.length)}`,
        resumeVersionId,
        customContent,
        shareToken: uuidv4(),
      },
    });

    res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error('Error adding variant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add variant',
    });
  }
};

// Remove variant from test
export const removeVariant = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id, variantId } = req.params;

    const test = await prisma.resumeABTest.findFirst({
      where: { id, userId },
      include: { variants: true },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    if (test.status === 'RUNNING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove variants from a running test',
      });
    }

    if (test.variants.length <= 2) {
      return res.status(400).json({
        success: false,
        message: 'A/B test must have at least 2 variants',
      });
    }

    await prisma.aBTestVariant.delete({
      where: { id: variantId },
    });

    res.json({
      success: true,
      message: 'Variant removed',
    });
  } catch (error) {
    console.error('Error removing variant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove variant',
    });
  }
};

// Get analytics for a test
export const getTestAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const test = await prisma.resumeABTest.findFirst({
      where: { id, userId },
      include: {
        variants: {
          include: {
            events: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    // Build timeline data
    const timeline: any[] = [];
    const eventsByDate: Record<string, Record<string, any>> = {};

    test.variants.forEach((variant) => {
      variant.events.forEach((event) => {
        const date = event.createdAt.toISOString().split('T')[0];
        if (!eventsByDate[date]) {
          eventsByDate[date] = {};
        }
        if (!eventsByDate[date][variant.id]) {
          eventsByDate[date][variant.id] = {
            variantName: variant.name,
            views: 0,
            downloads: 0,
            responses: 0,
          };
        }
        if (event.eventType === 'view') {
          eventsByDate[date][variant.id].views++;
        } else if (event.eventType === 'download') {
          eventsByDate[date][variant.id].downloads++;
        } else if (event.eventType === 'response_received') {
          eventsByDate[date][variant.id].responses++;
        }
      });
    });

    Object.entries(eventsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, variants]) => {
        timeline.push({
          date,
          variants: Object.values(variants),
        });
      });

    // Calculate statistical significance (simplified)
    const variants = test.variants.map((v) => ({
      id: v.id,
      name: v.name,
      views: v.views,
      downloads: v.downloads,
      applications: v.applications,
      responses: v.responses,
      interviews: v.interviews,
      responseRate: v.responseRate,
      conversionRate: v.views > 0 ? (v.downloads / v.views) * 100 : 0,
    }));

    // Find best performer
    const bestPerformer = variants.reduce((best, v) => {
      if (test.goal === 'response_rate') {
        return v.responseRate > (best?.responseRate || 0) ? v : best;
      }
      return v.conversionRate > (best?.conversionRate || 0) ? v : best;
    }, variants[0]);

    res.json({
      success: true,
      data: {
        test: {
          id: test.id,
          name: test.name,
          status: test.status,
          goal: test.goal,
          startedAt: test.startedAt,
          endedAt: test.endedAt,
        },
        variants,
        timeline,
        bestPerformer,
        totalSamples: variants.reduce((sum, v) => sum + v.views, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test analytics',
    });
  }
};

// Update variant metrics manually (for user to record outcomes)
export const updateVariantMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id, variantId } = req.params;
    const { applications, responses, interviews } = req.body;

    const test = await prisma.resumeABTest.findFirst({
      where: { id, userId },
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'A/B test not found',
      });
    }

    const variant = await prisma.aBTestVariant.update({
      where: { id: variantId },
      data: {
        applications: applications !== undefined ? applications : undefined,
        responses: responses !== undefined ? responses : undefined,
        interviews: interviews !== undefined ? interviews : undefined,
      },
    });

    // Update response rate
    if (variant.applications > 0) {
      await prisma.aBTestVariant.update({
        where: { id: variantId },
        data: {
          responseRate: (variant.responses / variant.applications) * 100,
        },
      });
    }

    res.json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error('Error updating variant metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update variant metrics',
    });
  }
};
