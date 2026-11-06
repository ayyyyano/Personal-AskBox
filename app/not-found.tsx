import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell page-main not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <p className="eyebrow">页面未找到</p>
        <h1 id="not-found-title" className="page-title">404</h1>
        <p className="lede">你访问的页面不存在，或已经被移动。</p>
        <Link className="not-found-link" href="/" prefetch={false}>返回提问页</Link>
      </section>
    </main>
  );
}
