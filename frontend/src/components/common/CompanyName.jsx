import { useBranding } from '../../context/BrandingContext';

// The admin-configured company name; the default keeps the two-tone product wordmark
export default function CompanyName({ className = '' }) {
  const { companyName } = useBranding();
  if (companyName === 'Cognitive EMS') {
    return <span className={className}>Cognitive <span className="text-blue-600">EMS</span></span>;
  }
  return <span className={`truncate ${className}`} title={companyName}>{companyName}</span>;
}
