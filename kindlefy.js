const { default: axios } = require('axios');
const cheerio = require('cheerio');

const convert = (mediumArticle) =>
  new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get(mediumArticle);

      const page = cheerio.load(data);
      console.log(page.xml());

      const publishedDate = new Date(
        page('meta[property="article:published_time"]').attr('content')
      )
        .toDateString()
        .split(' ')
        .slice(1);
      const publishedAt = `${publishedDate[0]} ${publishedDate[1]}, ${publishedDate[2]}`;

      const paragraphs = [];
      page('article > div section > div > div > p').each(function (i, el) {
        paragraphs.push(page(this).text());
      });

      return resolve({
        lang: page('html').attr('lang'),
        title: page('meta[property="og:title"]').attr('content'),
        description: page('meta[property="og:description"]').attr('content'),
        author: page('meta[name="author"]').attr('content'),
        publishedAt: publishedAt,
        readingTime: page('meta[name="twitter:data1"]').attr('content'),
        paragraphs: paragraphs,
      });
    } catch (error) {
      reject(error);
    }
  });

module.exports = {
  convert,
};
