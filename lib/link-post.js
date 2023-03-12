const request = require('request');
const format = require('date-fns/format');
const fs = require('fs');
const startOfWeek = require('date-fns/startOfWeek');
const endOfWeek = require('date-fns/endOfWeek');
const now = new Date();
const from = format(startOfWeek(now), 'yyyy-MM-dd');
const publishDate = format(endOfWeek(now), 'yyyy-MM-dd 14:00:00');
const week = format(now, 'WW');
const year = format(now, 'yyyy');

function main() {
  request(
    'https://rss2json.glitch.me/?url=https://feeds.remysharp.com/links.xml',
    { json: true },
    (error, res, body) => {
      if (error) {
        console.log(error);
        process.exit(1);
      }

      const thisWeek = body.item.filter((_) => {
        const d = format(_.pubDate, 'yyyy-MM-dd');
        return d >= from;
      });

      fs.writeFileSync(
        __dirname + `/../public/blog/elsewhere-${year}-w${week}.md`,
        render(thisWeek),
        'utf8'
      );
    }
  );
}

function render(items) {
  return `---
title: 'Elsewhere ${year} w${week}'
date: '${publishDate}'
tags:
- web
---

# Elsewhere 2019 w${week}

A few interesting links I came across this week.

<!--more-->

${items
  .map(({ title, description, url, pubDate }) => {
    return `
<h2>${title}</h2>

<small>Found on ${format(pubDate, 'MMMM DD, yyyy \\a\\t H:mm a')}</small>

${description}

${description.includes(url) ? '' : `<p><a href="${url}">${url}</a></p>`}
`;
  })
  .join('')}

---

You can also follow [my links feed via RSS](https://feeds.remysharp.com/links.xml)
  `;
}

main();
