import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

test('assistant Markdown renders formatting without executing raw HTML', () => {
  const markup = renderToStaticMarkup(createElement(
    ReactMarkdown,
    { skipHtml: true },
    '<script>alert("unsafe")</script>\n\n**safe**\n\n> quote\n\n```js\nconst value = 1;\n```',
  ));

  assert.equal(markup.includes('<script'), false);
  assert.equal(markup.includes('unsafe'), false);
  assert.match(markup, /<strong>safe<\/strong>/);
  assert.match(markup, /<blockquote>/);
  assert.match(markup, /<pre>/);
});
