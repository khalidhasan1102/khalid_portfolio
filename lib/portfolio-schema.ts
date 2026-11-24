export type Field = {
  key: string;
  label: string;
  type?:
    | 'text'
    | 'area'
    | 'list'
    | 'image'
    | 'pdf'
    | 'url'
    | 'email'
    | 'percentage'
    | 'icon'
    | 'destination';
};

export const sections: Record<
  string,
  { label: string; fields: Field[] }
> = {
  personal: {
    label: 'Home & Contact',
    fields: [
      { key: 'educationSubtitle', label: 'education section description', type: 'area' },
      { key: 'skillsSubtitle', label: 'skills section description', type: 'area' },
      { key: 'coursesSubtitle', label: 'courses section description', type: 'area' },
      { key: 'workSubtitle', label: 'work section description', type: 'area' },
      { key: 'researchSubtitle', label: 'research section description', type: 'area' },
      { key: 'gallerySubtitle', label: 'gallery section description', type: 'area' },
      { key: 'contactSubtitle', label: 'contact section description', type: 'area' },
      { key: 'primaryLabel', label: 'Primary button label' },
      { key: 'primaryTarget', label: 'Primary button destination', type: 'destination' },
      { key: 'secondaryLabel', label: 'Secondary button label' },
      { key: 'secondaryTarget', label: 'Secondary button destination', type: 'destination' },
      { key: 'expertise1', label: 'Expertise 1 label' },
      { key: 'expertise1Text', label: 'Expertise 1 description' },
      { key: 'expertise2', label: 'Expertise 2 label' },
      { key: 'expertise2Text', label: 'Expertise 2 description' },
      { key: 'expertise3', label: 'Expertise 3 label' },
      { key: 'expertise3Text', label: 'Expertise 3 description' },
      { key: 'academicFocus', label: 'Academic Focus — one item per row', type: 'list' },
      { key: 'profileImage', label: 'Profile photo', type: 'image' },
      { key: 'about', label: 'About Me', type: 'area' },
      { key: 'name', label: 'Full name' },
      { key: 'heroFirst', label: 'Homepage name — first line' },
      { key: 'heroLast', label: 'Homepage name — second line' },
      { key: 'role', label: 'Professional title' },
      { key: 'intro', label: 'Introduction', type: 'area' },
      { key: 'heroImage', label: 'Homepage illustration', type: 'image' },
      { key: 'location', label: 'Location' },
      { key: 'company', label: 'Current company' },
      { key: 'since', label: 'Working since' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone number' },
      { key: 'facebook', label: 'Facebook URL', type: 'url' },
      { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
      { key: 'github', label: 'GitHub URL', type: 'url' },
      { key: 'cvUrl', label: 'CV file', type: 'pdf' },
    ],
  },

  gallery: {
    label: 'Gallery',
    fields: [
      { key: 'context', label: 'Year / location / project (optional)' },
      { key: 'title', label: 'Image title' },
      { key: 'category', label: 'Category (e.g. Maps, Fieldwork)' },
      { key: 'caption', label: 'Caption (e.g. Sample image or your own caption)' },
      { key: 'image', label: 'Image', type: 'image' },
    ],
  },

  research: {
    label: 'Research Projects',
    fields: [
      { key: 'githubUrl', label: 'GitHub repository URL', type: 'url' },
      { key: 'skills', label: 'Relevant skills', type: 'list' },
      { key: 'objective', label: 'Objective', type: 'area' },
      { key: 'dataUsed', label: 'Data used', type: 'area' },
      { key: 'toolsUsed', label: 'Tools used', type: 'area' },
      { key: 'methodology', label: 'Methodology', type: 'area' },
      { key: 'result', label: 'Result / output', type: 'area' },
      { key: 'title', label: 'Project title' },
      { key: 'description', label: 'Short description', type: 'area' },
      { key: 'image', label: 'Project cover image', type: 'image' },
      { key: 'caption', label: 'Image caption' },
      { key: 'categories', label: 'Categories — comma separated', type: 'list' },
      { key: 'tags', label: 'Tags — comma separated', type: 'list' },
      { key: 'details', label: 'Project overview', type: 'area' },
      { key: 'link', label: 'Project / repository URL', type: 'url' },
    ],
  },

  education: {
    label: 'Education',
    fields: [
      { key: 'subject', label: 'Subject (optional)' },
      { key: 'academicFocus', label: 'Academic Focus', type: 'area' },
      { key: 'coursework', label: 'Related Coursework', type: 'list' },
      { key: 'title', label: 'Degree' },
      { key: 'college', label: 'Institution' },
      { key: 'session', label: 'Session' },
      { key: 'affiliation', label: 'Affiliation' },
      { key: 'status', label: 'Status (Ongoing / Completed)' },
      { key: 'cgpa', label: 'CGPA (leave empty to hide)' },
      { key: 'note', label: 'Description', type: 'area' },
      { key: 'image', label: 'Illustration', type: 'image' },
    ],
  },

  courses: {
    label: 'Courses & Workshops',
    fields: [
      { key: 'title', label: 'Course title' },
      { key: 'eyebrow', label: 'Section label' },
      { key: 'date', label: 'Date' },
      { key: 'provider', label: 'Provider' },
      { key: 'text', label: 'Description', type: 'area' },
      { key: 'tags', label: 'Tags — comma separated', type: 'list' },
      { key: 'image', label: 'Image (optional)', type: 'image' },
    ],
  },

  softSkills: {
    label: 'Soft Skills',
    fields: [
      { key: 'title', label: 'Skill name' },
      { key: 'text', label: 'Description', type: 'area' },
      { key: 'percentage', label: 'Proficiency (%)', type: 'percentage' },
      { key: 'image', label: 'Icon / image (optional)', type: 'image' },
      { key: 'icon', label: 'Skill icon (used when no image is selected)', type: 'icon' },
    ],
  },

  skills: {
    label: 'Professional Skills',
    fields: [
      { key: 'group', label: 'Skill group (e.g. Core Geospatial)' },
      { key: 'level', label: 'Proficiency label (only if confirmed; otherwise leave empty)' },
      { key: 'topics', label: 'Related methods / tools — comma separated', type: 'list' },
      { key: 'percentage', label: 'Proficiency (%)', type: 'percentage' },
      { key: 'title', label: 'Skill name' },
      { key: 'text', label: 'Description', type: 'area' },
      { key: 'image', label: 'Icon / image', type: 'image' },
      { key: 'icon', label: 'Skill icon (used when no image is selected)', type: 'icon' },
    ],
  },

  experience: {
    label: 'Work Experience',
    fields: [
      { key: 'imageCaption', label: 'Image caption' },
      { key: 'title', label: 'Job title' },
      { key: 'company', label: 'Organization' },
      { key: 'date', label: 'Date range' },
      { key: 'text', label: 'Description', type: 'area' },
      { key: 'tags', label: 'Tags — comma separated', type: 'list' },
      { key: 'image', label: 'Illustration', type: 'image' },
    ],
  },
};

export type RecordData = Record<string, string | string[]>;

export type PortfolioData = { personal: RecordData } & Record<
  string,
  RecordData | RecordData[]
>;

export function validatePortfolio(input: unknown): PortfolioData {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Error('Invalid portfolio data.');
  }

  const result: Record<string, unknown> = {};

  for (const [section, def] of Object.entries(sections)) {
    const source = (input as Record<string, unknown>)[section];
    const rows = section === 'personal' ? [source] : source;

    if (!Array.isArray(rows) || rows.length > 200) {
      throw Error('Invalid ' + def.label + ' records (maximum 200).');
    }

    const validated = rows.map((row, i) => {
      if (!row || typeof row !== 'object' || Array.isArray(row)) {
        throw Error('Invalid record in ' + def.label);
      }

      const record: RecordData = {};

      for (const f of def.fields) {
        const value =
          (row as Record<string, unknown>)[f.key] ??
          (f.type === 'list' ? [] : '');

        // ---- list type ----
        if (f.type === 'list') {
          if (
            !Array.isArray(value) ||
            value.length > 30 ||
            value.some((t) => typeof t !== 'string' || t.length > 100)
          ) {
            throw Error('Invalid ' + f.label);
          }
          record[f.key] = value.map((t) => t.trim()).filter(Boolean);
          continue;
        }

        // ---- string types ----
        if (
          typeof value !== 'string' ||
          value.length > (f.type === 'area' ? 15000 : 1000)
        ) {
          throw Error('Invalid ' + f.label);
        }

        const text = value.trim();

        if (
          f.type === 'percentage' &&
          (!/^\d{1,3}$/.test(text) || Number(text) > 100)
        ) {
          throw Error(
            def.label +
              ' item ' +
              (i + 1) +
              ': enter a whole percentage from 0 to 100.'
          );
        }

        if ((f.key === 'title' || f.key === 'name') && !text) {
          throw Error(
            def.label + ' item ' + (i + 1) + ': ' + f.label + ' is required.'
          );
        }

        if (f.type === 'url' && text) {
          let u;
          try {
            u = new URL(text);
          } catch {
            throw Error(f.label + ' must be a full https:// URL.');
          }
          if (u.protocol !== 'https:') {
            throw Error(f.label + ' must use https://.');
          }
        }

        if (
          f.type === 'destination' &&
          text &&
          ![
            'Home',
            'Education',
            'Courses & Workshops',
            'Skills',
            'Work Experience',
            'Research Projects',
            'Gallery',
            'Contact',
          ].includes(text)
        ) {
          throw Error('Choose a valid portfolio page.');
        }

        if (
          f.type === 'email' &&
          text &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
        ) {
          throw Error('Enter a valid email address.');
        }

        // ---- image / pdf path validation (nested paths allowed) ----
        if (
          (f.type === 'image' || f.type === 'pdf') &&
          text &&
          !/^\/(?:images|uploads)\/[a-zA-Z0-9_./-]+$/.test(text) &&
          !(f.type === 'pdf' && text === '/khalid_cv_01.pdf')
        ) {
          throw Error(
            f.label + ': upload a file or use an existing local asset path.'
          );
        }

        record[f.key] = text;
      }

      return record;
    });

    result[section] = section === 'personal' ? validated[0] : validated;
  }

  return result as PortfolioData;
}