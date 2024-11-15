import { COLORS } from '@/lib/constants';
import { z } from 'zod';

export const createInvitationSchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'rejected'], {
      required_error: 'You need to select a status',
    })
    .default('pending'),
  boardId: z.string(),
  membersId: z.array(z.string()).min(1, {
    message: 'You need to select at least one member',
  }),
});

export const updateInvitationStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['accepted', 'rejected'], {
    required_error: 'You need to select a status',
  }),
});
