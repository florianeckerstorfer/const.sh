const fetch = require('node-fetch');

class Timeline {
  data() {
    return {
      permalink: '/covid19-at/timeline.csv',
      eleventyExcludeFromCollections: true,
    };
  }

  async render() {
    const response = await fetch(
      'https://covid19-dashboard.ages.at/data/CovidFaelle_Timeline.csv'
    );
    return await response.text();
  }
}

module.exports = Timeline;
