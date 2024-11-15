import { Alert, AlertTitle, AlertDescription } from './ui/alert';

interface Props {
  variant: 'default' | 'success' | 'destructive';
  icon?: JSX.Element;
  title: string;
  description: string | JSX.Element | JSX.Element[];
}

const DisplayAlert = ({
  variant = 'default',
  icon,
  title,
  description,
}: Props) => {
  console.log(description);
  return (
    <Alert variant={variant}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default DisplayAlert;
