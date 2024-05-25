import Layout from "@/components/Layout";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout>
      <Layout.LeftSide></Layout.LeftSide>
      <Layout.Content>{children}</Layout.Content>
      <Layout.RightSide></Layout.RightSide>
    </Layout>
  );
}
