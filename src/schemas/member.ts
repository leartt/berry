import { z } from 'zod';

export const getBoardMembersSchema = z.object({
  boardId: z.string(),
});

export const removeMemberFromBoardSchema = z.object({
  boardId: z.string(),
  memberId: z.string(),
});
