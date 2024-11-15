import { Badge } from '@/components/ui/badge';
import { CardWithMembersWithList } from '@/lib/types';
import { differenceInHours, format, formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';

export default function DueDateBadge({
  optimisticCard,
}: {
  optimisticCard: CardWithMembersWithList;
}) {
  const diffInHours =
    optimisticCard.dueDate &&
    differenceInHours(optimisticCard.dueDate, new Date());

  const dueDateBadgeColor = useMemo(() => {
    if (diffInHours === null) return null;
    if (diffInHours < 0) return 'bg-red-300';
    if (diffInHours < 24) return 'bg-yellow-300';
    return 'bg-slate-300';
  }, [diffInHours]);

  return (
    optimisticCard.dueDate && (
      <div className="self-end">
        <Badge
          title={
            diffInHours! < 0
              ? `This card expired ${formatDistanceToNow(
                  optimisticCard.dueDate
                )} ago`
              : `This card expires in ${formatDistanceToNow(
                  optimisticCard.dueDate
                )}`
          }
          className={`rounded-md hover:bg-${dueDateBadgeColor} focus:bg-${dueDateBadgeColor} px-1 ${dueDateBadgeColor}`}
          variant="secondary"
        >
          <Clock className="w-3 h-3 mr-[5px]" />
          {format(optimisticCard.dueDate, 'dd MMM')}
        </Badge>
      </div>
    )
  );
}
