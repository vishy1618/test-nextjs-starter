import React, {
  useEffect,
  useState,
} from 'react';

import Skeleton from 'react-loading-skeleton';

import RenderComponents from '../components/render-components';
import { onEntryChange } from '../contentstack-sdk';
import { getPageRes } from '../helper';
import {
  Context,
  Props,
} from '../typescript/pages';

export default function Home(props: Props) {

  const { page, entryUrl } = props;

  const [getEntry, setEntry] = useState(page);

  async function fetchData() {
    try {
      const entryRes = await getPageRes(entryUrl);
      if (!entryRes) throw new Error('Status code 404');
      setEntry(entryRes);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, []);

  return getEntry ? (
    <RenderComponents
      pageComponents={getEntry.page_components}
      contentTypeUid='page'
      entryUid={getEntry.uid}
      locale={getEntry.locale}
    />
  ) : (
    <Skeleton count={3} height={300} />
  );
}

export async function getServerSideProps(context: Context) {
  const pathname = new URL(`https://example.com${context.resolvedUrl}`).pathname;
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=3600'
  );
  try {
    const entryRes = await getPageRes(pathname);
    return {
      props: {
        entryUrl: pathname,
        page: entryRes,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
}
