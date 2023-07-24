import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import Personalization from '@contentstack/personalization-sdk-js';

function parseCookies(request: NextRequest) {
  const list: any = {};
  const cookieHeader = request.headers?.get('cookie');
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

export async function middleware(request: NextRequest) {
  await Personalization.init('64ba2881284e3ddc8876ea6f');
  const eclipseUserId = parseCookies(request).eclipseUser || Math.ceil(Math.random() * 100000).toString();
  Personalization.set({
    userId: eclipseUserId
  });
  const activeVariation = Personalization.getActiveVariation('64ba333ee26922c8d020006d');
  const url = new URL(`${request.url}?personalize=${activeVariation}`);
  const response = NextResponse.rewrite(url);
  if (url.pathname === '/') {
    response.headers.set('CDN-Cache-Control', 'max-age=3600');
  }

  return response;
}