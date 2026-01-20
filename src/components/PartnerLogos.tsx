import { usePartnerLogos } from '@/hooks/usePartnerLogos';
export function PartnerLogos() {
  const {
    logos,
    loading
  } = usePartnerLogos();
  if (loading || logos.length === 0) return null;
  return <div className="fixed bottom-0 left-0 right-0 z-20 pb-4 bg-gradient-to-t from-black/30 to-transparent pt-8">
      <div className="flex items-center justify-center gap-8 flex-wrap px-4">
        {logos.map(logo => <img key={logo.id} src={logo.image_url} alt={logo.name} className="h-16 md:h-20 object-contain opacity-90 hover:opacity-100 transition-opacity" />)}
      </div>
    </div>;
}