export default function ListWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li className="flex-shrink-0 w-[285px] h-full select-none">{children}</li>
  );
}
