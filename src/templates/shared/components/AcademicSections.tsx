/**
 * Academic Section Components
 * Specialized components for academic CVs
 */

import React from 'react';
import { ColorPalette } from '../styles/colors';
import { textStyles } from '../styles/typography';
import {
  PublicationEntry,
  GrantEntry,
  TeachingEntry,
  PresentationEntry,
  AcademicServiceEntry,
  ResearchInterest,
} from '../../../types/academic';

/**
 * Publications Section
 * Formats publications in academic citation style
 */
export const PublicationsSection: React.FC<{
  publications: PublicationEntry[];
  colors: ColorPalette;
  citationStyle?: 'apa' | 'mla' | 'chicago';
}> = ({ publications, colors, citationStyle = 'apa' }) => {
  const formatPublication = (pub: PublicationEntry) => {
    // Format authors
    const authorsStr = pub.authors.join(', ');

    // Build citation based on style (simplified APA format)
    let citation = `${authorsStr} (${pub.year}). ${pub.title}`;

    if (pub.journal) {
      citation += `. ${pub.journal}`;
      if (pub.volume) citation += `, ${pub.volume}`;
      if (pub.pages) citation += `, ${pub.pages}`;
    }

    if (pub.doi) {
      citation += `. https://doi.org/${pub.doi}`;
    } else if (pub.url) {
      citation += `. ${pub.url}`;
    }

    return citation;
  };

  return (
    <div>
      {publications.map((pub, index) => (
        <div
          key={index}
          style={{
            marginBottom: 12,
            paddingLeft: 20,
            textIndent: -20,
            color: colors.textLight,
            lineHeight: 1.6,
          }}
        >
          {formatPublication(pub)}
        </div>
      ))}
    </div>
  );
};

/**
 * Grants Section
 * Displays research grants and funding
 */
export const GrantsSection: React.FC<{
  grants: GrantEntry[];
  colors: ColorPalette;
}> = ({ grants, colors }) => {
  return (
    <div>
      {grants.map((grant, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {grant.title}
              </div>
              <div style={{ color: colors.textLight, fontSize: 10 }}>
                {grant.agency}
                {grant.role && ` • ${grant.role}`}
                {grant.amount && ` • ${grant.amount}`}
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                color: colors.textMuted,
                textAlign: 'right',
                marginLeft: 12,
              }}
            >
              {grant.startDate && grant.endDate
                ? `${grant.startDate} - ${grant.endDate}`
                : grant.startDate || grant.endDate}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Teaching Section
 * Displays teaching experience
 */
export const TeachingSection: React.FC<{
  teaching: TeachingEntry[];
  colors: ColorPalette;
}> = ({ teaching, colors }) => {
  return (
    <div>
      {teaching.map((entry, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: colors.text,
                  marginBottom: 2,
                }}
              >
                {entry.course}
                {entry.role && ` (${entry.role})`}
              </div>
              <div style={{ color: colors.textLight, fontSize: 10 }}>
                {entry.institution}
                {entry.students && ` • ${entry.students} students`}
              </div>
            </div>
            <div
              style={{
                fontSize: 10,
                color: colors.textMuted,
                textAlign: 'right',
                marginLeft: 12,
              }}
            >
              {entry.semester && entry.year
                ? `${entry.semester} ${entry.year}`
                : entry.year}
            </div>
          </div>
          {entry.description && entry.description.length > 0 && (
            <ul
              style={{
                margin: '6px 0 0 0',
                paddingLeft: 20,
                color: colors.textLight,
              }}
            >
              {entry.description.map((desc, i) => (
                <li key={i} style={{ marginBottom: 2, fontSize: 10 }}>
                  {desc}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Presentations Section
 * Displays conference presentations and talks
 */
export const PresentationsSection: React.FC<{
  presentations: PresentationEntry[];
  colors: ColorPalette;
}> = ({ presentations, colors }) => {
  return (
    <div>
      {presentations.map((pres, index) => (
        <div key={index} style={{ marginBottom: 12 }}>
          <div style={{ color: colors.textLight, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: colors.text }}>
              {pres.title}
            </span>
            {pres.type && (
              <span style={{ fontStyle: 'italic' }}> ({pres.type})</span>
            )}
            . {pres.event}
            {pres.location && `, ${pres.location}`}
            {pres.date && `. ${pres.date}`}.
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Academic Service Section
 */
export const AcademicServiceSection: React.FC<{
  service: AcademicServiceEntry[];
  colors: ColorPalette;
}> = ({ service, colors }) => {
  return (
    <div>
      {service.map((entry, index) => (
        <div key={index} style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: colors.text }}>
                {entry.role}
              </span>
              {entry.organization && (
                <span style={{ color: colors.textLight }}>
                  {' '}
                  - {entry.organization}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 10,
                color: colors.textMuted,
                marginLeft: 12,
              }}
            >
              {entry.current
                ? `${entry.startDate || ''} - Present`
                : entry.startDate && entry.endDate
                ? `${entry.startDate} - ${entry.endDate}`
                : entry.startDate || entry.endDate}
            </div>
          </div>
          {entry.description && (
            <div
              style={{
                color: colors.textLight,
                fontSize: 10,
                marginTop: 2,
              }}
            >
              {entry.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Research Interests Section
 */
export const ResearchInterestsSection: React.FC<{
  interests: ResearchInterest[];
  colors: ColorPalette;
}> = ({ interests, colors }) => {
  return (
    <div>
      {interests.map((interest, index) => (
        <div key={index} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, color: colors.text, marginBottom: 2 }}>
            {interest.area}
          </div>
          {interest.keywords && interest.keywords.length > 0 && (
            <div style={{ color: colors.textLight, fontSize: 10 }}>
              {interest.keywords.join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Professional Memberships (simple list)
 */
export const ProfessionalMembershipsSection: React.FC<{
  memberships: string[];
  colors: ColorPalette;
}> = ({ memberships, colors }) => {
  return (
    <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
      {memberships.map((membership, index) => (
        <li
          key={index}
          style={{
            marginBottom: 4,
            color: colors.textLight,
          }}
        >
          {membership}
        </li>
      ))}
    </ul>
  );
};
