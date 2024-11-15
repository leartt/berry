import { SendInvitationEmailProps } from '@/actions/mail';

interface EmailTemplateProps extends SendInvitationEmailProps {}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  emails,
  inviter,
  boardName,
  boardId,
}) => (
  <div>
    <p>Hello,</p>
    <p>
      You've been invited to join "{boardName}" by{' '}
      <strong>{inviter.username}.</strong>
    </p>
    <p>Click the link below to view the invitation:</p>
    <a href={`http://localhost:3000/invitations`}>View Invitation</a>
  </div>
);
