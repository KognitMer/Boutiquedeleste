import { catalogLastUpdatedAt } from '@/app/catalog-data';

const formattedTimestamp = new Intl.DateTimeFormat('es-UY', {
  dateStyle: 'short',
  timeStyle: 'short',
  hour12: false,
  timeZone: 'America/Montevideo',
}).format(new Date(catalogLastUpdatedAt));

export function CatalogUpdateStatus() {
  return (
    <span className="catalog-update-status">
      Última actualización de precios:{' '}
      <time dateTime={catalogLastUpdatedAt}>{formattedTimestamp} h</time>
    </span>
  );
}
