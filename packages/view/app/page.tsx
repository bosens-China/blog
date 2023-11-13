import "./styles.scss";
import Page from "./page/[page]/page";
// import { redirect } from "next/navigation";

export default function Home() {
  return <Page params={{ page: "1" }} searchParams={{}}></Page>;
  // return redirect("page/1");
}
