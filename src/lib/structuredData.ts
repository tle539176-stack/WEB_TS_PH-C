import type { NoteWithMedicalMeta } from '../types/database';

export function buildMedicalWebPageJsonLd(note: NoteWithMedicalMeta): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': note.schema_type || 'MedicalWebPage',
    headline: note.seo_title || note.title,
    datePublished: note.published_at ?? undefined,
    dateModified: note.updated_at,
    medicalAudience: note.medical_audience || 'Patient',
  };

  if (note.seo_description || note.excerpt) {
    ld.description = note.seo_description || note.excerpt;
  }
  if (note.cover_image_url) ld.image = note.cover_image_url;
  if (note.reviewed_at) ld.lastReviewed = note.reviewed_at;
  if (note.medical_specialty) ld.specialty = note.medical_specialty;

  if (note.author) {
    const author: Record<string, unknown> = { '@type': 'Person', name: note.author.display_name };
    if (note.author.profile_url) author.url = note.author.profile_url;
    if (note.author.credentials) author.honorificSuffix = note.author.credentials;
    ld.author = author;
  }

  if (note.reviewer) {
    const reviewedBy: Record<string, unknown> = { '@type': 'Person', name: note.reviewer.display_name };
    if (note.reviewer.professional_title) reviewedBy.jobTitle = note.reviewer.professional_title;
    if (note.reviewer.credentials) reviewedBy.honorificSuffix = note.reviewer.credentials;
    if (note.reviewer.profile_url) reviewedBy.url = note.reviewer.profile_url;
    ld.reviewedBy = reviewedBy;
  }

  const citations: string[] = [];
  for (const src of note.note_sources ?? []) {
    if (src.url) citations.push(src.url);
    else if (src.doi) citations.push(`https://doi.org/${src.doi}`);
    else if (src.pmid) citations.push(`https://pubmed.ncbi.nlm.nih.gov/${src.pmid}`);
  }
  // Also include legacy sources JSONB as fallback
  if (citations.length === 0 && note.sources?.length) {
    for (const src of note.sources) {
      if (src.url) citations.push(src.url);
    }
  }
  if (citations.length > 0) ld.citation = citations;

  return ld;
}
