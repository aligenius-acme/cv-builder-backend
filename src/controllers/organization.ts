import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors';
import { UserRole, SubscriptionStatus } from '@prisma/client';
import { generateToken } from '../utils/encryption';
import { emailService } from '../services/email';

// Create organization
export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, domain } = req.body;

    if (!name) {
      throw new ValidationError('Organization name is required');
    }

    // Check if user already belongs to an org
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser?.organizationId) {
      throw new ValidationError('You already belong to an organization');
    }

    // Check if domain is taken
    if (domain) {
      const existingOrg = await prisma.organization.findUnique({
        where: { domain },
      });
      if (existingOrg) {
        throw new ValidationError('This domain is already registered');
      }
    }

    // Create org and update user in transaction
    const org = await prisma.$transaction(async (tx) => {
      const newOrg = await tx.organization.create({
        data: {
          name,
          domain: domain || null,
          subscription: {
            create: {
              status: SubscriptionStatus.ACTIVE,
              seatsTotal: 5,
              seatsUsed: 1,
            },
          },
        },
        include: {
          subscription: true,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: newOrg.id,
          role: UserRole.ORG_ADMIN,
        },
      });

      return newOrg;
    });

    res.status(201).json({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        domain: org.domain,
        subscription: org.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get organization details
export const getOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            subscription: true,
            users: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    res.json({
      success: true,
      data: {
        id: user.organization.id,
        name: user.organization.name,
        domain: user.organization.domain,
        logoUrl: user.organization.logoUrl,
        primaryColor: user.organization.primaryColor,
        anonymizationEnabled: user.organization.anonymizationEnabled,
        subscription: user.organization.subscription,
        members: user.organization.users,
        isAdmin: user.role === UserRole.ORG_ADMIN,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update organization
export const updateOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, domain, logoUrl, primaryColor, anonymizationEnabled } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    if (user.role !== UserRole.ORG_ADMIN) {
      throw new ForbiddenError('Only organization admins can update settings');
    }

    // Check domain uniqueness if changing
    if (domain && domain !== user.organization.domain) {
      const existingOrg = await prisma.organization.findUnique({
        where: { domain },
      });
      if (existingOrg) {
        throw new ValidationError('This domain is already registered');
      }
    }

    const updated = await prisma.organization.update({
      where: { id: user.organization.id },
      data: {
        ...(name && { name }),
        ...(domain !== undefined && { domain: domain || null }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(anonymizationEnabled !== undefined && { anonymizationEnabled }),
      },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        domain: updated.domain,
        logoUrl: updated.logoUrl,
        primaryColor: updated.primaryColor,
        anonymizationEnabled: updated.anonymizationEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Pending invites storage (in production, use database table)
const pendingInvites = new Map<string, { email: string; orgId: string; expiresAt: Date }>();

// Invite member to organization
export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: { subscription: true },
        },
      },
    });

    if (!user?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    if (user.role !== UserRole.ORG_ADMIN) {
      throw new ForbiddenError('Only organization admins can invite members');
    }

    // Check seat limit
    const memberCount = await prisma.user.count({
      where: { organizationId: user.organization.id },
    });

    const seatLimit = user.organization.subscription?.seatsTotal || 5;
    if (memberCount >= seatLimit) {
      throw new ValidationError('Seat limit reached. Please upgrade your plan.');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser?.organizationId === user.organization.id) {
      throw new ValidationError('User is already a member of this organization');
    }

    // Generate invite token
    const inviteToken = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invite (in production, use database)
    pendingInvites.set(inviteToken, {
      email: email.toLowerCase(),
      orgId: user.organization.id,
      expiresAt,
    });

    // Send invite email
    const inviterName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email;
    await emailService.sendOrgInviteEmail(
      email,
      user.organization.name,
      inviterName,
      inviteToken
    );

    res.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    next(error);
  }
};

// Accept invite
export const acceptInvite = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Invite token is required');
    }

    const invite = pendingInvites.get(token);
    if (!invite) {
      throw new ValidationError('Invalid or expired invite');
    }

    if (invite.expiresAt < new Date()) {
      pendingInvites.delete(token);
      throw new ValidationError('Invite has expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.email.toLowerCase() !== invite.email) {
      throw new ForbiddenError('This invite is for a different email address');
    }

    if (user.organizationId) {
      throw new ValidationError('You already belong to an organization');
    }

    // Add user to org
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          organizationId: invite.orgId,
          role: UserRole.ORG_USER,
        },
      }),
      prisma.orgSubscription.update({
        where: { organizationId: invite.orgId },
        data: {
          seatsUsed: { increment: 1 },
        },
      }),
    ]);

    // Remove invite
    pendingInvites.delete(token);

    const org = await prisma.organization.findUnique({
      where: { id: invite.orgId },
    });

    res.json({
      success: true,
      message: `You have joined ${org?.name}`,
      data: {
        organizationId: invite.orgId,
        organizationName: org?.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from organization
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { memberId } = req.params;

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!admin?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    if (admin.role !== UserRole.ORG_ADMIN) {
      throw new ForbiddenError('Only organization admins can remove members');
    }

    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== admin.organization.id) {
      throw new NotFoundError('Member not found in your organization');
    }

    if (memberId === userId) {
      throw new ValidationError('You cannot remove yourself');
    }

    // Remove from org
    await prisma.$transaction([
      prisma.user.update({
        where: { id: memberId },
        data: {
          organizationId: null,
          role: UserRole.USER,
        },
      }),
      prisma.orgSubscription.update({
        where: { organizationId: admin.organization.id },
        data: {
          seatsUsed: { decrement: 1 },
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Member removed from organization',
    });
  } catch (error) {
    next(error);
  }
};

// Update member role
export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { memberId } = req.params;
    const { role } = req.body;

    if (!role || ![UserRole.ORG_ADMIN, UserRole.ORG_USER].includes(role)) {
      throw new ValidationError('Valid role is required (ORG_ADMIN or ORG_USER)');
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!admin?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    if (admin.role !== UserRole.ORG_ADMIN) {
      throw new ForbiddenError('Only organization admins can change roles');
    }

    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== admin.organization.id) {
      throw new NotFoundError('Member not found in your organization');
    }

    const updated = await prisma.user.update({
      where: { id: memberId },
      data: { role },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Leave organization
export const leaveOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!user?.organization) {
      throw new NotFoundError('You are not part of an organization');
    }

    // Check if user is last admin
    if (user.role === UserRole.ORG_ADMIN) {
      const otherAdmins = user.organization.users.filter(
        (u) => u.id !== userId && u.role === UserRole.ORG_ADMIN
      );
      if (otherAdmins.length === 0 && user.organization.users.length > 1) {
        throw new ValidationError(
          'You must assign another admin before leaving the organization'
        );
      }
    }

    // Remove from org
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          organizationId: null,
          role: UserRole.USER,
        },
      }),
      prisma.orgSubscription.update({
        where: { organizationId: user.organization.id },
        data: {
          seatsUsed: { decrement: 1 },
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'You have left the organization',
    });
  } catch (error) {
    next(error);
  }
};
