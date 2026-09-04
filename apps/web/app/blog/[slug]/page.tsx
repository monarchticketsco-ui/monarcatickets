import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, obtenerPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = obtenerPost(slug);
  if (!post) return {};
  return { title: `${post.titulo} — Monarca Tickets`, description: post.extracto };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = obtenerPost(slug);
  if (!post) notFound();

  return (
    <main className="container" style={{ maxWidth: 820, margin: "0 auto" }}>
      <p style={{ marginBottom: 24 }}>
        <Link href="/blog" className="text-link">
          ← Volver al blog
        </Link>
      </p>

      <p className="event-card-eyebrow">{post.categoria}</p>
      <h1>{post.titulo}</h1>
      <p className="muted" style={{ marginTop: -6, marginBottom: 28 }}>
        {new Date(post.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })} ·{" "}
        {post.minutosLectura} min de lectura
      </p>

      <div className="blog-card-media" style={{ borderRadius: "var(--radius-lg)", marginBottom: 28 }}>
        <img
          src={`https://images.unsplash.com/photo-${post.imagenId}?w=1200&q=70&auto=format&fit=crop`}
          alt=""
          style={{ width: "100%", borderRadius: "var(--radius-lg)" }}
        />
      </div>

      <div className="stack" style={{ gap: 18 }}>
        {post.cuerpo.map((parrafo, i) => (
          <p key={i}>{parrafo}</p>
        ))}
      </div>
    </main>
  );
}
