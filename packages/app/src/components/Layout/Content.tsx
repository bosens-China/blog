interface Props {
  children: React.ReactNode;
}

export default function Content(props: Props) {
  return <main className="m-x-40 flex-1">{props.children}</main>;
}
