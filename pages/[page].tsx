import React, {
  useEffect,
  useState,
} from 'react';

import Skeleton from 'react-loading-skeleton';

import RenderComponents from '../components/render-components';
import { onEntryChange } from '../contentstack-sdk';
import { getPageRes } from '../helper';
import { Props } from '../typescript/pages';

export default function Page(props: Props) {
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
  }, [page]);

  return getEntry.page_components ? (
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

export async function getServerSideProps({ params, res }: any) {
  try {
    const entryUrl = params.page.includes('/') ? params.page : `/${params.page}`
    const entryRes = await getPageRes(entryUrl);
    if (!entryRes) throw new Error('404');
    res.setHeader(
      'X-Cache-Control',
      'public, s-maxage=3600'
    );
    console.log('I\'ve come to generic getServerSideProps');
    return {
      props: {
        entryUrl: entryUrl,
        page: entryRes,
      },
    };

  } catch (error) {
    return { notFound: true };
  }
}
