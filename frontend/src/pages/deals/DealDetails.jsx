import { useParams } from 'react-router-dom';

export default function DealDetails() {
  const { id } = useParams();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-4">Deal Details</h1>
      <p className="text-surface-500">Placeholder for Deal Details page. Deal ID: {id}</p>
    </div>
  );
}
