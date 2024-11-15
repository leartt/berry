import DisplayAlert from './display-alert';

interface Props {
  result: {
    serverError?: string | undefined;
    validationErrors?: Record<string, string[] | undefined> | undefined;
    data?:
      | {
          message?: string | undefined;
        }
      | undefined;
    fetchError?: string | undefined;
  };
}

const DisplayServerActionResponse = ({ result }: Props) => {
  const hasErrors =
    result.validationErrors || result.serverError || result.fetchError;

  if (!hasErrors) return null;

  return (
    <>
      {result.serverError && (
        <DisplayAlert
          title="Error"
          variant="destructive"
          description={result.serverError}
        />
      )}
      {result.fetchError && (
        <DisplayAlert
          title="Error"
          variant="destructive"
          description={result.fetchError}
        />
      )}

      {result.validationErrors && (
        <DisplayAlert
          title="Error"
          variant="destructive"
          description={Object.keys(result.validationErrors).map((key) => (
            <div key={key}>
              {result.validationErrors?.[key]?.map((error, idx) => (
                <p key={idx}>{error}</p>
              ))}
            </div>
          ))}
        />
      )}
    </>
  );
};

export default DisplayServerActionResponse;
