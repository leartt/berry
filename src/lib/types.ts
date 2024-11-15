import modalRegistry from '@/lib/card-actions-modal-registry';
import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
// import { Server as SocketIOServer } from 'socket.io';

import { Board, Card, Invitation, List, Member } from '@prisma/client';

// export type NextApiResponseServerIo = NextApiResponse & {
//   socket: Socket & {
//     server: NetServer & {
//       io: SocketIOServer;
//     };
//   };
// };

export type CardWithMembers = Card & { assignedTo: Member[] };
export type CardWithMembersWithList = CardWithMembers & { list: List };
export type ListWithCard = List & { cards: CardWithMembersWithList[] };

export type BoardWithInvitation = Board & { invitations: Invitation[] };
export type BoardWithInvitationWithMember = Board & {
  invitations: InvitationWithMembers[];
};
export type InvitationWithBoard = Invitation & { board: Board };
export type InvitationWithMembers = Invitation & { members: Member[] };
export type InvitationWithBoardWithMember = Invitation & {
  board: Board;
} & { member: Member };

// Modal types
export type ModalType = keyof typeof modalRegistry;
export type RequiredModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};
