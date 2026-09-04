import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata = {
  title: "Blog — Monarca Tickets",
  description: "Guías y consejos para comprar y organizar eventos en Colombia.",
};

export default function BlogPage() {
  return (
    <main className="container">
      <div className="page-lede" style={{ marginBottom: 8 }}>
        <p className="event-card-eyebrow">Blog</p>
        <h1>Guías para vivir y organizar mejores eventos</h1>
        <p className="page-lede">Consejos prácticos para compradores y organizadores en Colombia.</p>
      </div>

      <ul className="blog-grid">
        {BLOG_POSTS.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="blog-card">
              <div className="blog-card-media">
                <img
                  src={`https://images.unsplash.com/photo-${post.imagenId}?w=700&q=70&auto=format&fit=crop`}
                  alt=""
                />
              </div>
              <div className="blog-card-body">
                <p className="blog-card-tag">{post.categoria}</p>
                <h3>{post.titulo}</h3>
                <p>{post.extracto}</p>
                <p className="blog-card-meta">
                  {new Date(post.fecha).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })} ·{" "}
                  {post.minutosLectura} min de lectura
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
