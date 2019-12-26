import { titleCase } from './titleCase';

describe('helpers/titleCase', () => {
  it('should capitalise titles properly', () => {
    expect(titleCase('this is a title')).toEqual('This is a Title');
    expect(titleCase('rick and morty')).toEqual('Rick and Morty');
    expect(titleCase(' rick and morty')).toEqual('Rick and Morty');
    expect(titleCase('the shawshank redemption')).toEqual('The Shawshank Redemption');
    expect(titleCase('x-men dark phoenix')).toEqual('X-Men Dark Phoenix');
    expect(titleCase('eps1.0_hellofriend.mov')).toEqual('eps1.0_hellofriend.mov');
  });
});
