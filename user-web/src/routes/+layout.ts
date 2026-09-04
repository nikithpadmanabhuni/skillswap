// Universal load. In the real build this is +layout.server.ts reading a session
// cookie into locals.user (spec 5.2); the shape of `data.user` is already right.
export const prerender = true;
export const ssr = false;
export const trailingSlash = 'ignore';
