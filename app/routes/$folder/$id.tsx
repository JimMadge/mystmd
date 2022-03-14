import { redirect, useCatch, useLoaderData } from 'remix';
import type { LoaderFunction, LinksFunction } from 'remix';
import { getData, PageLoader } from '~/utils/loader.server';
import { GenericParent } from 'mystjs';
import { ReferencesProvider, ContentBlock } from '~/components';
import { getFolder } from '../../utils/params';
import { Footer } from '../../components/FooterLinks';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/katex@0.15.2/dist/katex.min.css',
      integrity:
        'sha384-MlJdn/WNKDGXveldHDdyRP1R4CTHr3FeuDNfhsLPYrq2t0UBkUdK2jyTnXPEK1NQ',
      crossOrigin: 'anonymous',
    },
  ];
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<PageLoader | Response> => {
  const folderName = params.folder;
  const folder = getFolder(folderName);
  if (!folder) {
    throw new Response('Article was not found', { status: 404 });
  }
  if (folder.index === params.id) {
    return redirect(`/${folderName}`);
  }
  const id = params.loadIndexPage ? folder.index : params.id;
  const loader = await getData(folderName, id).catch((e) => {
    console.log(e);
    return null;
  });
  if (!loader) throw new Response('Article was not found', { status: 404 });
  return loader;
};

export default function Page() {
  const article = useLoaderData<PageLoader>();
  const blocks = article.mdast.children as GenericParent[];
  return (
    <ReferencesProvider references={article.references}>
      <div>
        <h1 className="title">{article.frontmatter.title}</h1>
        {article.frontmatter.author && article.frontmatter.author.length > 0 && (
          <header className="not-prose mb-10">
            <ol>
              {article.frontmatter.author?.map((author, i) => (
                <li key={i}>{author}</li>
              ))}
            </ol>
          </header>
        )}
        {blocks.map((node, index) => {
          return <ContentBlock key={node.key} id={`${index}`} node={node} />;
        })}
        <Footer links={article.footer} />
      </div>
    </ReferencesProvider>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  // TODO: This can give a pointer to other pages in the space
  return (
    <div>
      {caught.status} {caught.statusText}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <>
      <h1>Test</h1>
      <div>Something went wrong.</div>
    </>
  );
}
