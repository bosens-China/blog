import Link from 'next/link';
import Image from 'next/image';
import img404 from '@/assets/img/404.svg';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center flex-col w-100vw h-100vh pos-fixed select-none">
      <Image src={img404} width={450} height={240} alt="404" draggable={false}></Image>
      <p className="font-400 text-4.5 lh-5.27 color-#999 ">
        找不到相关页面，请检查输入URL是否正确，点击
        <Link href="/" className="color-#0F7AE5">
          返回首页
        </Link>
      </p>
    </div>
  );
}
