const chai = require('chai');
const string = require('chai-string');
const parseFilter = require('../../dist/cjs/parse-filter').default;

chai.use(string);
const { expect } = chai;

describe('parseFilter', () => {
  it('parses a simple query w/ id only', () => {
    const filter = {
      id: '0c17b744-1ce8-4d42-af14-0ab90d6581d3',
    };
    const params = parseFilter(filter);
    expect(params).to.equalIgnoreSpaces(`
      filter[id-1-filter][condition][path]=id
      &filter[id-1-filter][condition][operator]=%3D
      &filter[id-1-filter][condition][value]=0c17b744-1ce8-4d42-af14-0ab90d6581d3
    `);
  });
  it('parses a more complex query', () => {
    const filter = {
      $or: [
        { status: 'done', count: { $gt: 35, $lt: 43 } },
        { id: '1234' },
      ],
    };
    const params = parseFilter(filter);
    expect(decodeURI(params)).to.equalIgnoreSpaces(`
      filter[group-1][group][conjunction]=OR
      &filter[status-2-filter][condition][path]=status
      &filter[status-2-filter][condition][operator]=%3D
      &filter[status-2-filter][condition][value]=done
      &filter[status-2-filter][condition][memberOf]=group-1
      &filter[count-1-filter][condition][path]=count
      &filter[count-1-filter][condition][operator]=>
      &filter[count-1-filter][condition][value]=35
      &filter[count-2-filter][condition][path]=count
      &filter[count-2-filter][condition][operator]=<
      &filter[count-2-filter][condition][value]=43
      &filter[id-3-filter][condition][path]=id
      &filter[id-3-filter][condition][operator]=%3D
      &filter[id-3-filter][condition][value]=1234
      &filter[id-3-filter][condition][memberOf]=group-1
  `);
  });
  it('parses a filter with dot notation', () => {
    const filter = { 'owner.id': 1 };
    const params = parseFilter(filter);
    expect(params).to.equalIgnoreSpaces(`
      filter[owner.id-1-filter][condition][path]=owner.id
      &filter[owner.id-1-filter][condition][operator]=%3D
      &filter[owner.id-1-filter][condition][value]=1
    `);
  });
  it('parses a filter with an array operator ($in)', () => {
    const filter = {
      log_category: {
        $in: ['soil', 'water'],
      },
    };
    const params = parseFilter(filter);
    expect(params).to.equalIgnoreSpaces(`
      filter[log_category-1-filter][condition][path]=log_category
      &filter[log_category-1-filter][condition][operator]=IN
      &filter[log_category-1-filter][condition][value][0]=soil
      &filter[log_category-1-filter][condition][value][1]=water
    `);
  });
  it('parses a filter with an array operator ($or)', () => {
    const filter = {
      land_type: {
        $or: ['field', 'bed'],
      },
    };
    const params = parseFilter(filter);
    expect(decodeURI(params)).to.equalIgnoreSpaces(`
      filter[group-1][group][conjunction]=OR
      &filter[land_type-2-filter][condition][path]=land_type
      &filter[land_type-2-filter][condition][operator]=%3D
      &filter[land_type-2-filter][condition][value]=field
      &filter[land_type-2-filter][condition][memberOf]=group-1
      &filter[land_type-3-filter][condition][path]=land_type
      &filter[land_type-3-filter][condition][operator]=%3D
      &filter[land_type-3-filter][condition][value]=bed
      &filter[land_type-3-filter][condition][memberOf]=group-1
    `);
  });
});
