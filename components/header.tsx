import React, { useState } from 'react';

import parse from 'html-react-parser';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Skeleton from 'react-loading-skeleton';

import { getHeaderRes } from '../helper';
import {
  Entry,
  HeaderProps,
  NavLinks,
} from '../typescript/layout';
import Tooltip from './tool-tip';

export default function Header({ header, entries }: { header: HeaderProps, entries: Entry }) {

  const router = useRouter();
  const [getHeader, setHeader] = useState(header);

  function buildNavigation(ent: Entry, hd: HeaderProps) {
    let newHeader = { ...hd };
    if (ent.length !== newHeader.navigation_menu.length) {
      ent.forEach((entry) => {
        const hFound = newHeader?.navigation_menu.find(
          (navLink: NavLinks) => navLink.label === entry.title
        );
        if (!hFound) {
          newHeader.navigation_menu?.push({
            label: entry.title,
            page_reference: [
              { title: entry.title, url: entry.url, $: entry.$ },
            ],
            $: {}
          });
        }
      });
    }
    return newHeader
  }

  async function fetchData() {
    try {
      if (header && entries) {
        const headerRes = await getHeaderRes();
        const newHeader = buildNavigation(entries, headerRes)
        setHeader(newHeader);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const headerData = getHeader ? getHeader : undefined;

  return (
    <header className='header'>
      <div className='note-div'>
        {headerData?.notification_bar.show_announcement ? (
          typeof headerData.notification_bar.announcement_text === 'string' && (
            <div>
              {parse(headerData.notification_bar.announcement_text)}
            </div>
          )
        ) : <></>}
      </div>
      <div className='max-width header-div'>
        <div className='wrapper-logo'>
          {headerData ? (
            <Link href='/'>
              <a className='logo-tag' title='Contentstack'>
                <img
                  className='logo'
                  src={headerData.logo.url}
                  alt={headerData.title}
                  title={headerData.title}
                  {...headerData.logo.$?.url as {}}
                />
              </a>
            </Link>
          ) : (
            <Skeleton width={150} />
          )}
        </div>
        <input className='menu-btn' type='checkbox' id='menu-btn' />
        <label className='menu-icon' htmlFor='menu-btn'>
          <span className='navicon' />
        </label>
        <nav className='menu'>
          <ul className='nav-ul header-ul'>
            {headerData ? (
              headerData.navigation_menu.map((list) => {
                const className =
                  router.asPath === list.page_reference[0].url ? 'active' : '';
                return (
                  <li
                    key={list.label}
                    className='nav-li'
                    {...list.page_reference[0].$?.url as {}}
                  >
                    <Link href={list.page_reference[0].url}>
                      <a className={className}>{list.label}</a>
                    </Link>
                  </li>
                );
              })
            ) : (
              <Skeleton width={300} />
            )}
          </ul>
        </nav>

        <div className='json-preview'>
          <Tooltip content='JSON Preview' direction='top' dynamic={false} delay={200} status={0}>
            <span data-bs-toggle='modal' data-bs-target='#staticBackdrop'>
              <img src='/json.svg' alt='JSON Preview icon' />
            </span>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}