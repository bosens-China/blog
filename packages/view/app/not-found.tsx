import Link from "next/link";

export default function notFound() {
  return (
    <p className="p-24">
      访问路径不正确，点击 <Link href="/">返回首页</Link>
    </p>
  );
}
