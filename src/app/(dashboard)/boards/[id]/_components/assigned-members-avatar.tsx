import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mergeInitials } from '@/lib/utils';
import { Member } from '@prisma/client';
import React, { useMemo } from 'react';

const colors = [
  'bg-green-500',
  'bg-blue-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
];

const getColorIndex = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash); // Turning the id into a number
  }
  return Math.abs(hash) % colors.length; // Ensuring the number is within the range of colors
};

interface Props {
  members: Member[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AssignedMembersAvatar({ members }: Props) {
  const memberColors = useMemo(() => {
    const colorMap = new Map<string, string>();

    members.forEach((member) => {
      if (!colorMap.has(member.id)) {
        const colorIndex = getColorIndex(member.id); // Compute color index
        colorMap.set(member.id, colors[colorIndex]); // Store it in the map
      }
    });

    return colorMap;
  }, [members]);

  return (
    members.length > 0 && (
      <div className="flex gap-[1px] ml-auto space-x-[1px]">
        {members.map((member) => {
          const randomColor = memberColors.get(member.id);
          return (
            <Avatar
              key={member.id}
              className="h-6 w-6 text-[10px] font-medium self-end"
            >
              <AvatarFallback
                title={`${member.firstName} ${member.lastName}`}
                key={member.id}
                className={`${randomColor}`}
              >
                {mergeInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>
    )
  );
}
