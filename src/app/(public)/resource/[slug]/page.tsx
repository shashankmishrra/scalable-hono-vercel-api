export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main>
      <h1>{slug}</h1>
      <p>Public resource page. Implemented in Phase 4.</p>
    </main>
  );
}
