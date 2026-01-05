import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as companyLogoService from '../services/companyLogoService';
import { ValidationError } from '../utils/errors';

// Get logo for a single company
export const getCompanyLogo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { company } = req.params;
    const size = parseInt(req.query.size as string) || 128;

    if (!company) {
      throw new ValidationError('Company name is required');
    }

    const result = companyLogoService.getCompanyLogo(company, size);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get logos for multiple companies
export const getCompanyLogos = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { companies } = req.body;
    const size = parseInt(req.query.size as string) || 64;

    if (!companies || !Array.isArray(companies)) {
      throw new ValidationError('Companies array is required');
    }

    if (companies.length > 50) {
      throw new ValidationError('Maximum 50 companies allowed per request');
    }

    const results = companyLogoService.getCompanyLogos(companies, size);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// Verify if a logo exists
export const verifyLogo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { company } = req.params;

    if (!company) {
      throw new ValidationError('Company name is required');
    }

    const domain = companyLogoService.getCompanyDomain(company);

    if (!domain) {
      res.json({
        success: true,
        data: {
          exists: false,
          reason: 'Could not determine company domain',
        },
      });
      return;
    }

    const exists = await companyLogoService.verifyClearbitLogo(domain);

    res.json({
      success: true,
      data: {
        exists,
        domain,
        logoUrl: exists
          ? companyLogoService.getClearbitLogoUrl(domain)
          : companyLogoService.getUIAvatarUrl(company),
      },
    });
  } catch (error) {
    next(error);
  }
};
