export type BrandTestData = {
  originalName: string;
  editedName: string;
  originalDescription: string;
  editedDescription: string;
  originalWebsite: string;
  editedWebsite: string;
};

export const brandValidationData = {
  emptyName: '',
  invalidWebsite: 'not-a-valid-url',
  validWebsite: 'https://automation-brand.example.com',
  longDescription: 'A'.repeat(500)
} as const;

export function createBrandTestData(stamp = Date.now()): BrandTestData {
  const originalName = `AUTO Brand ${stamp}`;

  return {
    originalName,
    editedName: `${originalName} Edited`,
    originalDescription: 'Automation brand created to validate the complete brand form.',
    editedDescription: 'Updated by the automated brand edit and persistence test.',
    originalWebsite: `https://brand-${stamp}.example.com`,
    editedWebsite: `https://updated-${stamp}.example.com`
  };
}
