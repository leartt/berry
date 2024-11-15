import { CheckCircle } from 'lucide-react';

const FeatureCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col items-center text-center space-y-2 border-gray-800 p-4 rounded-lg">
      <div className="p-2 bg-gray-900 rounded-full">
        <CheckCircle className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {description}
      </p>
    </div>
  );
};
export default FeatureCard;
