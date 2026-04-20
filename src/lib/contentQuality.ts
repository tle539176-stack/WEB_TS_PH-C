import type { EditorImage } from '@/types/editor';

export type QualitySeverity = 'error' | 'warning' | 'info';

export type QualityCheck = {
  id: string;
  label: string;
  severity: QualitySeverity;
  passed: boolean;
  detail?: string;
};

const MEDICAL_RISK_TERMS = [
  'chữa khỏi',
  'điều trị',
  'trị bệnh',
  'khỏi bệnh',
  'cam kết',
  'hiệu quả tức thì',
  'thay thế thuốc',
  'không cần bác sĩ',
  'giảm cân thần tốc',
  'ung thư',
  'tiểu đường',
  'huyết áp',
];

function hasPrimaryImage(images: EditorImage[]) {
  return images.some(image => image.isPrimary);
}

function hasAltText(images: EditorImage[]) {
  return images.length > 0 && images.every(image => image.alt.trim().length > 0);
}

export function findMedicalRiskTerms(text: string): string[] {
  const source = text.toLowerCase();
  return MEDICAL_RISK_TERMS.filter(term => source.includes(term));
}

export function hasBlockingErrors(checks: QualityCheck[]): boolean {
  return checks.some(check => check.severity === 'error' && !check.passed);
}

export function hasWarnings(checks: QualityCheck[]): boolean {
  return checks.some(check => check.severity === 'warning' && !check.passed);
}

export function getProductPublishChecks(form: {
  name: string;
  price: number;
  description: string;
  images: EditorImage[];
}): QualityCheck[] {
  const riskTerms = findMedicalRiskTerms(`${form.name} ${form.description}`);
  return [
    { id: 'name', label: 'Có tên sản phẩm', severity: 'error', passed: form.name.trim().length > 0 },
    { id: 'price', label: 'Có giá sản phẩm', severity: 'error', passed: form.price > 0 },
    { id: 'description', label: 'Mô tả tối thiểu 30 ký tự', severity: 'error', passed: form.description.trim().length >= 30 },
    { id: 'image', label: 'Có ít nhất 1 ảnh', severity: 'error', passed: form.images.length > 0 },
    { id: 'primary', label: 'Có ảnh chính', severity: 'error', passed: hasPrimaryImage(form.images) },
    { id: 'gallery', label: 'Nên có ít nhất 3 ảnh', severity: 'warning', passed: form.images.length >= 3 },
    { id: 'alt', label: 'Alt text đầy đủ cho ảnh', severity: 'warning', passed: hasAltText(form.images) },
    {
      id: 'medical-claims',
      label: 'Không có từ khóa claim y tế nhạy cảm',
      severity: 'warning',
      passed: riskTerms.length === 0,
      detail: riskTerms.length ? `Từ khóa: ${riskTerms.join(', ')}` : undefined,
    },
  ];
}

export function getBookPublishChecks(form: {
  title: string;
  author: string;
  description: string;
  images: EditorImage[];
}): QualityCheck[] {
  return [
    { id: 'title', label: 'Có tên sách', severity: 'error', passed: form.title.trim().length > 0 },
    { id: 'author', label: 'Có tác giả', severity: 'error', passed: form.author.trim().length > 0 },
    { id: 'description', label: 'Mô tả tối thiểu 50 ký tự', severity: 'error', passed: form.description.trim().length >= 50 },
    { id: 'image', label: 'Có ít nhất 1 ảnh bìa', severity: 'error', passed: form.images.length > 0 },
    { id: 'primary', label: 'Có ảnh chính', severity: 'error', passed: hasPrimaryImage(form.images) },
    { id: 'alt', label: 'Alt text đầy đủ cho ảnh', severity: 'warning', passed: hasAltText(form.images) },
  ];
}
