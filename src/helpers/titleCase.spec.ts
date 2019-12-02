import test from 'ava';
import { titleCase } from './titleCase';

test('capitalise titles correctly', t => {
  t.is(titleCase('this is a title'), 'This is a Title');
  t.is(titleCase('rick and morty'), 'Rick and Morty');
  t.is(titleCase('the shawshank redemption'), 'The Shawshank Redemption');
});
