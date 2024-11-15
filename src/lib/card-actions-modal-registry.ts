import dynamic from 'next/dynamic';

import AssignMemberToCardModal from '@/app/(dashboard)/boards/[id]/_components/assign-member-to-card';
import DeleteCardModal from '@/app/(dashboard)/boards/[id]/_components/delete-card-modal';
import AskAIModal from '@/app/(dashboard)/boards/[id]/_components/ask-ai-modal';
const CardDetails = dynamic(
  () => import('@/app/(dashboard)/boards/[id]/_components/card-details'),
  { ssr: false }
);

const modalRegistry = {
  ASSIGN_MEMBER: AssignMemberToCardModal,
  DELETE_CARD: DeleteCardModal,
  ASK_AI: AskAIModal,
  CARD_DETAILS: CardDetails,
} as const;

export default modalRegistry;
