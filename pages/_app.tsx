import 'nprogress/nprogress.css';
import '../styles/third-party.css';
import '../styles/style.css';
import 'react-loading-skeleton/dist/skeleton.css';
import '@contentstack/live-preview-utils/dist/main.css';

import { NextPageContext } from 'next';
import App from 'next/app';
import Head from 'next/head';
import Router from 'next/router';
import NProgress from 'nprogress';

import Personalization from '@contentstack/personalization-sdk-js';

import Layout from '../components/layout';
import {
  getAllEntries,
  getFooterRes,
  getHeaderRes,
} from '../helper';
import { Props } from '../typescript/pages';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

function MyApp(props: Props) {
  const { Component, pageProps, header, footer, entries } = props;
  const { page, posts, archivePost, blogPost } = pageProps;

  const metaData = (seo: any) => {
    const metaArr = [];
    for (const key in seo) {
      if (seo.enable_search_indexing) {
        metaArr.push(
          <meta
            name={
              key.includes('meta_')
                ? key.split('meta_')[1].toString()
                : key.toString()
            }
            content={seo[key].toString()}
            key={key}
          />
        );
      }
    }
    return metaArr;
  };
  const blogList: any = posts?.concat(archivePost);
  return (
    <>
      <Head>
        <meta
          name='application-name'
          content='Contentstack-Nextjs-Starter-App'
        />
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1,minimum-scale=1'
        />
        <meta name='theme-color' content='#317EFB' />
        <title>Contentstack-Nextjs-Starter-App</title>
        {page?.seo && page.seo.enable_search_indexing && metaData(page.seo)}
      </Head>
      <Layout
        header={header}
        footer={footer}
        page={page}
        blogPost={blogPost}
        blogList={blogList}
        entries={entries}
      >
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

function parseCookies(request: any) {
  const list: any = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie: any) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}

MyApp.getInitialProps = async (appContext: NextPageContext) => {
  let eclipseUserId: string;
  console.log('appContext', appContext);
  if (appContext.req) {
    console.log('has request');
    eclipseUserId = parseCookies(appContext.req).eclipseUser || Math.ceil(Math.random() * 100000).toString();

    (global.window as any) = {
      localStorage: {
        getItem: (key: any) => { return eclipseUserId },
        setItem: (key: any, value: any) => { },
      },
      location: {
        href: appContext.req?.url
      },
    };

    if (!Personalization.isInitialized()) {
      await Personalization.init('64ba2881284e3ddc8876ea6f');
    }

    appContext.res?.setHeader('Set-Cookie', `eclipseUser=${eclipseUserId}`);
  } else {
    console.log('does not have request');
  }

  const appProps = await App.getInitialProps(appContext as any);
  const header = await getHeaderRes();
  const footer = await getFooterRes();
  const entries = await getAllEntries();
  return { ...appProps, header, footer, entries };
};

export default MyApp;
