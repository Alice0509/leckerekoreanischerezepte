export function assertContentfulMigrationSafety({ apply }) {
  const isAutomation = Boolean(process.env.CI || process.env.VERCEL);

  if (!apply) {
    console.warn(
      'DRY RUN: no entries will be changed, but this script uses the Content Management API and consumes CMA quota.'
    );
    return;
  }

  if (isAutomation) {
    throw new Error(
      'Contentful apply mode is blocked in CI and Vercel environments.'
    );
  }

  if (process.env.ALLOW_CONTENTFUL_WRITE !== 'YES') {
    throw new Error('Apply mode requires ALLOW_CONTENTFUL_WRITE=YES.');
  }

  if (process.env.CONFIRM_CONTENTFUL_MIGRATION !== 'YES') {
    throw new Error('Apply mode requires CONFIRM_CONTENTFUL_MIGRATION=YES.');
  }
}
