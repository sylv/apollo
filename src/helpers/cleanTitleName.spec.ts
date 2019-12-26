import { cleanTitleName } from './cleanTitleName';

describe('helpers/cleanTitleName', () => {
  it('should remove excess characters', () => {
    expect(cleanTitleName('scrubs-')).toEqual('Scrubs');
    expect(cleanTitleName('[pseudo] rick and morty - ]')).toEqual('Rick and Morty');
    expect(cleanTitleName('Avatar (TLoK) - Republic City Hustle')).toEqual('Avatar (TLoK) - Republic City Hustle');
  });

  it('should capitalise names correctly', () => {
    // titleCase.spec.ts will handle most of our tests
    expect(cleanTitleName('the wolf of wall street')).toEqual('The Wolf of Wall Street');
  });
});
